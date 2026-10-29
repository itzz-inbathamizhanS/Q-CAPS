// refcheck completes real TLS 1.3 handshakes with Go's crypto/tls and reports the negotiated group.
// It is the reference the empty-key-share probe is compared against.
//
//	refcheck <hostname> <ip>
//
// prints JSON: {"hybrid_ok": bool, "hybrid_group": "...", "default_ok": bool, "default_group": "..."}
// hybrid_*: client offers only X25519MLKEM768. default_*: Go's default client groups
// (X25519MLKEM768 and X25519 with key shares, then the NIST curves).
package main

import (
	"crypto/tls"
	"encoding/json"
	"net"
	"os"
	"time"
)

func handshake(host, ip string, curves []tls.CurveID) (bool, string) {
	cfg := &tls.Config{
		ServerName: host,
		MinVersion: tls.VersionTLS13,
		// Only the key exchange is measured; certificate validity is out of scope.
		InsecureSkipVerify: true,
		CurvePreferences:   curves,
	}
	d := &net.Dialer{Timeout: 8 * time.Second}
	c, err := tls.DialWithDialer(d, "tcp", net.JoinHostPort(ip, "443"), cfg)
	if err != nil {
		return false, ""
	}
	defer c.Close()
	return true, c.ConnectionState().CurveID.String()
}

func main() {
	if len(os.Args) != 3 {
		os.Stderr.WriteString("usage: refcheck <hostname> <ip>\n")
		os.Exit(2)
	}
	host, ip := os.Args[1], os.Args[2]
	hOK, hGroup := handshake(host, ip, []tls.CurveID{tls.X25519MLKEM768})
	dOK, dGroup := handshake(host, ip, nil)
	json.NewEncoder(os.Stdout).Encode(map[string]any{
		"hybrid_ok": hOK, "hybrid_group": hGroup, "default_ok": dOK, "default_group": dGroup,
	})
}
