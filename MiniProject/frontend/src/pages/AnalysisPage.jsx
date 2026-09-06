import React, { useState, useEffect, useCallback } from 'react';
import '../components/analysis/Analysis.css';
import ResetIcon from '../assets/lock-reset-svgrepo-com (1).svg';
import { AnalysisHeader } from '../components/analysis/AnalysisHeader';
import { ProcessSuccessBanner } from '../components/analysis/ProcessSuccessBanner';
import { ExecutionSummary } from '../components/analysis/ExecutionSummary';
import { InputAnalysis } from '../components/analysis/InputAnalysis';
import { EncryptionAnalysis } from '../components/analysis/EncryptionAnalysis';
import { DecryptionAnalysis } from '../components/analysis/DecryptionAnalysis';
import { CryptographicMaterial } from '../components/analysis/CryptographicMaterial';
import { SecurePacket } from '../components/analysis/SecurePacket';
import { VerificationSummary } from '../components/analysis/VerificationSummary';
import { PerformanceAnalysis } from '../components/analysis/PerformanceAnalysis';
import { FinalResult } from '../components/analysis/FinalResult';
import { ReportExport } from '../components/analysis/ReportExport';
import { getReport } from '../services/api';

export default function AnalysisPage({
    analysisExecutionId = null,   // Only set when an execution is confirmed complete
    processRunData = null,
    onResetWorkflow = () => { }
}) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    // 'idle' | 'fetch-error' | 'execution-failed' | null
    const [errorKind, setErrorKind] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchReport = useCallback((execId) => {
        if (!execId) return;

        console.log('[Analysis] fetching report for executionId =', execId);
        setLoading(true);
        setErrorKind(null);
        setErrorMsg('');
        setReport(null);

        let isMounted = true;

        getReport(execId)
            .then(data => {
                if (!isMounted) return;

                if (data?.report) {
                    const status = data.report.summary?.status;
                    if (status === 'failed') {
                        // Backend explicitly reports execution failure
                        setErrorKind('execution-failed');
                        setErrorMsg('Backend reported a failed cryptographic execution.');
                    } else {
                        console.log('[Analysis] report loaded for executionId =', execId);
                        setReport(data.report);
                    }
                } else {
                    setErrorKind('fetch-error');
                    setErrorMsg('Invalid or empty report data returned from server.');
                }
            })
            .catch(err => {
                if (!isMounted) return;
                // Network / transport / 404 — NOT an execution failure
                setErrorKind('fetch-error');
                setErrorMsg(err.message || 'Failed to load execution analysis report.');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    // Fetch report whenever a confirmed analysis exec ID becomes available
    useEffect(() => {
        if (!analysisExecutionId) {
            // Clear stale report when exec ID is cleared (e.g. new transmission)
            setReport(null);
            setErrorKind(null);
            setErrorMsg('');
            return;
        }
        const cleanup = fetchReport(analysisExecutionId);
        return cleanup;
    }, [analysisExecutionId, fetchReport]);

    // null = unknown (loading/no data yet); only derive from real report data
    const isVerified = report
        ? (report.verification?.finalStatus === 'TRANSMISSION VERIFIED' || report.finalResult?.success === true)
        : null;

    const isIdle = !analysisExecutionId && !loading;

    return (
        <section id="analysis" className="analysis-section" aria-label="Final Transmission Analysis">
            <div className="analysis-container">
                <AnalysisHeader isVerified={isVerified} isLoading={loading} onResetWorkflow={onResetWorkflow} />

                {/* Process Execution Summary Banner (If triggered via RUN ALGORITHM) */}
                {processRunData && (
                    <ProcessSuccessBanner
                        executionId={analysisExecutionId}
                        summary={processRunData.summary}
                        timing={processRunData.timing}
                    />
                )}

                {/* Idle / waiting state — no execution ready yet */}
                {isIdle && !errorKind && !report && (
                    <div className="analysis-block" style={{ borderLeft: '4px solid var(--border-strong)', textAlign: 'center', padding: '48px 24px' }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-mono-base)',
                            color: 'var(--text-muted)',
                            fontWeight: 'bold',
                            marginBottom: '12px'
                        }}>
                            — AWAITING COMPLETED EXECUTION
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
                            Complete the cryptographic pipeline or run the algorithm to generate an analysis report.
                        </p>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="analysis-loading-box">
                        <div className="analysis-loading-title">ANALYZING SECURE TRANSMISSION...</div>
                        <div className="analysis-loading-steps">
                            <span>RECONSTRUCTING EXECUTION RECORD...</span>
                            <span>LOADING PERFORMANCE DATA...</span>
                            <span>PREPARING REPORT BLOCKS...</span>
                        </div>
                    </div>
                )}

                {/* Error states */}
                {errorKind && !loading && (
                    <div className="analysis-block" style={{
                        borderLeft: `4px solid ${errorKind === 'execution-failed' ? 'var(--status-danger)' : 'var(--status-warning)'}`
                    }}>
                        <div style={{
                            color: errorKind === 'execution-failed' ? 'var(--status-danger)' : 'var(--status-warning)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-mono-base)',
                            fontWeight: 'bold'
                        }}>
                            {errorKind === 'execution-failed' ? '⚠ EXECUTION FAILED' : '⚠ REPORT FETCH FAILED'}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body-sm)', marginTop: '8px' }}>
                            {errorKind === 'execution-failed'
                                ? 'The cryptographic execution failed on the backend. '
                                : 'The report could not be retrieved. This may be a network or server issue. '}
                            {errorMsg}
                        </p>
                        {analysisExecutionId && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
                                EXECUTION ID: {analysisExecutionId}
                            </div>
                        )}
                        {/* Retry button — allows re-fetching the report using the same exec ID */}
                        {analysisExecutionId && (
                            <button
                                type="button"
                                className="btn-execute-step"
                                onClick={() => fetchReport(analysisExecutionId)}
                                style={{
                                    marginTop: '16px',
                                    background: 'var(--color-almost-black)',
                                    borderColor: 'var(--border-strong)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-mono-xs)',
                                    padding: '8px 16px'
                                }}
                            >
                                <img src={ResetIcon} alt="retry" style={{ width: '13px', height: '13px', marginRight: '6px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />RETRY REPORT FETCH
                            </button>
                        )}
                    </div>
                )}

                {/* Report Content Blocks */}
                {!loading && report && (
                    <>
                        <ExecutionSummary summary={report.summary} />
                        <InputAnalysis inputData={report.input} />
                        <EncryptionAnalysis encryptionSteps={report.encryption} />
                        <DecryptionAnalysis decryptionSteps={report.decryption} />
                        <CryptographicMaterial material={report.cryptographicMaterial} />
                        <SecurePacket packet={report.packet} />
                        <VerificationSummary verification={report.verification} />
                        <PerformanceAnalysis benchmark={report.benchmark} />
                        <FinalResult isVerified={isVerified} verification={report?.verification} />
                        <ReportExport executionId={analysisExecutionId} />

                        {/* Refresh report button — re-fetch using the same exec ID */}
                        {analysisExecutionId && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn-execute-step"
                                    onClick={() => fetchReport(analysisExecutionId)}
                                    style={{
                                        background: 'var(--color-almost-black)',
                                        borderColor: 'var(--border-strong)',
                                        color: 'var(--text-secondary)',
                                        fontSize: 'var(--text-mono-xs)',
                                        padding: '8px 16px'
                                    }}
                                >
                                    <img src={ResetIcon} alt="refresh" style={{ width: '13px', height: '13px', marginRight: '6px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />REFRESH REPORT
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
