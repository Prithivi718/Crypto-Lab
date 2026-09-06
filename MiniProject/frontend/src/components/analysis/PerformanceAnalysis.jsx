import React from 'react';

const OP_NAME_LABELS = {
    ed25519Gen: 'ED25519 GENERATION',
    ecdhExchange: 'ECDH EXCHANGE',
    hkdfDerivation: 'HKDF DERIVATION',
    rsaGen: 'RSA GENERATION',
    rsaWrap: 'RSA WRAP',
    aesEncryption: 'AES ENCRYPTION',
    ed25519Sign: 'ED25519 SIGN',
    ed25519Verify: 'ED25519 VERIFY',
    rsaUnwrap: 'RSA UNWRAP',
    aesDecryption: 'AES DECRYPTION'
};

export const PerformanceAnalysis = ({ benchmark }) => {
    if (!benchmark) return null;

    const ops = benchmark.timing?.operations || {};
    const analysis = benchmark.analysis || {};

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                08 / PERFORMANCE ANALYSIS
            </div>

            {/* Timings Table */}
            <table className="benchmark-table">
                <thead>
                    <tr>
                        <th>OPERATION</th>
                        <th>TIME</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(ops).map(([key, ms]) => (
                        <tr key={key}>
                            <td>{OP_NAME_LABELS[key] || key.toUpperCase()}</td>
                            <td style={{ color: 'var(--accent-bright)' }}>{Number(ms).toFixed(4)} ms</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Phase Metrics */}
            <div className="analysis-data-grid" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
                <div className="analysis-data-item">
                    <span className="analysis-data-key">ENCRYPTION PHASE</span>
                    <span className="analysis-data-val">{Number(benchmark.timing?.encryptionPhaseMs || 0).toFixed(4)} ms</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">DECRYPTION PHASE</span>
                    <span className="analysis-data-val">{Number(benchmark.timing?.decryptionPhaseMs || 0).toFixed(4)} ms</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">TOTAL EXECUTION</span>
                    <span className="analysis-data-val" style={{ color: 'var(--accent-bright)', fontWeight: 'bold' }}>
                        {Number(benchmark.timing?.totalElapsedMs || 0).toFixed(4)} ms
                    </span>
                </div>
            </div>

            {/* Performance Highlight Summary */}
            {analysis && (analysis.fastestOperation || analysis.slowestOperation) && (
                <div className="analysis-data-grid" style={{ marginTop: '16px', padding: '12px', background: 'var(--color-almost-black)', borderRadius: 'var(--radius-sm)' }}>
                    {analysis.fastestOperation && (
                        <div className="analysis-data-item">
                            <span className="analysis-data-key">FASTEST</span>
                            <span className="analysis-data-val" style={{ color: 'var(--status-success)' }}>{analysis.fastestOperation}</span>
                        </div>
                    )}
                    {analysis.slowestOperation && (
                        <div className="analysis-data-item">
                            <span className="analysis-data-key">SLOWEST</span>
                            <span className="analysis-data-val" style={{ color: 'var(--status-warning)' }}>{analysis.slowestOperation}</span>
                        </div>
                    )}
                    {analysis.encryptionVsDecryptionRatio && (
                        <div className="analysis-data-item">
                            <span className="analysis-data-key">ENCRYPTION / DECRYPTION</span>
                            <span className="analysis-data-val">{analysis.encryptionVsDecryptionRatio}×</span>
                        </div>
                    )}
                    {analysis.throughputKBps && (
                        <div className="analysis-data-item">
                            <span className="analysis-data-key">THROUGHPUT</span>
                            <span className="analysis-data-val">{analysis.throughputKBps} KB/s</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
