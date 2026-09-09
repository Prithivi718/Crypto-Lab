import { process_run } from '../services/process.service.js';
import { startWorkflow, executeStep } from '../services/workflow.service.js';
import { generateReport } from '../services/report.service.js';
import { getExecution } from '../services/executionStore.js';
import {
    generateEdKeys,
    keyExchange,
    deriveSessionKey,
    generateRSAKeys,
    wrapSessionKey,
    encryptMessage,
    createSignedData,
    signEd25519,
    verifyEd25519,
    unwrapSessionKey,
    decryptMessage
} from '../services/crypto.service.js';
import { exportEd25519PublicKeyHex } from '../crypto/ed25519.js';
import { webcrypto } from 'crypto';

async function runTests() {
    console.log('=== STARTING BACKEND ARCHITECTURE INTEGRATION TEST ===\n');

    const testMessage = 'Thanks a lot GPT';

    // ----------------------------------------------------
    // TEST 0: Manual Crypto Step-by-Step Execution
    // ----------------------------------------------------
    console.log('\n--- MANUAL CRYPTO VERIFICATION (Like process.service.js) ---');
    console.log('STEP 1: Ed25519 Authentication Keys');
    const { edPublicKey, edPrivateKey } = await generateEdKeys();
    console.log('  [+] Public Key (Hex):', await exportEd25519PublicKeyHex(edPublicKey));

    console.log('\nSTEP 2: ECDH Key Exchange');
    const ecdhRes = keyExchange();
    console.log('  [+] Base A Public Key:', ecdhRes.baseAPublicKey.toString('hex'));
    console.log('  [+] Base A Shared Secret:', ecdhRes.baseASharedSecret.toString('hex'));
    console.log('  [+] Keys Match?:', ecdhRes.sharedSecretsMatch);

    console.log('\nSTEP 3: HKDF Key Derivation');
    const sessionKey = await deriveSessionKey(ecdhRes.baseASharedSecret);
    console.log('  [+] Derived Session Key:', sessionKey.toString('hex'));

    console.log('\nSTEP 4: RSA Key Generation & Wrapping');
    const { rsaPublicKey, rsaPrivateKey } = await generateRSAKeys();
    const wrappedSessionKey = await wrapSessionKey(sessionKey, rsaPublicKey);
    const rsaPubSpki = await webcrypto.subtle.exportKey('spki', rsaPublicKey);
    console.log('  [+] RSA Public Key:', Buffer.from(rsaPubSpki).toString('hex').substring(0, 48) + '...');
    console.log('  [+] Wrapped Session Key:', Buffer.from(wrappedSessionKey).toString('hex').substring(0, 48) + '...');

    console.log('\nSTEP 5: AES-256-GCM Encryption');
    const encrypted = encryptMessage(testMessage, sessionKey);
    console.log('  [+] Ciphertext:', encrypted.ciphertext.toString('hex'));
    console.log('  [+] IV:', encrypted.iv.toString('hex'));
    console.log('  [+] Auth Tag:', encrypted.authTag.toString('hex'));

    console.log('\nSTEP 6: Secure Packet & Ed25519 Signing');
    const signedData = createSignedData({
        senderId: 'BASE-A',
        ecdhPublicKey: ecdhRes.baseAPublicKey,
        wrappedSessionKey,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag
    });
    const signature = await signEd25519(signedData, edPrivateKey);
    console.log('  [+] Packet Signature:', Buffer.from(signature).toString('hex'));

    console.log('\nSTEP 7: Ed25519 Signature Verification');
    const isSigValid = await verifyEd25519(signedData, signature, edPublicKey);
    console.log('  [+] Signature Valid?:', isSigValid);

    console.log('\nSTEP 8: RSA Session Key Recovery');
    const recoveredSessionKey = await unwrapSessionKey(wrappedSessionKey, rsaPrivateKey);
    console.log('  [+] Recovered Session Key:', recoveredSessionKey.toString('hex'));

    console.log('\nSTEP 9: AES-256-GCM Decryption');
    const decrypted = decryptMessage(encrypted.ciphertext, recoveredSessionKey, encrypted.iv, encrypted.authTag);
    console.log('  [+] Decrypted Success?:', decrypted.success);
    console.log('  [+] Recovered Plaintext:', decrypted.plaintext);

    console.log('\n--- MANUAL CRYPTO VERIFICATION COMPLETED ---\n');

    // ----------------------------------------------------
    // TEST 1: Process Run (One-shot Execution)
    // ----------------------------------------------------
    console.log('1. Testing process_run()...');
    const processResult = await process_run(testMessage, { filename: 'test_mission.txt' });
    console.log('Process Result:', {
        success: processResult.success,
        executionId: processResult.executionId,
        status: processResult.status,
        summary: processResult.summary
    });

    if (!processResult.success || !processResult.executionId) {
        throw new Error('Process run failed!');
    }

    // ----------------------------------------------------
    // TEST 2: Report Generation for Process Execution
    // ----------------------------------------------------
    console.log('\n2. Testing generateReport() for process execution...');
    const processReport = generateReport(processResult.executionId);
    console.log('Report Summary:', processReport.summary);
    console.log('Report Verification:', processReport.verification);
    console.log('Encryption Steps Count:', processReport.encryption.length);
    console.log('Decryption Steps Count:', processReport.decryption.length);
    console.log('Benchmark Analysis:', processReport.benchmark.analysis);

    if (
        !processReport.verification.sharedSecretsMatch ||
        !processReport.verification.signatureValid ||
        !processReport.verification.decryptionSuccess ||
        !processReport.verification.plaintextMatch
    ) {
        throw new Error('Report verification check failed!');
    }

    // ----------------------------------------------------
    // TEST 3: Workflow Start & Step-by-Step Execution
    // ----------------------------------------------------
    console.log('\n3. Testing Workflow 9-step execution...');
    const wfStart = startWorkflow({ message: testMessage, filename: 'workflow_mission.txt' });
    console.log('Workflow Started:', wfStart);

    for (let s = 1; s <= 9; s++) {
        const stepRes = await executeStep(wfStart.workflowId, s);
        console.log(`Step ${s} (${stepRes.algorithm}) -> status: ${stepRes.status}, telemetry:`, stepRes.telemetry);
        if (stepRes.status !== 'completed') {
            throw new Error(`Workflow Step ${s} failed!`);
        }
    }

    // ----------------------------------------------------
    // TEST 4: Report Generation for Workflow Execution
    // ----------------------------------------------------
    console.log('\n4. Testing generateReport() for workflow execution...');
    const wfReport = generateReport(wfStart.executionId);
    console.log('Workflow Report Final Status:', wfReport.verification.finalStatus);
    console.log('Workflow Benchmark Fastest Op:', wfReport.benchmark.analysis.fastestOperation);

    console.log('\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
});
