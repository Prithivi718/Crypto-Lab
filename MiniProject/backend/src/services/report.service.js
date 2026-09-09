/**
 * report.service.js
 * Central aggregation and orchestration service for SecureNet demonstration reports.
 * Loads complete Execution Context from executionStore, collects benchmark metrics,
 * and formats full unmasked downloadable reports in TXT and PDF formats.
 */

import PDFDocument from 'pdfkit';
import { getExecution } from './executionStore.js';
import { analyzeExecution } from './benchmark.service.js';
import { maskSensitive } from '../utils/maskSensitive.js';

/**
 * Collects full unmasked execution context + benchmark metrics for report generation.
 * @param {string} executionId 
 * @returns {Object} Complete unmasked report data object
 */
export const generateReportData = (executionId) => {
    const execution = getExecution(executionId);

    if (!execution) {
        throw new Error(`Execution Context not found for ID: ${executionId}`);
    }

    // Analyze execution measurements using benchmark service
    const benchmarkAnalysis = analyzeExecution(execution);

    const rawInput = execution.input || {};
    const mat = execution.cryptographicMaterial || {};
    const verif = execution.verification || {};
    const times = execution.measurements?.times || {};
    const sizes = execution.measurements?.sizes || {};

    const plaintext = rawInput.message || '';
    const filename = rawInput.filename || 'mission.txt';
    const inputSize = rawInput.size || (plaintext ? Buffer.byteLength(plaintext) : 0);

    // Build unmasked steps 1-9 details
    const steps = [
        {
            step: 1,
            phase: 'encryption',
            algorithm: 'Ed25519',
            title: '01 / ED25519 AUTHENTICATION',
            description: 'Sender Ed25519 signing key pair generation.',
            durationMs: times.ed25519Gen || 0,
            status: 'passed',
            input: { description: 'Sender identity initialization (BASE-A)' },
            output: {
                edPublicKey: mat.ed25519?.edPublicKey || '',
                edPrivateKey: mat.ed25519?.edPrivateKey || ''
            }
        },
        {
            step: 2,
            phase: 'encryption',
            algorithm: 'ECDH',
            title: '02 / ECDH KEY EXCHANGE',
            description: 'Independent Curve25519 ECDH key agreement to derive shared secret.',
            durationMs: times.ecdhExchange || 0,
            status: 'passed',
            input: { description: 'Endpoint A and Endpoint B public/private key pairs' },
            output: {
                baseAPublicKey: mat.ecdh?.baseAPublicKey || '',
                baseBPublicKey: mat.ecdh?.baseBPublicKey || '',
                sharedSecret: mat.ecdh?.sharedSecret || '',
                sharedSecretsMatch: verif.sharedSecretsMatch !== undefined ? verif.sharedSecretsMatch : true
            }
        },
        {
            step: 3,
            phase: 'encryption',
            algorithm: 'HKDF',
            title: '03 / HKDF KEY DERIVATION',
            description: 'Derive 256-bit AES session key using HMAC-SHA256 Key Derivation Function.',
            durationMs: times.hkdfDerivation || 0,
            status: 'passed',
            input: { description: 'ECDH shared secret' },
            output: {
                salt: mat.hkdf?.salt || '9e410000000000000000000000000000',
                info: mat.hkdf?.hkdfInfo || '7365637572656e65742d73657373696f6e',
                sessionKey: mat.hkdf?.sessionKey || mat.aes?.sessionKey || '',
                sessionKeyLengthBytes: sizes.sessionKey || 32
            }
        },
        {
            step: 4,
            phase: 'encryption',
            algorithm: 'RSA-OAEP',
            title: '04 / RSA-OAEP KEY PROTECTION',
            description: 'Wrap AES session key using receiver 2048-bit RSA-OAEP public key.',
            durationMs: (times.rsaGen || 0) + (times.rsaWrap || 0),
            status: 'passed',
            input: { description: 'AES session key + receiver RSA public key' },
            output: {
                rsaPublicKey: mat.rsa?.rsaPublicKey || '',
                rsaPrivateKey: mat.rsa?.rsaPrivateKey || '',
                wrappedSessionKey: mat.rsa?.wrappedSessionKey || '',
                wrappedSessionKeySizeBytes: sizes.wrappedSessionKey || 256
            }
        },
        {
            step: 5,
            phase: 'encryption',
            algorithm: 'AES-256-GCM',
            title: '05 / AES-256-GCM MESSAGE ENCRYPTION',
            description: 'Encrypt mission plaintext using AES-256-GCM authenticated encryption.',
            durationMs: times.aesEncryption || 0,
            status: 'passed',
            input: { plaintext, sessionKey: mat.aes?.sessionKey || '' },
            output: {
                ciphertext: mat.aes?.ciphertext || '',
                iv: mat.aes?.iv || '',
                authTag: mat.aes?.authTag || '',
                ciphertextSizeBytes: sizes.ciphertext || 0,
                ivSizeBytes: sizes.iv || 12,
                authTagSizeBytes: sizes.authTag || 16
            }
        },
        {
            step: 6,
            phase: 'encryption',
            algorithm: 'Ed25519',
            title: '06 / PACKET SIGNING',
            description: 'Assemble secure transmission payload and sign with sender Ed25519 private key.',
            durationMs: times.ed25519Sign || 0,
            status: 'passed',
            input: { description: 'Assembled secure payload (senderId, ecdhPublicKey, wrappedSessionKey, ciphertext, iv, authTag)' },
            output: {
                signature: mat.signature?.signature || '',
                signatureSizeBytes: sizes.signature || 64
            }
        },
        {
            step: 7,
            phase: 'decryption',
            algorithm: 'Ed25519',
            title: '07 / SIGNATURE VERIFICATION',
            description: 'Verify packet digital signature using sender Ed25519 public key.',
            durationMs: times.ed25519Verify || 0,
            status: 'passed',
            input: { description: 'Received secure packet + Ed25519 signature' },
            output: {
                signatureValid: verif.signatureValid !== undefined ? verif.signatureValid : true
            }
        },
        {
            step: 8,
            phase: 'decryption',
            algorithm: 'RSA-OAEP',
            title: '08 / RSA SESSION KEY RECOVERY',
            description: 'Unwrap and recover AES session key using receiver RSA-OAEP private key.',
            durationMs: times.rsaUnwrap || 0,
            status: 'passed',
            input: { description: 'Wrapped session key + receiver RSA private key' },
            output: {
                recoveredSessionKey: mat.rsa?.recoveredSessionKey || mat.aes?.sessionKey || ''
            }
        },
        {
            step: 9,
            phase: 'decryption',
            algorithm: 'AES-256-GCM',
            title: '09 / AES-256-GCM DECRYPTION',
            description: 'Decrypt ciphertext using recovered session key and verify authentication tag.',
            durationMs: times.aesDecryption || 0,
            status: 'passed',
            input: {
                ciphertext: mat.aes?.ciphertext || '',
                recoveredSessionKey: mat.rsa?.recoveredSessionKey || mat.aes?.sessionKey || '',
                iv: mat.aes?.iv || '',
                authTag: mat.aes?.authTag || ''
            },
            output: {
                decryptedPlaintext: execution.process?.decryption?.plaintext || plaintext,
                decryptionSuccess: verif.decryptionSuccess !== undefined ? verif.decryptionSuccess : true,
                plaintextMatch: verif.plaintextMatch !== undefined ? verif.plaintextMatch : true
            }
        }
    ];

    return {
        summary: {
            executionId: execution.executionId,
            filename,
            inputSize,
            status: execution.status,
            createdAt: execution.createdAt,
            completedAt: execution.completedAt
        },
        input: {
            plaintext,
            filename,
            size: inputSize
        },
        steps,
        cryptographicMaterial: {
            ed25519: {
                edPublicKey: mat.ed25519?.edPublicKey || '',
                edPrivateKey: mat.ed25519?.edPrivateKey || ''
            },
            ecdh: {
                baseAPublicKey: mat.ecdh?.baseAPublicKey || '',
                baseBPublicKey: mat.ecdh?.baseBPublicKey || '',
                sharedSecret: mat.ecdh?.sharedSecret || ''
            },
            hkdf: {
                salt: mat.hkdf?.salt || '9e410000000000000000000000000000',
                info: mat.hkdf?.hkdfInfo || '7365637572656e65742d73657373696f6e',
                sessionKey: mat.hkdf?.sessionKey || mat.aes?.sessionKey || ''
            },
            rsa: {
                rsaPublicKey: mat.rsa?.rsaPublicKey || '',
                rsaPrivateKey: mat.rsa?.rsaPrivateKey || '',
                wrappedSessionKey: mat.rsa?.wrappedSessionKey || '',
                recoveredSessionKey: mat.rsa?.recoveredSessionKey || ''
            },
            aes: {
                sessionKey: mat.aes?.sessionKey || '',
                ciphertext: mat.aes?.ciphertext || '',
                iv: mat.aes?.iv || '',
                authTag: mat.aes?.authTag || ''
            },
            signature: {
                signature: mat.signature?.signature || ''
            }
        },
        verification: {
            sharedSecretsMatch: verif.sharedSecretsMatch !== undefined ? verif.sharedSecretsMatch : (execution.status === 'completed'),
            signatureValid: verif.signatureValid !== undefined ? verif.signatureValid : (execution.status === 'completed'),
            decryptionSuccess: verif.decryptionSuccess !== undefined ? verif.decryptionSuccess : (execution.status === 'completed'),
            plaintextMatch: verif.plaintextMatch !== undefined ? verif.plaintextMatch : (execution.status === 'completed'),
            finalStatus: execution.status === 'completed' ? 'TRANSMISSION VERIFIED' : 'TRANSMISSION FAILED'
        },
        benchmark: benchmarkAnalysis
    };
};

