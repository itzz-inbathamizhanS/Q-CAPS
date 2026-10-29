"""Evaluate the Q-CAPS TLS 1.3 key-exchange probe against a full-handshake reference.

For every host in a list it records:
  * the probe verdict (RawTLSProbe.probe_key_exchange: at most two ClientHellos, no handshake completed)
  * a reference verdict from Go crypto/tls (refcheck/) completing real handshakes:
      - offering X25519MLKEM768 only  -> does the server accept hybrid ML-KEM?
      - offering Go's default groups  -> which group does the server actually negotiate?
  * time taken by the probe and by the reference

Usage (run on a network WITHOUT TLS interception):
    python probe_eval.py --repo . --hosts hosts.txt --refcheck ./refcheck-bin --out results.csv
    python probe_eval.py --summarise results.csv

hosts.txt: one hostname per line (e.g. the top N of the Tranco list). Lines starting with # are ignored.
Ethics: at most two hellos and two handshakes per host, one host at a time, with a delay between hosts.
"""
import argparse
import csv
import ipaddress
import json
import socket
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

GROUP_NAMES = {
    0x11EC: "X25519MLKEM768", 0x11EB: "SecP256r1MLKEM768", 0x11ED: "SecP384r1MLKEM1024",
    0x6399: "X25519Kyber768Draft00", 0x001D: "x25519", 0x0017: "secp256r1", 0x0018: "secp384r1",
    0x0019: "secp521r1", 0x001E: "x448",
}
HYBRID_NAMES = {"X25519MLKEM768", "SecP256r1MLKEM768", "SecP384r1MLKEM1024", "X25519Kyber768Draft00"}
# A server known to accept X25519MLKEM768. If the probe says otherwise, TLS is being intercepted.
CANARY = "cloudflare.com"

FIELDS = ["host", "ip", "probe_tls13", "probe_hybrid", "probe_group", "probe_ms", "probe_hellos",
          "ref_hybrid", "ref_group", "ref_ms", "error"]


def load_probe(repo: Path):
    sys.path.insert(0, str(repo / "backend" / "scanner_api"))
    from scanner.crypto import raw_tls_client  # noqa: E402
    return raw_tls_client


def public_ipv4(host: str):
    try:
        infos = socket.getaddrinfo(host, 443, socket.AF_INET, socket.SOCK_STREAM)
    except socket.gaierror:
        return None
    for info in infos:
        ip = info[4][0]
        if ipaddress.ip_address(ip).is_global:
            return ip
    return None


def reference(refcheck: str, host: str, ip: str):
    """Full handshakes with Go crypto/tls (see refcheck/main.go): (hybrid accepted, negotiated default group)."""
    try:
        p = subprocess.run([refcheck, host, ip], capture_output=True, text=True, timeout=30)
        r = json.loads(p.stdout)
    except (subprocess.TimeoutExpired, json.JSONDecodeError):
        return None, None
    return r["hybrid_ok"], (r["default_group"] or None)


def evaluate(rtc, host: str, refcheck: str) -> dict:
    row = dict.fromkeys(FIELDS, "")
    row["host"] = host
    ip = public_ipv4(host)
    if not ip:
        row["error"] = "no public IPv4 address"
        return row
    row["ip"] = ip
    t0 = time.perf_counter()
    res = rtc.RawTLSProbe(host, [ip]).probe_key_exchange()
    row["probe_ms"] = round((time.perf_counter() - t0) * 1000, 1)
    row["probe_hellos"] = 1 if res["hybrid_only"] is None else 2
    row["probe_tls13"] = res["tls13_supported"]
    row["probe_hybrid"] = res["hybrid_pqc_supported"]
    row["probe_group"] = GROUP_NAMES.get(res["preferred_group"], res["preferred_group"])
    if res["first"]["outcome"] == "error":
        row["error"] = res["first"].get("reason", "")
    if refcheck:
        t0 = time.perf_counter()
        hybrid_ok, group = reference(refcheck, host, ip)
        row["ref_ms"] = round((time.perf_counter() - t0) * 1000, 1)
        row["ref_hybrid"] = hybrid_ok
        row["ref_group"] = group
    return row


def summarise(path: Path):
    rows = list(csv.DictReader(open(path, newline="", encoding="utf-8")))
    ok = [r for r in rows if not r["error"]]
    print(f"hosts: {len(rows)}  reachable: {len(ok)}")
    print("probe verdicts:", Counter(r["probe_hybrid"] for r in ok))
    print("preferred groups:", Counter(r["probe_group"] for r in ok).most_common(8))
    ref = [r for r in ok if r["ref_hybrid"] in ("True", "False") and r["probe_hybrid"] in ("True", "False")]
    if ref:
        cm = Counter((r["probe_hybrid"], r["ref_hybrid"]) for r in ref)
        tp, fp = cm[("True", "True")], cm[("True", "False")]
        fn, tn = cm[("False", "True")], cm[("False", "False")]
        print(f"vs reference (n={len(ref)}): TP={tp} FP={fp} FN={fn} TN={tn} "
              f"accuracy={(tp + tn) / len(ref):.3f}")
        undecided = sum(1 for r in ok if r["probe_hybrid"] in ("", "None"))
        print(f"probe undecided: {undecided}")
    for key in ("probe_ms", "ref_ms"):
        vals = sorted(float(r[key]) for r in ok if r[key])
        if vals:
            print(f"{key}: median={vals[len(vals) // 2]:.1f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", type=Path, help="path to the Q-CAPS repository")
    ap.add_argument("--hosts", type=Path)
    ap.add_argument("--out", type=Path, default=Path("results.csv"))
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between hosts")
    ap.add_argument("--refcheck", help="path to the built refcheck binary (reference handshakes)")
    ap.add_argument("--summarise", type=Path)
    a = ap.parse_args()
    if a.summarise:
        return summarise(a.summarise)
    rtc = load_probe(a.repo)
    canary_ip = public_ipv4(CANARY)
    if not canary_ip:
        sys.exit(f"Could not resolve {CANARY}: check DNS on this network.")
    canary = rtc.RawTLSProbe(CANARY, [canary_ip]).probe_key_exchange()
    if not canary["hybrid_pqc_supported"]:
        sys.exit(f"{CANARY} did not offer hybrid ML-KEM: TLS on this network is probably intercepted. Stop.")
    if not a.refcheck:
        print("No --refcheck binary: reference columns will be empty.", file=sys.stderr)
    hosts = [h.strip() for h in open(a.hosts, encoding="utf-8") if h.strip() and not h.startswith("#")]
    with open(a.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        for i, host in enumerate(hosts, 1):
            row = evaluate(rtc, host, a.refcheck)
            w.writerow(row)
            f.flush()
            print(f"[{i}/{len(hosts)}] {host}: probe={row['probe_hybrid']} ref={row['ref_hybrid']} {row['error']}")
            time.sleep(a.delay)
    summarise(a.out)


if __name__ == "__main__":
    main()
