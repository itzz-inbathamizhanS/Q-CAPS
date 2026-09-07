# A3 — Networking Foundations
**module_id:** `track_a_a3_networking_foundations`
**Level:** Beginner | **Estimated Time:** 130 minutes | **Track:** A — Foundations

## Learning Objectives
- Understand LAN/WAN, the OSI and TCP/IP models, and how data actually travels across a network.
- Understand IP addressing, DNS, DHCP, and the difference between TCP and UDP.
- Understand HTTP/HTTPS, routing/switching basics, and firewall/VPN fundamentals.

---

## 3.1 LAN/WAN
A **LAN (Local Area Network)** connects devices within a limited area (a home, office, campus). A **WAN (Wide Area Network)** connects LANs across larger distances — the internet itself is the largest WAN. Every scan Inba's scanner engine performs travels across this exact LAN → WAN → target-server path.

## 3.2 OSI and TCP/IP Models
The **OSI model** (7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application) is the conceptual reference model for how network communication is layered. The **TCP/IP model** (4 layers: Link, Internet, Transport, Application) is the practical model the real internet actually runs on. Understanding these layers matters directly for this course: TLS/SSL — the exact thing being scanned for PQC readiness — operates at the boundary between the Transport and Application layers.

## 3.3 IP Addressing and Subnetting
Every device on a network needs a unique **IP address** to be reachable. **Subnetting** divides a network into smaller segments — important for both network design and for understanding how organizations scope which assets are "in bounds" for an authorized security scan (a concept that becomes critical in the Organization module of full Q-CAPS).

## 3.4 IPv4 and IPv6
IPv4 uses 32-bit addresses (e.g., 192.168.1.1) and is running out of available addresses; IPv6 uses 128-bit addresses to solve this at internet scale. Both remain widely deployed today.

## 3.5 TCP/UDP
**TCP (Transmission Control Protocol)** is connection-oriented and guarantees delivery and order — used for web traffic, email, and virtually all TLS-protected connections. **UDP (User Datagram Protocol)** is connectionless and faster but doesn't guarantee delivery — used for video streaming, gaming, DNS lookups.

## 3.6 DNS and DHCP
**DNS (Domain Name System)** translates human-readable domain names (google.com) into IP addresses. **DHCP (Dynamic Host Configuration Protocol)** automatically assigns IP addresses to devices joining a network. Both are common attack surfaces in real-world cybersecurity, and DNS resolution is the very first step Inba's scanner performs before it can even connect to a target.

## 3.7 HTTP/HTTPS
**HTTP** is the protocol web browsers and servers use to communicate. **HTTPS** is HTTP secured by TLS — this is precisely the certificate and cryptographic handshake that the entire Q-CAPS platform is built to analyze for post-quantum readiness.

## 3.8 Routing and Switching
**Switches** connect devices within a LAN. **Routers** connect different networks together (e.g., your LAN to your ISP's WAN), making forwarding decisions based on IP addresses.

## 3.9 Firewalls and VPN Basics
A **firewall** filters network traffic based on rules (allow/block by port, IP, protocol). A **VPN (Virtual Private Network)** creates an encrypted tunnel between two points over an untrusted network — itself a real-world application of exactly the cryptography covered in PQC Foundations Module 1.

## 3.10 Network Monitoring
Basic awareness of tools and techniques for observing traffic and identifying anomalies — foundational for the "detection" stage of the Attack-to-Defense learning model used throughout Tracks B and C.

**🎨 Interactive/Visual Requirement:**
> Animated packet-journey diagram: user's browser → DNS lookup → TCP handshake → TLS handshake → HTTP request → server response, each step highlighted with a one-line explanation as it "travels" across a simple network diagram.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 3.1–3.10.
- Practical assessment: subnet a small network on paper/simulator and trace a full HTTPS request's journey through the OSI layers.
- Unlocks: `A4 — Cybersecurity Foundations`.
