# B6 — Network & Security Engineering
**module_id:** `track_b_b6_network_security_engineering`
**Level:** Intermediate | **Estimated Time:** 150 minutes | **Track:** B — Engineering
**Prerequisite:** `A3`, `A4`

## Learning Objectives
- Apply advanced TCP/IP, routing, and VLAN concepts in security-focused contexts.
- Understand Zero Trust architecture and IAM at a practitioner level.
- Understand network segmentation, cloud networking, and secure protocol design.

---

## 6.1 Advanced TCP/IP
Building on A3.2–3.5, this section covers TCP/IP behavior under real operational conditions: connection state tracking, common misconfigurations, and how attackers exploit protocol-level assumptions.

## 6.2 Routing and Switching (Advanced)
Extending A3.8: dynamic routing protocols, redundancy, and how routing infrastructure itself becomes an attack target (e.g., BGP hijacking) — the network layer equivalent of the certificate-chain trust concerns raised throughout the cryptography content.

## 6.3 VLANs
**VLANs (Virtual LANs)** logically segment a single physical network into isolated broadcast domains — a foundational tool for the network segmentation strategy covered fully in 6.9.

## 6.4 VPNs (Advanced)
Building on A3.9's introduction, this section covers VPN architecture choices (site-to-site vs. remote-access), tunneling protocols, and — directly relevant to this entire program — how VPN cryptography (often IPsec or a TLS-based tunnel) is itself subject to the same PQC migration concerns as any other TLS deployment.

## 6.5 TLS (Engineering Depth)
Building on A5.10's handshake walkthrough, this section covers TLS from an engineering/operations perspective: cipher suite configuration, certificate management at scale, and common misconfigurations that weaken an otherwise-correct TLS deployment — directly relevant to what Inba's scanner engine is built to detect.

## 6.6 PKI (Engineering Depth)
Building on A5.9, this section covers operating a PKI at organizational scale: certificate lifecycle automation, internal vs. public CAs, and the practical challenges of certificate rotation — essential context for understanding why PQC certificate migration (covered in B11) is a genuinely difficult operational problem, not just a cryptographic one.

## 6.7 Zero Trust
**Zero Trust** is a security architecture philosophy: never automatically trust any device or user, whether inside or outside the network perimeter — every request is authenticated and authorized independently. This represents a significant shift from older "trusted internal network" models and is increasingly the default assumption in modern enterprise security architecture.

## 6.8 IAM (Identity and Access Management)
Building on A4.3's introduction to RBAC, this section covers IAM at an enterprise level: centralized identity providers, single sign-on (SSO), multi-factor authentication (MFA), and the operational challenge of managing access across many systems consistently.

## 6.9 Network Segmentation
The practice of dividing a network into isolated zones so that a compromise in one segment doesn't automatically grant access to others — implemented using the VLAN (6.3) and firewall (A3.9) concepts already covered, now applied as a deliberate defensive architecture strategy.

## 6.10 Cloud Networking
Modern infrastructure increasingly runs in cloud environments (AWS, Azure, GCP) with their own networking models — virtual private clouds, security groups, and cloud-native load balancing — requiring the same fundamental TCP/IP and TLS understanding applied to a different operational context.

## 6.11 Secure Protocols
A closing synthesis: reviewing which protocols (HTTPS, SSH, VPN protocols) provide which security properties, and why protocol choice itself is a security decision — directly setting up the "what's actually vulnerable and where" mindset needed for B8's Quantum Threats module.

**🎨 Interactive/Visual Requirement:**
> Interactive network topology builder: user drags network zones (DMZ, internal, cloud) and connects them with firewalls/VLANs, receiving feedback on whether the resulting segmentation follows Zero Trust principles.

---

## Module Wrap-Up
- Knowledge check quiz covering sections 6.1–6.11.
- Practical assessment: design a segmented network architecture for a small hypothetical organization, justifying each segmentation and access-control decision.
- Unlocks: `B7 — Advanced Cryptography`.
