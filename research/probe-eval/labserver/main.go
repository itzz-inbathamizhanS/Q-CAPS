// labserver is a TLS server with a known key-exchange configuration, for validating the probe.
//
//	labserver -addr 127.0.0.1:44330 -groups X25519MLKEM768,X25519 [-tls12]
//
// -groups lists the server's supported groups in its order of preference.
package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"flag"
	"io"
	"log"
	"math/big"
	"strings"
	"time"
)

var names = map[string]tls.CurveID{
	"X25519MLKEM768": tls.X25519MLKEM768, "X25519": tls.X25519,
	"P-256": tls.CurveP256, "P-384": tls.CurveP384,
}

func selfSigned() tls.Certificate {
	key, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	tmpl := &x509.Certificate{
		SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: "localhost"},
		DNSNames: []string{"localhost"}, NotBefore: time.Now().Add(-time.Hour), NotAfter: time.Now().Add(24 * time.Hour),
	}
	der, err := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &key.PublicKey, key)
	if err != nil {
		log.Fatal(err)
	}
	return tls.Certificate{Certificate: [][]byte{der}, PrivateKey: key}
}

func main() {
	addr := flag.String("addr", "127.0.0.1:44330", "listen address")
	groups := flag.String("groups", "", "comma-separated groups in preference order")
	tls12 := flag.Bool("tls12", false, "serve TLS 1.2 only")
	flag.Parse()
	cfg := &tls.Config{Certificates: []tls.Certificate{selfSigned()}}
	for _, g := range strings.Split(*groups, ",") {
		if g == "" {
			continue
		}
		id, ok := names[g]
		if !ok {
			log.Fatalf("unknown group %q", g)
		}
		cfg.CurvePreferences = append(cfg.CurvePreferences, id)
	}
	if *tls12 {
		cfg.MaxVersion = tls.VersionTLS12
	}
	ln, err := tls.Listen("tcp", *addr, cfg)
	if err != nil {
		log.Fatal(err)
	}
	for {
		c, err := ln.Accept()
		if err != nil {
			continue
		}
		go func() {
			defer c.Close()
			c.SetDeadline(time.Now().Add(5 * time.Second))
			io.Copy(io.Discard, c) // drives the handshake; the probe hangs up after the first record
		}()
	}
}
