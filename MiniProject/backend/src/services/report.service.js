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
                margin: 40,
                size: 'A4'
            });

            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Document Styling Colors
            const darkBg = '#0d1117';
            const primaryColor = '#2ea043';
            const accentColor = '#388bfd';
            const textColor = '#c9d1d9';
            const mutedText = '#8b949e';

            // Header Banner
            doc.rect(0, 0, doc.page.width, 65).fill('#161b22');
            doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('SECURENET DEFENCE COMMUNICATION NETWORK', 40, 18);
            doc.fillColor(textColor).fontSize(10).font('Helvetica').text('CRITICAL CRYPTOGRAPHIC EXECUTION & BENCHMARK REPORT', 40, 38);

            doc.y = 80;

            // Summary Box
            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('1. EXECUTIVE SUMMARY', 40, doc.y);
            doc.moveDown(0.3);

            const summaryY = doc.y;
            doc.rect(40, summaryY, doc.page.width - 80, 75).fillAndStroke('#161b22', '#30363d');
            doc.fillColor(textColor).fontSize(9).font('Helvetica');
            doc.text(`Execution ID : ${data.summary.executionId}`, 50, summaryY + 10);
            doc.text(`Filename     : ${data.summary.filename} (${data.summary.inputSize} bytes)`, 50, summaryY + 25);
            doc.text(`Created At   : ${data.summary.createdAt}`, 50, summaryY + 40);
            doc.text(`Completed At : ${data.summary.completedAt || 'N/A'}`, 50, summaryY + 55);

            doc.text(`Status       : ${data.summary.status.toUpperCase()}`, 320, summaryY + 10);
            doc.text(`Verification : ${data.verification.finalStatus}`, 320, summaryY + 25);
            doc.text(`Total Time   : ${data.benchmark.timing?.totalElapsedMs} ms`, 320, summaryY + 40);
            doc.text(`Throughput   : ${data.benchmark.analysis?.throughputKBps} KB/s`, 320, summaryY + 55);

            doc.y = summaryY + 90;

            // Input Plaintext
            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('2. MISSION INPUT PLAINTEXT', 40, doc.y);
            doc.moveDown(0.3);
            const inputY = doc.y;
            doc.rect(40, inputY, doc.page.width - 80, 45).fillAndStroke('#0d1117', '#30363d');
            doc.fillColor('#7ee787').fontSize(9).font('Courier').text(data.input.plaintext, 50, inputY + 10, {
                width: doc.page.width - 100
            });

            doc.y = inputY + 55;

            // 9-Step Pipeline Section
            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('3. STEP-BY-STEP CRYPTOGRAPHIC PIPELINE (9 STEPS)', 40, doc.y);
            doc.moveDown(0.4);

            data.steps.forEach((st) => {
                if (doc.y > doc.page.height - 120) {
                    doc.addPage();
                }

                const stepY = doc.y;
                doc.rect(40, stepY, doc.page.width - 80, 18).fill('#161b22');
                doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text(`STEP ${st.step}: ${st.title}`, 45, stepY + 4);
                doc.fillColor(mutedText).fontSize(8).font('Helvetica').text(`${st.algorithm} | ${st.durationMs} ms`, doc.page.width - 150, stepY + 4);

                doc.y = stepY + 22;
                doc.fillColor(textColor).fontSize(8).font('Helvetica').text(`Description: ${st.description}`, 45, doc.y);
                doc.moveDown(0.3);

                doc.fillColor(mutedText).fontSize(8).font('Helvetica-Bold').text('Outputs (Unmasked):', 45, doc.y);
                doc.moveDown(0.2);

                Object.entries(st.output).forEach(([k, v]) => {
                    if (doc.y > doc.page.height - 50) {
                        doc.addPage();
                    }
                    const valStr = String(v);
                    doc.fillColor('#e6edf3').fontSize(7.5).font('Courier');
                    doc.text(`  • ${k}: `, 50, doc.y, { continued: true });
                    doc.fillColor('#7ee787').text(valStr, { width: doc.page.width - 120 });
                });

                doc.moveDown(0.5);
            });

            // Cryptographic Inventory Section
            if (doc.y > doc.page.height - 180) {
                doc.addPage();
            }

            doc.moveDown(0.5);
            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('4. UNMASKED CRYPTOGRAPHIC MATERIAL INVENTORY', 40, doc.y);
            doc.moveDown(0.4);

            const matItems = [
                ['Ed25519 Public Key', data.cryptographicMaterial.ed25519.edPublicKey],
                ['Ed25519 Private Key', data.cryptographicMaterial.ed25519.edPrivateKey],
                ['ECDH Base A Public Key', data.cryptographicMaterial.ecdh.baseAPublicKey],
                ['ECDH Base B Public Key', data.cryptographicMaterial.ecdh.baseBPublicKey],
                ['ECDH Shared Secret', data.cryptographicMaterial.ecdh.sharedSecret],
                ['HKDF Salt', data.cryptographicMaterial.hkdf.salt],
                ['HKDF Info', data.cryptographicMaterial.hkdf.info],
                ['HKDF Session Key', data.cryptographicMaterial.hkdf.sessionKey],
                ['RSA Public Key', data.cryptographicMaterial.rsa.rsaPublicKey],
                ['RSA Private Key', data.cryptographicMaterial.rsa.rsaPrivateKey],
                ['RSA Wrapped Session Key', data.cryptographicMaterial.rsa.wrappedSessionKey],
                ['RSA Recovered Session Key', data.cryptographicMaterial.rsa.recoveredSessionKey],
                ['AES Session Key', data.cryptographicMaterial.aes.sessionKey],
                ['AES IV (Nonce)', data.cryptographicMaterial.aes.iv],
                ['AES Auth Tag', data.cryptographicMaterial.aes.authTag],
                ['AES Ciphertext', data.cryptographicMaterial.aes.ciphertext],
                ['Ed25519 Signature', data.cryptographicMaterial.signature.signature]
            ];

            matItems.forEach(([label, val]) => {
                if (doc.y > doc.page.height - 40) {
                    doc.addPage();
                }
                doc.fillColor('#e6edf3').fontSize(8).font('Helvetica-Bold').text(`${label}:`, 45, doc.y);
                doc.fillColor('#7ee787').fontSize(7.5).font('Courier').text(val || 'N/A', 55, doc.y + 10, {
                    width: doc.page.width - 110
                });
                doc.moveDown(0.4);
            });

            // Integrity Verification Section
            if (doc.y > doc.page.height - 120) {
                doc.addPage();
            }

            doc.moveDown(0.5);
            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('5. INTEGRITY VERIFICATION MATRIX', 40, doc.y);
            doc.moveDown(0.4);

            const verifY = doc.y;
            doc.rect(40, verifY, doc.page.width - 80, 55).fillAndStroke('#161b22', '#30363d');
            doc.fillColor(textColor).fontSize(9).font('Helvetica');
            doc.text(`Shared Secrets Match    : ${data.verification.sharedSecretsMatch ? 'PASSED ✅' : 'FAILED ❌'}`, 50, verifY + 8);
            doc.text(`Digital Signature Valid : ${data.verification.signatureValid ? 'PASSED ✅' : 'FAILED ❌'}`, 50, verifY + 22);
            doc.text(`AES Decryption Success  : ${data.verification.decryptionSuccess ? 'PASSED ✅' : 'FAILED ❌'}`, 50, verifY + 36);

            doc.text(`Plaintext Integrity : ${data.verification.plaintextMatch ? 'MATCHED ✅' : 'MISMATCHED ❌'}`, 300, verifY + 8);
            doc.text(`Final Status        : ${data.verification.finalStatus}`, 300, verifY + 22);

            doc.y = verifY + 65;

            // Performance Benchmark Section
            if (doc.y > doc.page.height - 160) {
                doc.addPage();
            }

            doc.fillColor(accentColor).fontSize(12).font('Helvetica-Bold').text('6. PERFORMANCE BENCHMARK & METRICS', 40, doc.y);
            doc.moveDown(0.4);

            const benchOps = data.benchmark.timing?.operations || {};
            doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold');
            doc.text('Operation Name', 50, doc.y);
            doc.text('Duration (ms)', 250, doc.y);
            doc.moveDown(0.3);

            Object.entries(benchOps).forEach(([op, timeMs]) => {
                if (doc.y > doc.page.height - 40) {
                    doc.addPage();
                }
                doc.fillColor(mutedText).fontSize(8).font('Helvetica').text(op, 50, doc.y);
                doc.fillColor('#7ee787').fontSize(8).font('Courier').text(`${timeMs} ms`, 250, doc.y);
                doc.moveDown(0.2);
            });

            doc.moveDown(0.4);
            doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
            doc.text(`Encryption Phase Total  : ${data.benchmark.timing?.encryptionPhaseMs} ms`, 50, doc.y);
            doc.text(`Decryption Phase Total  : ${data.benchmark.timing?.decryptionPhaseMs} ms`, 50, doc.y + 12);
            doc.text(`Total Elapsed Pipeline  : ${data.benchmark.timing?.totalElapsedMs} ms`, 50, doc.y + 24);
            doc.text(`Throughput              : ${data.benchmark.analysis?.throughputKBps} KB/sec`, 50, doc.y + 36);

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