/**
 * Generates a textual report (TXT) containing complete unmasked cryptographic data.
 * @param {string} executionId 
 * @returns {Buffer} UTF-8 text file buffer
 */
export const generateReportText = (executionId) => {
    const data = generateReportData(executionId);

    const divider = '='.repeat(80);
    const subDivider = '-'.repeat(80);

    const lines = [
        divider,
        '         SECURENET DEFENCE COMMUNICATION NETWORK - CRITICAL ANALYSIS REPORT         ',
        divider,
        `Execution ID    : ${data.summary.executionId}`,
        `Filename        : ${data.summary.filename}`,
        `Payload Size    : ${data.summary.inputSize} bytes`,
        `Created At      : ${data.summary.createdAt}`,
        `Completed At    : ${data.summary.completedAt || 'N/A'}`,
        `Overall Status  : ${data.summary.status.toUpperCase()}`,
        `Final Status    : ${data.verification.finalStatus}`,
        divider,
        '',
        '--- 1. MISSION INPUT PLAINTEXT ---',
        data.input.plaintext,
        '',
        '--- 2. STEP-BY-STEP CRYPTOGRAPHIC PIPELINE (9 STEPS) ---',
        ''
    ];

    data.steps.forEach((st) => {
        lines.push(subDivider);
        lines.push(`STEP ${st.step}: ${st.title}`);
        lines.push(`Phase      : ${st.phase.toUpperCase()} | Algorithm: ${st.algorithm} | Duration: ${st.durationMs} ms`);
        lines.push(`Description: ${st.description}`);
        lines.push('Input Details :');
        Object.entries(st.input).forEach(([k, v]) => {
            lines.push(`  - ${k}: ${v}`);
        });
        lines.push('Output Details:');
        Object.entries(st.output).forEach(([k, v]) => {
            lines.push(`  - ${k}: ${v}`);
        });
        lines.push('');
    });

    lines.push(divider);
    lines.push('--- 3. COMPLETE UNMASKED CRYPTOGRAPHIC MATERIAL INVENTORY ---');
    lines.push(divider);
    lines.push('Ed25519 Keys:');
    lines.push(`  - Public Key  : ${data.cryptographicMaterial.ed25519.edPublicKey}`);
    lines.push(`  - Private Key : ${data.cryptographicMaterial.ed25519.edPrivateKey}`);
    lines.push('ECDH Key Exchange:');
    lines.push(`  - Base A Public Key  : ${data.cryptographicMaterial.ecdh.baseAPublicKey}`);
    lines.push(`  - Base B Public Key  : ${data.cryptographicMaterial.ecdh.baseBPublicKey}`);
    lines.push(`  - Shared Secret      : ${data.cryptographicMaterial.ecdh.sharedSecret}`);
    lines.push('HKDF Derivation:');
    lines.push(`  - Salt               : ${data.cryptographicMaterial.hkdf.salt}`);
    lines.push(`  - Info               : ${data.cryptographicMaterial.hkdf.info}`);
    lines.push(`  - Session Key        : ${data.cryptographicMaterial.hkdf.sessionKey}`);
    lines.push('RSA-OAEP Protection:');
    lines.push(`  - Public Key         : ${data.cryptographicMaterial.rsa.rsaPublicKey}`);
    lines.push(`  - Private Key        : ${data.cryptographicMaterial.rsa.rsaPrivateKey}`);
    lines.push(`  - Wrapped Session Key: ${data.cryptographicMaterial.rsa.wrappedSessionKey}`);
    lines.push(`  - Recovered Key      : ${data.cryptographicMaterial.rsa.recoveredSessionKey}`);
    lines.push('AES-256-GCM Encryption:');
    lines.push(`  - Session Key        : ${data.cryptographicMaterial.aes.sessionKey}`);
    lines.push(`  - IV (Nonce)         : ${data.cryptographicMaterial.aes.iv}`);
    lines.push(`  - Auth Tag           : ${data.cryptographicMaterial.aes.authTag}`);
    lines.push(`  - Ciphertext         : ${data.cryptographicMaterial.aes.ciphertext}`);
    lines.push('Digital Signature:');
    lines.push(`  - Ed25519 Signature  : ${data.cryptographicMaterial.signature.signature}`);
    lines.push('');

    lines.push(divider);
    lines.push('--- 4. INTEGRITY VERIFICATION MATRIX ---');
    lines.push(divider);
    lines.push(`Shared Secrets Match    : ${data.verification.sharedSecretsMatch ? 'PASSED' : 'FAILED'}`);
    lines.push(`Digital Signature Valid : ${data.verification.signatureValid ? 'PASSED' : 'FAILED'}`);
    lines.push(`AES Decryption Success  : ${data.verification.decryptionSuccess ? 'PASSED' : 'FAILED'}`);
    lines.push(`Plaintext Integrity     : ${data.verification.plaintextMatch ? 'MATCHED' : 'MISMATCHED'}`);
    lines.push(`Final System Status     : ${data.verification.finalStatus}`);
    lines.push('');

    lines.push(divider);
    lines.push('--- 5. PERFORMANCE BENCHMARK & TIMING METRICS ---');
    lines.push(divider);
    const ops = data.benchmark.timing?.operations || {};
    Object.entries(ops).forEach(([op, timeMs]) => {
        lines.push(`  - ${op.padEnd(20)} : ${timeMs} ms`);
    });
    lines.push(subDivider);
    lines.push(`Encryption Phase Total  : ${data.benchmark.timing?.encryptionPhaseMs} ms`);
    lines.push(`Decryption Phase Total  : ${data.benchmark.timing?.decryptionPhaseMs} ms`);
    lines.push(`Total Elapsed Pipeline  : ${data.benchmark.timing?.totalElapsedMs} ms`);
    lines.push(`Fastest Operation       : ${data.benchmark.analysis?.fastestOperation}`);
    lines.push(`Slowest Operation       : ${data.benchmark.analysis?.slowestOperation}`);
    lines.push(`Throughput              : ${data.benchmark.analysis?.throughputKBps} KB/sec`);
    lines.push(divider);
    lines.push('                             END OF REPORT                             ');
    lines.push(divider);

    return Buffer.from(lines.join('\n'), 'utf-8');
};

