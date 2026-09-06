import { process_run } from '../services/process.service.js';
import { startWorkflow, executeStep } from '../services/workflow.service.js';
import { generateReport } from '../services/report.service.js';
import { getExecution } from '../services/executionStore.js';

async function runTests() {
    console.log('=== STARTING BACKEND ARCHITECTURE INTEGRATION TEST ===\n');

    const testMessage = 'Thanks a lot GPT';

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
