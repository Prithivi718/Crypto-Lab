export const CONCEPTS_DATA = [
    {
        id: '01',
        algorithm: 'ECDH',
        role: 'KEY AGREEMENT',
        shortDescription: 'Establish a shared secret.',
        description: 'Elliptic Curve Diffie-Hellman establishes a shared secret between two endpoints without transmitting the secret itself.'
    },
    {
        id: '02',
        algorithm: 'HKDF',
        role: 'KEY DERIVATION',
        shortDescription: 'Derive secure session keys.',
        description: 'HKDF derives cryptographically useful key material from the ECDH shared secret, producing the session key used by the symmetric encryption layer.'
    },
    {
        id: '03',
        algorithm: 'AES-256-GCM',
        role: 'AUTHENTICATED ENCRYPTION',
        shortDescription: 'Protect the mission payload.',
        description: 'AES-256-GCM encrypts the mission content while producing authentication data that allows the receiver to detect unauthorized modification.'
    },
    {
        id: '04',
        algorithm: 'RSA-OAEP',
        role: 'KEY WRAPPING',
        shortDescription: 'Protect the session key.',
        description: 'RSA-OAEP protects the derived session key for secure transport. The RSA layer wraps the session key rather than encrypting the full mission payload.'
    },
    {
        id: '05',
        algorithm: 'ED25519',
        role: 'DIGITAL SIGNATURES',
        shortDescription: 'Authenticate the packet.',
        description: 'Ed25519 creates a digital signature over the secure packet, allowing the receiving side to verify that the packet was produced by the corresponding signing key and has not been altered.'
    }
];