/**
 * Generates a formatted PDF document containing complete unmasked cryptographic data.
 * @param {string} executionId 
 * @returns {Promise<Buffer>} PDF file buffer
 */
export const generateReportPDF = (executionId) => {
    const data = generateReportData(executionId);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 55,
                    bottom: 55,
                    left: 48,
                    right: 48,
                },
                info: {
                    Title: 'SecureNet Cryptographic Execution Report',
                    Author: 'SecureNet Defence Communication Network',
                    Subject: 'Cryptographic Execution and Verification Report',
                },
                bufferPages: true,
            });

            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            /* ============================================================
             * SECURENET COLOR PALETTE
             * ============================================================
             */

            const C = {
                // Main brand / tactical colors
                oliveDark: '#2B310A',
                olive: '#4B5320',
                oliveMid: '#6A7337',
                oliveSoft: '#929A68',

                // Page
                paper: '#F5F4EE',
                paperAlt: '#ECEBE2',

                // Text
                text: '#25291B',
                textSoft: '#4E5341',
                muted: '#727766',

                // Borders
                border: '#C5C8B5',
                borderDark: '#92977D',

                // Status
                success: '#4F6F32',
                successBg: '#EAF0E1',
                danger: '#9B433A',
                dangerBg: '#F5E7E5',

                // Code / cryptographic values
                codeBg: '#EEF0E8',
                codeText: '#34401D',

                white: '#FFFFFF',
            };

            const PAGE = {
                width: doc.page.width,
                height: doc.page.height,
                left: doc.page.margins.left,
                right: doc.page.width - doc.page.margins.right,
                top: doc.page.margins.top,
                bottom: doc.page.height - doc.page.margins.bottom,
                contentWidth:
                    doc.page.width -
                    doc.page.margins.left -
                    doc.page.margins.right,
            };

            /* ============================================================
             * FONT HELPERS
             * ============================================================
             */

            const setBody = () => {
                doc.font('Helvetica').fontSize(9).fillColor(C.text);
            };

            const setMono = () => {
                doc.font('Courier').fontSize(7.5).fillColor(C.codeText);
            };

            /* ============================================================
             * PAGE HEADER / FOOTER
             * ============================================================
             */

            const drawPageChrome = (pageNumber) => {
                // Header rule
                doc
                    .moveTo(PAGE.left, 32)
                    .lineTo(PAGE.right, 32)
                    .lineWidth(1)
                    .strokeColor(C.olive)
                    .stroke();

                doc
                    .font('Helvetica-Bold')
                    .fontSize(7)
                    .fillColor(C.olive)
                    .text(
                        'SECURENET DEFENCE COMMUNICATION NETWORK',
                        PAGE.left,
                        18,
                        {
                            width: PAGE.contentWidth,
                            align: 'left',
                        }
                    );

                doc
                    .font('Helvetica')
                    .fontSize(7)
                    .fillColor(C.muted)
                    .text(
                        `EXECUTION REPORT  /  ${executionId}`,
                        PAGE.left,
                        18,
                        {
                            width: PAGE.contentWidth,
                            align: 'right',
                        }
                    );

                // Footer
                doc
                    .moveTo(PAGE.left, PAGE.height - 32)
                    .lineTo(PAGE.right, PAGE.height - 32)
                    .lineWidth(0.75)
                    .strokeColor(C.border)
                    .stroke();

                doc
                    .font('Helvetica')
                    .fontSize(7)
                    .fillColor(C.muted)
                    .text(
                        'SECURENET  |  CRYPTOGRAPHIC EXECUTION & VERIFICATION',
                        PAGE.left,
                        PAGE.height - 23,
                        {
                            width: PAGE.contentWidth / 2,
                            align: 'left',
                        }
                    );

                doc
                    .text(
                        `PAGE ${pageNumber}`,
                        PAGE.right - 80,
                        PAGE.height - 23,
                        {
                            width: 80,
                            align: 'right',
                        }
                    );
            };

            let currentPage = 1;

            drawPageChrome(currentPage);

            /* ============================================================
             * PAGE MANAGEMENT
             * ============================================================
             */

            const newPage = () => {
                doc.addPage();
                currentPage += 1;
                drawPageChrome(currentPage);
                doc.y = PAGE.top;
            };

            const ensureSpace = (heightNeeded) => {
                const remaining = PAGE.bottom - doc.y;

                if (remaining < heightNeeded) {
                    newPage();
                    return true;
                }

                return false;
            };

            /* ============================================================
             * GENERAL TEXT UTILITIES
             * ============================================================
             */

            const normalizeValue = (value) => {
                if (value === null || value === undefined) {
                    return 'N/A';
                }

                // Prevent ugly JS object representations
                if (value instanceof Uint8Array) {
                    return Buffer.from(value).toString('hex');
                }

                if (typeof value === 'object') {
                    if (
                        value.constructor?.name === 'CryptoKey' ||
                        String(value) === '[object CryptoKey]'
                    ) {
                        return '[CRYPTOGRAPHIC KEY OBJECT]';
                    }

                    if (
                        value.constructor?.name === 'ArrayBuffer' ||
                        String(value) === '[object ArrayBuffer]'
                    ) {
                        try {
                            return Buffer.from(value).toString('hex');
                        } catch {
                            return '[BINARY DATA]';
                        }
                    }

                    try {
                        return JSON.stringify(value, null, 2);
                    } catch {
                        return String(value);
                    }
                }

                return String(value);
            };

            const safeText = (value) =>
                normalizeValue(value)
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n');

            const drawSectionTitle = (number, title, subtitle = null) => {
                ensureSpace(subtitle ? 55 : 40);

                doc
                    .font('Helvetica-Bold')
                    .fontSize(13)
                    .fillColor(C.olive)
                    .text(`${number}. ${title.toUpperCase()}`, PAGE.left);

                doc
                    .moveTo(PAGE.left, doc.y + 5)
                    .lineTo(PAGE.right, doc.y + 5)
                    .lineWidth(1)
                    .strokeColor(C.borderDark)
                    .stroke();

                doc.moveDown(0.55);

                if (subtitle) {
                    doc
                        .font('Helvetica')
                        .fontSize(8.5)
                        .fillColor(C.muted)
                        .text(subtitle, PAGE.left, doc.y, {
                            width: PAGE.contentWidth,
                        });

                    doc.moveDown(0.55);
                }
            };

            const drawSmallLabel = (label, x, y, width) => {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(7)
                    .fillColor(C.oliveMid)
                    .text(label.toUpperCase(), x, y, {
                        width,
                    });
            };

            /* ============================================================
             * DYNAMIC CARD
             * ============================================================
             */

            const drawDynamicCard = ({
                x = PAGE.left,
                width = PAGE.contentWidth,
                padding = 12,
                background = C.paperAlt,
                border = C.border,
                radius = 3,
                render,
                estimatedHeight = 50,
            }) => {
                /*
                 * We render the contents once into the real document position.
                 * PDFKit manages text wrapping and page breaking naturally.
                 *
                 * Card height is calculated using a local cursor, then the
                 * background is redrawn behind the final region.
                 *
                 * For very long content, use drawLongTextBlock instead.
                 */

                const startY = doc.y;

                ensureSpace(estimatedHeight);

                const contentStartY = doc.y + padding;

                // Draw a conservative temporary background.
                doc
                    .roundedRect(
                        x,
                        startY,
                        width,
                        estimatedHeight,
                        radius
                    )
                    .fillAndStroke(background, border);

                doc.y = contentStartY;

                render({
                    x: x + padding,
                    y: doc.y,
                    width: width - padding * 2,
                });

                const finalY = Math.max(doc.y + padding, startY + estimatedHeight);

                // Since PDFKit cannot move an existing rectangle after the
                // content has been rendered, redraw the border only when the
                // content stayed within the estimated region.
                //
                // Long variable sections should use drawLongTextBlock.
                doc.y = finalY + 6;

                return finalY;
            };

            /* ============================================================
             * LONG TEXT BLOCK
             *
             * Important: this is what fixes the plaintext/ciphertext problem.
             * Never force a fixed 45px box around arbitrary-size text.
             * ============================================================
             */

            const drawLongTextBlock = ({
                label,
                value,
                mono = false,
                fontSize = 7.5,
                background = C.codeBg,
                border = C.border,
            }) => {
                const text = safeText(value);

                // Label
                ensureSpace(35);

                doc
                    .font('Helvetica-Bold')
                    .fontSize(7.5)
                    .fillColor(C.textSoft)
                    .text(label, PAGE.left, doc.y);

                doc.moveDown(0.25);

                /*
                 * Calculate the wrapped height for the current page width.
                 * This is the critical difference from the original code.
                 */
                const textWidth = PAGE.contentWidth - 20;

                doc.font(mono ? 'Courier' : 'Helvetica').fontSize(fontSize);

                const height = doc.heightOfString(text, {
                    width: textWidth,
                    lineGap: 1.5,
                    paragraphGap: 2,
                });

                /*
                 * If it does not fit on the current page and isn't gigantic,
                 * start a new page first.
                 */
                const available = PAGE.bottom - doc.y;

                if (height + 30 > available && height < PAGE.height * 0.8) {
                    newPage();
                }

                const boxTop = doc.y;
                const boxHeight = Math.min(
                    Math.max(height + 18, 35),
                    PAGE.bottom - boxTop
                );

                doc
                    .rect(PAGE.left, boxTop, PAGE.contentWidth, boxHeight)
                    .fillAndStroke(background, border);

                doc
                    .font(mono ? 'Courier' : 'Helvetica')
                    .fontSize(fontSize)
                    .fillColor(mono ? C.codeText : C.text)
                    .text(text, PAGE.left + 10, boxTop + 9, {
                        width: textWidth,
                        lineGap: 1.5,
                        paragraphGap: 2,
                    });

                doc.y = Math.max(
                    doc.y + 3,
                    boxTop + boxHeight + 8
                );
            };

            /* ============================================================
             * KEY-VALUE ROW
             * ============================================================
             */

            const drawKeyValue = ({
                label,
                value,
                x = PAGE.left,
                width = PAGE.contentWidth,
                mono = false,
            }) => {
                const text = safeText(value);

                const labelWidth = 145;
                const valueWidth = width - labelWidth - 10;

                doc
                    .font('Helvetica-Bold')
                    .fontSize(8)
                    .fillColor(C.textSoft)
                    .text(label, x, doc.y, {
                        width: labelWidth,
                    });

                doc
                    .font(mono ? 'Courier' : 'Helvetica')
                    .fontSize(mono ? 7 : 8)
                    .fillColor(C.text)
                    .text(text, x + labelWidth, doc.y, {
                        width: valueWidth,
                        lineGap: 1,
                    });

                doc.moveDown(0.35);
            };

            /* ============================================================
             * STATUS BADGE
             * ============================================================
             */

            const drawStatusBadge = (label, passed) => {
                const text = passed ? 'PASSED' : 'FAILED';
                const bg = passed ? C.successBg : C.dangerBg;
                const color = passed ? C.success : C.danger;

                const width = 65;
                const height = 18;

                doc
                    .roundedRect(
                        PAGE.right - width,
                        doc.y - 1,
                        width,
                        height,
                        3
                    )
                    .fill(bg)
                    .strokeColor(color)
                    .stroke();

                doc
                    .font('Helvetica-Bold')
                    .fontSize(7)
                    .fillColor(color)
                    .text(text, PAGE.right - width, doc.y + 5, {
                        width,
                        align: 'center',
                    });
            };

            /* ============================================================
             * TITLE / EXECUTIVE HEADER
             * ============================================================
             */

            doc
                .rect(0, 0, PAGE.width, 105)
                .fill(C.oliveDark);

            doc
                .font('Helvetica-Bold')
                .fontSize(16)
                .fillColor(C.white)
                .text(
                    'SECURENET DEFENCE COMMUNICATION NETWORK',
                    PAGE.left,
                    25,
                    {
                        width: PAGE.contentWidth,
                    }
                );

            doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#D9DDC9')
                .text(
                    'CRYPTOGRAPHIC EXECUTION & VERIFICATION REPORT',
                    PAGE.left,
                    50,
                    {
                        width: PAGE.contentWidth,
                    }
                );

            doc
                .font('Courier')
                .fontSize(7.5)
                .fillColor(C.oliveSoft)
                .text(
                    `EXECUTION ID // ${executionId}`,
                    PAGE.left,
                    75
                );

            doc.y = 125;

            /* ============================================================
             * 1. EXECUTIVE SUMMARY
             * ============================================================
             */

            drawSectionTitle(
                1,
                'Executive Summary',
                'High-level execution, verification, and performance information.'
            );

            ensureSpace(110);

            const summaryTop = doc.y;
            const summaryHeight = 105;

            doc
                .roundedRect(
                    PAGE.left,
                    summaryTop,
                    PAGE.contentWidth,
                    summaryHeight,
                    4
                )
                .fillAndStroke(C.paperAlt, C.border);

            const col1 = PAGE.left + 14;
            const col2 = PAGE.left + PAGE.contentWidth / 2 + 10;

            const rowY = [
                summaryTop + 14,
                summaryTop + 34,
                summaryTop + 54,
                summaryTop + 74,
            ];

            doc.font('Helvetica-Bold').fontSize(7.5);

            // Left
            drawSmallLabel('Execution ID', col1, rowY[0], 180);
            doc
                .font('Courier')
                .fontSize(7)
                .fillColor(C.text)
                .text(data.summary.executionId, col1, rowY[0] + 9, {
                    width: 190,
                });

            drawSmallLabel('Filename', col1, rowY[1], 180);
            doc
                .font('Helvetica')
                .fontSize(8)
                .fillColor(C.text)
                .text(
                    `${data.summary.filename} (${data.summary.inputSize} bytes)`,
                    col1,
                    rowY[1] + 9,
                    {
                        width: 190,
                    }
                );

            drawSmallLabel('Created At', col1, rowY[2], 180);
            doc
                .font('Courier')
                .fontSize(7)
                .fillColor(C.text)
                .text(data.summary.createdAt, col1, rowY[2] + 9, {
                    width: 190,
                });

            drawSmallLabel('Completed At', col1, rowY[3], 180);
            doc
                .font('Courier')
                .fontSize(7)
                .fillColor(C.text)
                .text(data.summary.completedAt || 'N/A', col1, rowY[3] + 9, {
                    width: 190,
                });

            // Right
            drawSmallLabel('Status', col2, rowY[0], 180);
            doc
                .font('Helvetica-Bold')
                .fontSize(8)
                .fillColor(C.text)
                .text(
                    String(data.summary.status || 'UNKNOWN').toUpperCase(),
                    col2,
                    rowY[0] + 9,
                    {
                        width: 180,
                    }
                );

            drawSmallLabel('Verification', col2, rowY[1], 180);
            doc
                .font('Helvetica-Bold')
                .fontSize(8)
                .fillColor(C.olive)
                .text(
                    data.verification.finalStatus || 'N/A',
                    col2,
                    rowY[1] + 9,
                    {
                        width: 180,
                    }
                );

            drawSmallLabel('Total Pipeline Time', col2, rowY[2], 180);
            doc
                .font('Courier')
                .fontSize(7)
                .fillColor(C.text)
                .text(
                    `${data.benchmark?.timing?.totalElapsedMs ?? 'N/A'} ms`,
                    col2,
                    rowY[2] + 9,
                    {
                        width: 180,
                    }
                );

            drawSmallLabel('Throughput', col2, rowY[3], 180);
            doc
                .font('Courier')
                .fontSize(7)
                .fillColor(C.text)
                .text(
                    `${data.benchmark?.analysis?.throughputKBps ?? 'N/A'} KB/s`,
                    col2,
                    rowY[3] + 9,
                    {
                        width: 180,
                    }
                );

            doc.y = summaryTop + summaryHeight + 18;

            /* ============================================================
             * 2. MISSION INPUT
             * ============================================================
             */

            drawSectionTitle(
                2,
                'Mission Input Plaintext',
                'Original plaintext supplied to the cryptographic pipeline.'
            );

            drawLongTextBlock({
                label: 'PLAINTEXT',
                value: data.input.plaintext,
                mono: true,
                fontSize: 7.5,
            });

            /* ============================================================
             * 3. PIPELINE
             * ============================================================
             */

            drawSectionTitle(
                3,
                'Step-by-Step Cryptographic Pipeline',
                'Nine-stage execution trace from authentication through verified decryption.'
            );

            data.steps.forEach((step) => {
                /*
                 * Reserve enough space for the STEP header.
                 * The detailed output is allowed to span pages naturally.
                 */
                ensureSpace(55);

                const headerY = doc.y;

                doc
                    .roundedRect(
                        PAGE.left,
                        headerY,
                        PAGE.contentWidth,
                        23,
                        3
                    )
                    .fill(C.oliveDark);

                doc
                    .font('Helvetica-Bold')
                    .fontSize(8.5)
                    .fillColor(C.white)
                    .text(
                        `STEP ${step.step}  /  ${step.title}`,
                        PAGE.left + 9,
                        headerY + 7,
                        {
                            width: PAGE.contentWidth * 0.65,
                        }
                    );

                doc
                    .font('Courier')
                    .fontSize(7)
                    .fillColor(C.oliveSoft)
                    .text(
                        `${step.algorithm}  |  ${step.durationMs} ms`,
                        PAGE.left + PAGE.contentWidth * 0.65,
                        headerY + 7,
                        {
                            width: PAGE.contentWidth * 0.32,
                            align: 'right',
                        }
                    );

                doc.y = headerY + 31;

                // Description
                doc
                    .font('Helvetica')
                    .fontSize(8)
                    .fillColor(C.textSoft)
                    .text(`Description: ${safeText(step.description)}`, {
                        width: PAGE.contentWidth,
                        lineGap: 1.5,
                    });

                doc.moveDown(0.45);

                drawSmallLabel(
                    'Outputs',
                    PAGE.left,
                    doc.y,
                    PAGE.contentWidth
                );

                doc.moveDown(0.35);

                /*
                 * IMPORTANT:
                 * Each output is rendered as an actual wrapped block.
                 * This prevents giant ciphertext from crossing into
                 * the next step or heading.
                 */
                for (const [key, rawValue] of Object.entries(
                    step.output || {}
                )) {
                    const value = safeText(rawValue);

                    ensureSpace(35);

                    doc
                        .font('Helvetica-Bold')
                        .fontSize(7.5)
                        .fillColor(C.textSoft)
                        .text(`${key}:`, PAGE.left + 4, doc.y);

                    doc.moveDown(0.15);

                    doc
                        .font('Courier')
                        .fontSize(7)
                        .fillColor(C.codeText);

                    const valueHeight = doc.heightOfString(value, {
                        width: PAGE.contentWidth - 14,
                        lineGap: 1.2,
                    });

                    const available = PAGE.bottom - doc.y;

                    if (
                        valueHeight + 22 > available &&
                        valueHeight < PAGE.height * 0.75
                    ) {
                        newPage();

                        drawSmallLabel(
                            `${key} (continued)`,
                            PAGE.left,
                            doc.y,
                            PAGE.contentWidth
                        );

                        doc.moveDown(0.35);
                    }

                    // Light code area
                    const codeTop = doc.y;

                    doc
                        .rect(
                            PAGE.left,
                            codeTop,
                            PAGE.contentWidth,
                            Math.max(valueHeight + 12, 24)
                        )
                        .fillAndStroke(C.codeBg, C.border);

                    doc
                        .font('Courier')
                        .fontSize(7)
                        .fillColor(C.codeText)
                        .text(value, PAGE.left + 7, codeTop + 6, {
                            width: PAGE.contentWidth - 14,
                            lineGap: 1.2,
                        });

                    doc.y = Math.max(
                        doc.y + 5,
                        codeTop + valueHeight + 14
                    );

                    doc.moveDown(0.2);
                }

                // Step separator
                doc
                    .moveTo(PAGE.left, doc.y + 2)
                    .lineTo(PAGE.right, doc.y + 2)
                    .strokeColor(C.border)
                    .lineWidth(0.5)
                    .stroke();

                doc.moveDown(0.7);
            });

            /* ============================================================
             * 4. CRYPTOGRAPHIC INVENTORY
             * ============================================================
             */

            drawSectionTitle(
                4,
                'Cryptographic Material Inventory',
                'Cryptographic values captured during this execution.'
            );

            const material = data.cryptographicMaterial;

            const inventory = [
                [
                    'Ed25519 Public Key',
                    material?.ed25519?.edPublicKey,
                    true,
                ],
                [
                    'Ed25519 Private Key',
                    material?.ed25519?.edPrivateKey,
                    true,
                ],
                [
                    'ECDH Base A Public Key',
                    material?.ecdh?.baseAPublicKey,
                    true,
                ],
                [
                    'ECDH Base B Public Key',
                    material?.ecdh?.baseBPublicKey,
                    true,
                ],
                [
                    'ECDH Shared Secret',
                    material?.ecdh?.sharedSecret,
                    true,
                ],
                [
                    'HKDF Salt',
                    material?.hkdf?.salt,
                    true,
                ],
                [
                    'HKDF Info',
                    material?.hkdf?.info,
                    true,
                ],
                [
                    'HKDF Session Key',
                    material?.hkdf?.sessionKey,
                    true,
                ],
                [
                    'RSA Public Key',
                    material?.rsa?.rsaPublicKey,
                    true,
                ],
                [
                    'RSA Private Key',
                    material?.rsa?.rsaPrivateKey,
                    true,
                ],
                [
                    'RSA Wrapped Session Key',
                    material?.rsa?.wrappedSessionKey,
                    true,
                ],
                [
                    'RSA Recovered Session Key',
                    material?.rsa?.recoveredSessionKey,
                    true,
                ],
                [
                    'AES Session Key',
                    material?.aes?.sessionKey,
                    true,
                ],
                [
                    'AES IV (Nonce)',
                    material?.aes?.iv,
                    true,
                ],
                [
                    'AES Auth Tag',
                    material?.aes?.authTag,
                    true,
                ],
                [
                    'AES Ciphertext',
                    material?.aes?.ciphertext,
                    true,
                ],
                [
                    'Ed25519 Signature',
                    material?.signature?.signature,
                    true,
                ],
            ];

            inventory.forEach(([label, value, mono]) => {
                drawLongTextBlock({
                    label,
                    value,
                    mono,
                    fontSize: 7,
                });
            });

            /* ============================================================
             * 5. VERIFICATION MATRIX
             * ============================================================
             */

            drawSectionTitle(
                5,
                'Integrity Verification Matrix',
                'Cryptographic verification results produced by the execution.'
            );

            ensureSpace(130);

            const verificationTop = doc.y;
            const verificationRows = [
                [
                    'Shared Secrets Match',
                    data.verification.sharedSecretsMatch,
                ],
                [
                    'Digital Signature Valid',
                    data.verification.signatureValid,
                ],
                [
                    'AES Decryption Success',
                    data.verification.decryptionSuccess,
                ],
                [
                    'Plaintext Integrity Match',
                    data.verification.plaintextMatch,
                ],
            ];

            const rowHeight = 30;
            const cardHeight = verificationRows.length * rowHeight + 26;

            doc
                .roundedRect(
                    PAGE.left,
                    verificationTop,
                    PAGE.contentWidth,
                    cardHeight,
                    4
                )
                .fillAndStroke(C.paperAlt, C.border);

            verificationRows.forEach(([label, passed], index) => {
                const y = verificationTop + 13 + index * rowHeight;

                doc
                    .font('Helvetica')
                    .fontSize(8.5)
                    .fillColor(C.text)
                    .text(label, PAGE.left + 12, y + 4, {
                        width: PAGE.contentWidth - 100,
                    });

                const badgeX = PAGE.right - 78;

                const bg = passed ? C.successBg : C.dangerBg;
                const color = passed ? C.success : C.danger;

                doc
                    .roundedRect(badgeX, y, 64, 18, 3)
                    .fillAndStroke(bg, color);

                doc
                    .font('Helvetica-Bold')
                    .fontSize(7)
                    .fillColor(color)
                    .text(
                        passed ? 'PASSED' : 'FAILED',
                        badgeX,
                        y + 5,
                        {
                            width: 64,
                            align: 'center',
                        }
                    );
            });

            doc.y = verificationTop + cardHeight + 15;

            // Final status row
            const finalPassed =
                data.verification.finalStatus === 'TRANSMISSION VERIFIED';

            doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor(C.text)
                .text('FINAL STATUS');

            doc.moveDown(0.25);

            doc
                .font('Helvetica-Bold')
                .fontSize(11)
                .fillColor(finalPassed ? C.success : C.danger)
                .text(data.verification.finalStatus || 'UNKNOWN');

            doc.moveDown(1);

            /* ============================================================
             * 6. PERFORMANCE
             * ============================================================
             */

            drawSectionTitle(
                6,
                'Performance Benchmark & Metrics',
                'Measured duration of individual cryptographic operations and overall pipeline efficiency.'
            );

            ensureSpace(80);

            const benchOps = data.benchmark?.timing?.operations || {};

            const colOperation = PAGE.left;
            const colDuration = PAGE.right - 110;

            // Table header
            doc
                .rect(
                    PAGE.left,
                    doc.y,
                    PAGE.contentWidth,
                    22
                )
                .fill(C.oliveDark);

            doc
                .font('Helvetica-Bold')
                .fontSize(7.5)
                .fillColor(C.white)
                .text('OPERATION', colOperation + 8, doc.y + 7);

            doc
                .text('DURATION', colDuration, doc.y + 7, {
                    width: 100,
                    align: 'right',
                });

            doc.y += 22;

            let operationIndex = 0;

            Object.entries(benchOps).forEach(([operation, timeMs]) => {
                if (PAGE.bottom - doc.y < 24) {
                    newPage();
                }

                const rowY = doc.y;

                if (operationIndex % 2 === 0) {
                    doc
                        .rect(
                            PAGE.left,
                            rowY,
                            PAGE.contentWidth,
                            21
                        )
                        .fill(C.paperAlt);
                }

                doc
                    .font('Helvetica')
                    .fontSize(8)
                    .fillColor(C.text)
                    .text(operation, colOperation + 8, rowY + 6);

                doc
                    .font('Courier')
                    .fontSize(7.5)
                    .fillColor(C.olive)
                    .text(`${timeMs} ms`, colDuration, rowY + 6, {
                        width: 100,
                        align: 'right',
                    });

                doc.y = rowY + 21;
                operationIndex += 1;
            });

            doc.moveDown(0.7);

            // Summary metrics
            const metrics = [
                [
                    'Encryption Phase',
                    `${data.benchmark?.timing?.encryptionPhaseMs ?? 'N/A'} ms`,
                ],
                [
                    'Decryption Phase',
                    `${data.benchmark?.timing?.decryptionPhaseMs ?? 'N/A'} ms`,
                ],
                [
                    'Total Pipeline',
                    `${data.benchmark?.timing?.totalElapsedMs ?? 'N/A'} ms`,
                ],
                [
                    'Throughput',
                    `${data.benchmark?.analysis?.throughputKBps ?? 'N/A'} KB/s`,
                ],
            ];

            ensureSpace(metrics.length * 28 + 25);

            metrics.forEach(([label, value]) => {
                const y = doc.y;

                doc
                    .font('Helvetica-Bold')
                    .fontSize(8)
                    .fillColor(C.textSoft)
                    .text(label, PAGE.left + 10, y + 5, {
                        width: 180,
                    });

                doc
                    .font('Courier')
                    .fontSize(8)
                    .fillColor(C.olive)
                    .text(value, PAGE.right - 150, y + 5, {
                        width: 140,
                        align: 'right',
                    });

                doc
                    .moveTo(PAGE.left, y + 24)
                    .lineTo(PAGE.right, y + 24)
                    .lineWidth(0.5)
                    .strokeColor(C.border)
                    .stroke();

                doc.y = y + 28;
            });

            /* ============================================================
             * OPTIONAL FINAL PLAINTEXT RESULT
             * ============================================================
             */

            if (data.finalResult?.plaintext || data.decryption?.plaintext) {
                drawSectionTitle(
                    7,
                    'Recovered Plaintext',
                    'Plaintext reconstructed after RSA session-key recovery and AES-GCM verification.'
                );

                drawLongTextBlock({
                    label: 'DECRYPTED PLAINTEXT',
                    value:
                        data.finalResult?.plaintext ||
                        data.decryption?.plaintext,
                    mono: true,
                    fontSize: 7.5,
                });
            }

            /* ============================================================
             * FINAL DOCUMENT NOTE
             * ============================================================
             */

            ensureSpace(70);

            doc
                .moveTo(PAGE.left, doc.y)
                .lineTo(PAGE.right, doc.y)
                .lineWidth(1)
                .strokeColor(C.olive)
                .stroke();

            doc.moveDown(0.8);

            doc
                .font('Helvetica')
                .fontSize(7)
                .fillColor(C.muted)
                .text(
                    'Generated by SecureNet Defence Communication Network. ' +
                    'This report represents the recorded execution state and benchmark measurements for the specified transmission.',
                    PAGE.left,
                    doc.y,
                    {
                        width: PAGE.contentWidth,
                        lineGap: 2,
                    }
                );

            /* ============================================================
             * END
             * ============================================================
             */

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Orchestrator method to generate downloadable report file buffer.
 * @param {string} executionId 
 * @param {string} format - 'txt' | 'pdf'
 * @returns {Promise<{ buffer: Buffer, contentType: string, filename: string }>}
 */
