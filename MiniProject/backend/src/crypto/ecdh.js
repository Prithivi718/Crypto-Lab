// ECDH.js (Elliptical Curve Diffie Hellman)

import { webcrypto } from "crypto";
import { createECDH } from "crypto";

const crypto = webcrypto;

const CURVE_NAME = "prime256v1";


export const generateECDHKeyPair = () => {

    const ecdh = createECDH(CURVE_NAME);

    ecdh.generateKeys();

    return ecdh;
};


export const getPublicKey = (ecdh) => {

    return ecdh.getPublicKey();
};


export const getPrivateKey = (ecdh) => {

    return ecdh.getPrivateKey();
};


export const computeSharedSecret = (ecdh, otherPublicKey) => {

    if (!otherPublicKey) {
        throw new Error("Other party's public key is required");
    }

    return ecdh.computeSecret(otherPublicKey);
};