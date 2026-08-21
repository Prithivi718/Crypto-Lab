"use strict";

// -----------------------------
// RSA State
// -----------------------------
const RSA = {
    p: null,
    q: null,
    n: null,
    phi: null,
    e: null,
    d: null,
    mode: null,              // "number" or "text"
    ciphertextBlocks: [],
    lastPlaintext: ""
};

// -----------------------------
// Helpers
// -----------------------------
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function extendedGcd(a, b) {
    if (b === 0) {
        return { g: a, x: 1, y: 0 };
    }
    const { g, x: x1, y: y1 } = extendedGcd(b, a % b);
    return {
        g,
        x: y1,
        y: x1 - Math.floor(a / b) * y1
    };
}

function modInverse(e, phi) {
    const { g, x } = extendedGcd(e, phi);
    if (g !== 1) return null;
    return ((x % phi) + phi) % phi;
}

function modPow(base, exp, mod) {
    base = base % mod;
    let result = 1;

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
    }
    return result;
}

function isPrime(n) {
    n = Number(n);
    if (!Number.isInteger(n) || n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

function chooseE(phi) {
    // Start from 3 and pick the first odd e such that gcd(e, phi) = 1
    for (let candidate = 3; candidate < phi; candidate += 2) {
        if (gcd(candidate, phi) === 1) {
            return candidate;
        }
    }
    return null;
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setOutput(id, html) {
    document.getElementById(id).innerHTML = html;
}

// -----------------------------
// 1) Key Generation
// -----------------------------
function generateKeys() {
    const pVal = document.getElementById("primeP").value.trim();
    const qVal = document.getElementById("primeQ").value.trim();

    const p = Number(pVal);
    const q = Number(qVal);

    if (!isPrime(p) || !isPrime(q)) {
        setOutput(
            "keyOutput",
            `<span style="color:red;">Error:</span> p and q must both be prime numbers.`
        );
        return;
    }

    if (p === q) {
        setOutput(
            "keyOutput",
            `<span style="color:red;">Error:</span> p and q should be different primes for standard RSA demo.`
        );
        return;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = chooseE(phi);

    if (e === null) {
        setOutput(
            "keyOutput",
            `<span style="color:red;">Error:</span> Could not find a valid public exponent e.`
        );
        return;
    }

    const d = modInverse(e, phi);
    if (d === null) {
        setOutput(
            "keyOutput",
            `<span style="color:red;">Error:</span> Could not compute modular inverse for d.`
        );
        return;
    }

    RSA.p = p;
    RSA.q = q;
    RSA.n = n;
    RSA.phi = phi;
    RSA.e = e;
    RSA.d = d;
    RSA.mode = null;
    RSA.ciphertextBlocks = [];
    RSA.lastPlaintext = "";

    setOutput(
        "keyOutput",
        `
        <b>Generated RSA Keys</b><br><br>
        p = ${p}<br>
        q = ${q}<br>
        n = p × q = ${n}<br>
        φ(n) = (p − 1)(q − 1) = ${phi}<br>
        gcd(e, φ(n)) = 1 → e = ${e}<br>
        d is the modular inverse of e mod φ(n) = ${d}<br><br>
        <b>Public Key:</b> (${e}, ${n})<br>
        <b>Private Key:</b> (${d}, ${n})
        `
    );
}

// -----------------------------
// 2) Encryption
// -----------------------------
function encryptMessage() {
    if (RSA.n === null || RSA.e === null) {
        setOutput("encryptOutput", `<span style="color:red;">Generate keys first.</span>`);
        return;
    }

    const plaintext = document.getElementById("plaintext").value;
    if (!plaintext || plaintext.trim() === "") {
        setOutput("encryptOutput", `<span style="color:red;">Enter a plaintext message.</span>`);
        return;
    }

    const input = plaintext.trim();
    RSA.lastPlaintext = input;
    RSA.ciphertextBlocks = [];

    // Textbook mode:
    // If the input is purely numeric, treat it as one integer message M.
    // Otherwise encrypt character-by-character.
    const numericMode = /^\d+$/.test(input);

    if (numericMode) {
        const M = Number(input);

        if (M >= RSA.n) {
            setOutput(
                "encryptOutput",
                `<span style="color:red;">Error:</span> Message integer M must be smaller than n = ${RSA.n}.`
            );
            return;
        }

        const C = modPow(M, RSA.e, RSA.n);
        RSA.mode = "number";
        RSA.ciphertextBlocks = [C];

        setOutput(
            "encryptOutput",
            `
            <b>Textbook RSA Encryption</b><br><br>
            Plaintext M = ${M}<br>
            Ciphertext C = M<sup>e</sup> mod n = ${C}
            `
        );
        return;
    }

    // Text mode: encrypt each character independently
    RSA.mode = "text";
    const blocks = [];

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        const m = ch.charCodeAt(0);

        if (m >= RSA.n) {
            setOutput(
                "encryptOutput",
                `
                <span style="color:red;">
                Error: character "${escapeHtml(ch)}" has ASCII code ${m}, which is not smaller than n = ${RSA.n}.<br>
                Use larger primes or enter a numeric plaintext for textbook RSA.
                </span>
                `
            );
            RSA.ciphertextBlocks = [];
            return;
        }

        const c = modPow(m, RSA.e, RSA.n);
        blocks.push(c);
    }

    RSA.ciphertextBlocks = blocks;

    // Build step-by-step lines like the image
    let steps = "Encryption Process:\n" + "--------------------\n";
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        const m = ch.charCodeAt(0);
        const c = blocks[i];
        // e.g.  'H' (ASCII: 72)  -->  (72^7) mod 3233 = 1087
        steps += `'${ch}' (ASCII: ${m})  -->  (${m}^${RSA.e}) mod ${RSA.n} = ${c}\n`;
    }
    steps += `\nFinal Ciphertext Array: [${blocks.join(", ")}]`;

    setOutput(
        "encryptOutput",
        `<pre style="margin:0; font-family:monospace; line-height:1.7;">${escapeHtml(steps)}</pre>`
    );
}

// -----------------------------
// 3) Decryption
// -----------------------------
function decryptMessage() {
    if (RSA.n === null || RSA.d === null) {
        setOutput("decryptOutput", `<span style="color:red;">Generate keys first.</span>`);
        return;
    }

    let blocks = RSA.ciphertextBlocks.slice();

    // If nothing is stored, allow manual ciphertext entry through prompt
    if (blocks.length === 0) {
        const manual = prompt("Enter ciphertext blocks separated by spaces:");
        if (!manual) {
            setOutput(
                "decryptOutput",
                `<span style="color:red;">No ciphertext available to decrypt.</span>`
            );
            return;
        }

        blocks = manual
            .trim()
            .split(/[\s,]+/)
            .map(Number)
            .filter(v => !Number.isNaN(v));
    }

    if (blocks.length === 0) {
        setOutput(
            "decryptOutput",
            `<span style="color:red;">No valid ciphertext blocks found.</span>`
        );
        return;
    }

    // Numeric mode: one block → one integer plaintext
    if (RSA.mode === "number" && blocks.length === 1) {
        const C = blocks[0];
        const M = modPow(C, RSA.d, RSA.n);

        setOutput(
            "decryptOutput",
            `
            <b>Textbook RSA Decryption</b><br><br>
            Ciphertext C = ${C}<br>
            Plaintext M = C<sup>d</sup> mod n = ${M}
            `
        );
        return;
    }

    // Text mode: decrypt each block to a character
    const chars = [];
    for (const c of blocks) {
        const m = modPow(c, RSA.d, RSA.n);
        chars.push(String.fromCharCode(m));
    }

    const decrypted = chars.join("");

    // Build step-by-step lines mirroring the encryption format
    let steps = "Decryption Process:\n" + "--------------------\n";
    for (let i = 0; i < blocks.length; i++) {
        const c = blocks[i];
        const m = modPow(c, RSA.d, RSA.n);
        const ch = String.fromCharCode(m);
        // e.g.  1087  -->  (1087^d) mod n = 72  ('H')
        steps += `${c}  -->  (${c}^${RSA.d}) mod ${RSA.n} = ${m}  ('${ch}')\n`;
    }
    steps += `\nDecrypted Text: ${decrypted}`;

    setOutput(
        "decryptOutput",
        `<pre style="margin:0; font-family:monospace; line-height:1.7;">${escapeHtml(steps)}</pre>`
    );
}

// -----------------------------
// Optional: expose functions globally
// -----------------------------
window.generateKeys = generateKeys;
window.encryptMessage = encryptMessage;
window.decryptMessage = decryptMessage;