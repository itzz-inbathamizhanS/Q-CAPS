"""Experiment 1: the probe against local servers whose key-exchange configuration is known.

Starts refcheck's sibling, labserver (Go crypto/tls), once per configuration and probes it repeatedly.
Usage: python lab_eval.py --repo . --labserver ./labserver-bin --out lab_results.csv
"""
import argparse
import csv
import statistics
import subprocess
import sys
import time
from collections import defaultdict
from pathlib import Path

# name, labserver flags, expected hybrid support (as the server is configured)
CONFIGS = [
    ("hybrid_only", ["-groups", "X25519MLKEM768"], True),
    ("hybrid_first", ["-groups", "X25519MLKEM768,X25519"], True),
    ("classical_first", ["-groups", "X25519,X25519MLKEM768"], True),
    ("classical_only", ["-groups", "X25519,P-256"], False),
    ("p256_only", ["-groups", "P-256"], False),
    ("tls12_only", ["-tls12"], False),
]
NAMES = {0x11EC: "X25519MLKEM768", 0x001D: "x25519", 0x0017: "secp256r1", 0x0018: "secp384r1"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", type=Path, required=True)
    ap.add_argument("--labserver", required=True)
    ap.add_argument("--port", type=int, default=44330)
    ap.add_argument("--runs", type=int, default=20)
    ap.add_argument("--out", type=Path, default=Path("lab_results.csv"))
    a = ap.parse_args()
    sys.path.insert(0, str(a.repo / "backend" / "scanner_api"))
    from scanner.crypto import raw_tls_client as rtc

    rows = []
    for name, flags, expected in CONFIGS:
        srv = subprocess.Popen([a.labserver, "-addr", f"127.0.0.1:{a.port}"] + flags)
        time.sleep(1.0)
        try:
            for run in range(a.runs):
                t0 = time.perf_counter()
                r = rtc.RawTLSProbe("localhost", ["127.0.0.1"], port=a.port).probe_key_exchange()
                rows.append({"config": name, "run": run, "expected_hybrid": expected,
                             "probe_hybrid": r["hybrid_pqc_supported"], "probe_tls13": r["tls13_supported"],
                             "probe_group": NAMES.get(r["preferred_group"], r["preferred_group"]),
                             "hellos": 1 if r["hybrid_only"] is None else 2,
                             "ms": round((time.perf_counter() - t0) * 1000, 2)})
        finally:
            srv.kill()
            srv.wait()

    with open(a.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

    by = defaultdict(list)
    for r in rows:
        by[r["config"]].append(r)
    print(f"{'config':16} {'expected':8} {'agree':>7} {'group seen':16} {'hellos':6} {'median ms':>9}")
    for name, rs in by.items():
        agree = sum(r["probe_hybrid"] == r["expected_hybrid"] for r in rs)
        groups = ",".join(sorted({str(r["probe_group"]) for r in rs}))
        hellos = ",".join(sorted({str(r["hellos"]) for r in rs}))
        print(f"{name:16} {str(rs[0]['expected_hybrid']):8} {agree:>3}/{len(rs):<3} {groups:16} {hellos:6} "
              f"{statistics.median(r['ms'] for r in rs):9.2f}")


if __name__ == "__main__":
    main()
