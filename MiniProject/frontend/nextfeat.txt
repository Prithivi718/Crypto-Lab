# SecureNet — Secure Defence Communication Network

> A full-stack educational demonstration of secure defence communication using modern hybrid cryptography.

SecureNet is an interactive cryptographic communication platform designed to demonstrate how sensitive defence messages can be protected through a complete end-to-end security pipeline.

Instead of relying on a single cryptographic algorithm, SecureNet combines multiple cryptographic mechanisms, where each algorithm has a specific security responsibility.

---

## Overview

SecureNet demonstrates a secure communication flow between two simulated defence communication bases:

- **BASE-A** — Sender
- **BASE-B** — Receiver

A mission briefing or confidential text message is processed through a complete cryptographic workflow before being transmitted and recovered.

The system demonstrates:

- Identity authentication
- Secure key agreement
- Session-key derivation
- Session-key protection
- Authenticated encryption
- Digital signing
- Signature verification
- Session-key recovery
- Secure decryption
- Integrity and plaintext verification
- Execution timing and analysis

---

# Core Cryptographic Workflow

The central SecureNet pipeline is:

```text
                 SECURENET CRYPTOGRAPHIC PIPELINE

                         PLAINTEXT
                             │
                             ▼
                    ┌─────────────────┐
                    │    Ed25519      │
                    │  Authentication │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      ECDH       │
                    │  Key Agreement  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      HKDF       │
                    │ Session-Key     │
                    │   Derivation    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   RSA-OAEP      │
                    │ Session-Key     │
                    │    Wrapping     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AES-256-GCM   │
                    │   Encryption    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Packet        │
                    │   Signing       │
                    │   Ed25519       │
                    └────────┬────────┘
                             │
                             ▼
                       TRANSMISSION
                             │
                             ▼
                    ┌─────────────────┐
                    │    Ed25519      │
                    │    Signature    │
                    │   Verification  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    RSA-OAEP     │
                    │ Session-Key     │
                    │    Recovery     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AES-256-GCM   │
                    │   Decryption    │
                    └────────┬────────┘
                             │
                             ▼
                         PLAINTEXT