export const generateReportFile = async (executionId, format = 'txt') => {
    const normFormat = (format || 'txt').toLowerCase().trim();

    if (normFormat === 'pdf') {
        const buffer = await generateReportPDF(executionId);
        return {
            buffer,
            contentType: 'application/pdf',
            filename: `SecureNet_Report_${executionId}.pdf`
        };
    }

    if (normFormat === 'txt') {
        const buffer = generateReportText(executionId);
        return {
            buffer,
            contentType: 'text/plain; charset=utf-8',
            filename: `SecureNet_Report_${executionId}.txt`
        };
    }

    throw new Error(`Unsupported report format: ${format}. Supported formats are 'txt' and 'pdf'.`);
};

/**
 * Legacy/Preview method returning masked report object for JSON API responses.
 * @param {string} executionId 
 * @returns {Object} Masked report object
 */
export const generateReport = (executionId) => {
    const execution = getExecution(executionId);

    if (!execution) {
        throw new Error(`Execution Context not found for ID: ${executionId}`);
    }

    const benchmarkAnalysis = analyzeExecution(execution);
    const rawInput = execution.input || {};
    const mat = execution.cryptographicMaterial || {};
    const verif = execution.verification || {};

    const encryptionSteps = [
        {
            step: 1,
            phase: 'encryption',
            algorithm: 'Ed25519',
            title: '01 / ED25519 AUTHENTICATION',
            input: { description: 'Sender identity initialization (BASE-A)' },
            process: { description: 'Generate Ed25519 signing key pair for digital signature verification.' },
            output: { publicKey: maskSensitive(mat.ed25519?.edPublicKey || '') },
            status: 'passed'
        },
        {
            step: 2,
            phase: 'encryption',
            algorithm: 'ECDH',
            title: '02 / ECDH KEY EXCHANGE',
            input: { description: 'Endpoint A and Endpoint B public/private key pairs' },
            process: { description: 'Both endpoints independently perform ECDH key agreement to compute shared secret.' },
            output: {
                baseAPublicKey: maskSensitive(mat.ecdh?.baseAPublicKey || ''),
                baseBPublicKey: maskSensitive(mat.ecdh?.baseBPublicKey || ''),
                sharedSecret: maskSensitive(mat.ecdh?.sharedSecret || '')
            },
            status: 'passed'
        },
        {
            step: 3,
            phase: 'encryption',
            algorithm: 'HKDF',
            title: '03 / HKDF KEY DERIVATION',
            input: { description: 'ECDH shared secret' },
            process: { description: 'Derive 256-bit AES session key using HMAC Key Derivation Function (HKDF).' },
            output: {
                salt: maskSensitive(mat.hkdf?.salt || '9e410000000000000000000000000000'),
                info: maskSensitive(mat.hkdf?.hkdfInfo || '7365637572656e65742d73657373696f6e'),
                sessionKey: maskSensitive(mat.hkdf?.sessionKey || mat.aes?.sessionKey || '')
            },
            status: 'passed'
        },
        {
            step: 4,
            phase: 'encryption',
            algorithm: 'RSA-OAEP',
            title: '04 / RSA-OAEP KEY PROTECTION',
            input: { description: 'AES session key' },
            process: { description: 'Wrap the session key using receiver RSA public key (2048-bit RSA-OAEP).' },
            output: {
                rsaPublicKey: maskSensitive(mat.rsa?.rsaPublicKey || ''),
                wrappedSessionKey: maskSensitive(mat.rsa?.wrappedSessionKey || '')
            },
            status: 'passed'
        },
        {
            step: 5,
            phase: 'encryption',
            algorithm: 'AES-256-GCM',
            title: '05 / AES-256-GCM ENCRYPTION',
            input: {
                plaintext: maskSensitive(rawInput.message || ''),
                sessionKey: maskSensitive(mat.aes?.sessionKey || '')
            },
            process: { description: 'Encrypt plaintext using AES-256-GCM authenticated encryption.' },
            output: {
                ciphertext: maskSensitive(mat.aes?.ciphertext || ''),
                iv: maskSensitive(mat.aes?.iv || ''),
                authTag: maskSensitive(mat.aes?.authTag || '')
            },
            status: 'passed'
        },
        {
            step: 6,
            phase: 'encryption',
            algorithm: 'Ed25519',
            title: '06 / PACKET SIGNING',
            input: { description: 'Assembled secure payload' },
            process: { description: 'Sign packet using sender Ed25519 private key.' },
            output: { signature: maskSensitive(mat.signature?.signature || '') },
            status: 'passed'
        }
    ];

    const decryptionSteps = [
        {
            step: 7,
            phase: 'decryption',
            algorithm: 'Ed25519',
            title: '07 / SIGNATURE VERIFICATION',
            input: { description: 'Received secure packet + Ed25519 signature' },
            process: { description: 'Verify packet digital signature using sender Ed25519 public key.' },
            output: { signatureValid: verif.signatureValid !== undefined ? verif.signatureValid : true },
            status: 'passed'
        },
        {
            step: 8,
            phase: 'decryption',
            algorithm: 'RSA-OAEP',
            title: '08 / RSA SESSION KEY RECOVERY',
            input: { description: 'Wrapped session key + receiver RSA private key' },
            process: { description: 'Recover AES session key using receiver RSA-OAEP private key.' },
            output: { recoveredSessionKey: maskSensitive(mat.rsa?.recoveredSessionKey || mat.aes?.sessionKey || '') },
            status: 'passed'
        },
        {
            step: 9,
            phase: 'decryption',
            algorithm: 'AES-256-GCM',
            title: '09 / AES-256-GCM DECRYPTION',
            input: {
                ciphertext: maskSensitive(mat.aes?.ciphertext || ''),
                recoveredSessionKey: maskSensitive(mat.rsa?.recoveredSessionKey || mat.aes?.sessionKey || ''),
                iv: maskSensitive(mat.aes?.iv || ''),
                authTag: maskSensitive(mat.aes?.authTag || '')
            },
            process: { description: 'Decrypt ciphertext and validate authentication tag.' },
            output: {
                sessionKey: maskSensitive(mat.rsa?.recoveredSessionKey || mat.aes?.sessionKey || ''),
                plaintext: maskSensitive(execution.process?.decryption?.plaintext || rawInput.message || '')
            },
            status: 'passed'
        }
    ];

    const cryptographicMaterialDisplay = {
        ed25519: {
            edPublicKey: maskSensitive(mat.ed25519?.edPublicKey || ''),
            edPrivateKey: maskSensitive(mat.ed25519?.edPrivateKey || '')
        },
        ecdh: {
            baseAPublicKey: maskSensitive(mat.ecdh?.baseAPublicKey || ''),
            baseBPublicKey: maskSensitive(mat.ecdh?.baseBPublicKey || ''),
            sharedSecret: maskSensitive(mat.ecdh?.sharedSecret || '')
        },
        hkdf: {
            salt: maskSensitive(mat.hkdf?.salt || '9e410000000000000000000000000000'),
            info: maskSensitive(mat.hkdf?.hkdfInfo || '7365637572656e65742d73657373696f6e'),
            sessionKey: maskSensitive(mat.hkdf?.sessionKey || mat.aes?.sessionKey || '')
        },
        rsa: {
            rsaPublicKey: maskSensitive(mat.rsa?.rsaPublicKey || ''),
            rsaPrivateKey: maskSensitive(mat.rsa?.rsaPrivateKey || ''),
            wrappedSessionKey: maskSensitive(mat.rsa?.wrappedSessionKey || ''),
            recoveredSessionKey: maskSensitive(mat.rsa?.recoveredSessionKey || '')
        },
        aes: {
            sessionKey: maskSensitive(mat.aes?.sessionKey || ''),
            ciphertext: maskSensitive(mat.aes?.ciphertext || ''),
            iv: maskSensitive(mat.aes?.iv || ''),
            authTag: maskSensitive(mat.aes?.authTag || '')
        },
        signature: {
            signature: maskSensitive(mat.signature?.signature || '')
        }
    };

    const report = {
        summary: {
            executionId: execution.executionId,
            filename: rawInput.filename || 'mission.txt',
            inputSize: rawInput.size || 0,
            status: execution.status,
            createdAt: execution.createdAt,
            completedAt: execution.completedAt
        },
        input: {
            plaintext: maskSensitive(rawInput.message || ''),
            filename: rawInput.filename || 'mission.txt',
            size: rawInput.size || 0
        },
        encryption: encryptionSteps,
        decryption: decryptionSteps,
        cryptographicMaterial: cryptographicMaterialDisplay,
        packet: {
            senderId: 'BASE-A',
            ecdhPublicKey: maskSensitive(mat.ecdh?.baseAPublicKey || ''),
            wrappedSessionKey: maskSensitive(mat.rsa?.wrappedSessionKey || ''),
            ciphertext: maskSensitive(mat.aes?.ciphertext || ''),
            iv: maskSensitive(mat.aes?.iv || ''),
            authTag: maskSensitive(mat.aes?.authTag || ''),
            signature: maskSensitive(mat.signature?.signature || '')
        },
        verification: {
            sharedSecretsMatch: verif.sharedSecretsMatch !== undefined ? verif.sharedSecretsMatch : (execution.status === 'completed'),
            signatureValid: verif.signatureValid !== undefined ? verif.signatureValid : (execution.status === 'completed'),
            decryptionSuccess: verif.decryptionSuccess !== undefined ? verif.decryptionSuccess : (execution.status === 'completed'),
            plaintextMatch: verif.plaintextMatch !== undefined ? verif.plaintextMatch : (execution.status === 'completed'),
            finalStatus: execution.status === 'completed' ? 'TRANSMISSION VERIFIED' : 'TRANSMISSION FAILED'
        },
        benchmark: benchmarkAnalysis,
        finalResult: {
            success: execution.status === 'completed'
        }
    };

    execution.report = report;
    return report;
};
