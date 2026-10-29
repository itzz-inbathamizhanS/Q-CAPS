# Probe evaluation

Measures how accurately the scanner's empty-key-share TLS 1.3 probe
(`backend/scanner_api/scanner/crypto/raw_tls_client.py`) detects hybrid ML-KEM key exchange.

- `lab_eval.py` + `labserver/`: the probe against local Go TLS servers with known group configurations.
- `probe_eval.py` + `refcheck/`: the probe against the Tranco top domains, compared with full Go `crypto/tls`
  handshakes (one offering only X25519MLKEM768, one with Go's default groups).

The `probe-eval` workflow runs both on a GitHub-hosted runner and uploads the CSVs as an artifact. It refuses to
run the Internet measurement if a host known to support X25519MLKEM768 appears classical, which indicates a
TLS-intercepting network.

Ethics: public hosts only, one at a time with a one-second delay, at most two ClientHellos and two handshakes each.
Nothing else is requested from any host.
