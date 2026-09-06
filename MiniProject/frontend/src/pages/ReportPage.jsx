import { useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { exportReportFile } from '../services/api';

export default function ReportPage({ executionId: initialExecutionId }) {
    const [executionId, setExecutionId] = useState(initialExecutionId || '');
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleGenerateReport = async (e) => {
        e?.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!executionId.trim()) {
            setError('Please enter a valid Execution ID.');
            return;
        }

        setLoading(true);
        try {
            await exportReportFile(executionId.trim(), format);
            setSuccessMessage(`Successfully generated and downloaded ${format.toUpperCase()} report.`);
        } catch (err) {
            setError(err.message || 'Failed to generate report file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    padding: '30px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <span style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#2ea043',
                            letterSpacing: '1px',
                            display: 'block',
                            marginBottom: '6px'
                        }}>
                            SECURENET REPORT ORCHESTRATOR
                        </span>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f0f6fc', margin: 0 }}>
                            Generate Execution Report
                        </h2>
                        <p style={{ color: '#8b949e', fontSize: '14px', marginTop: '6px' }}>
                            Export complete cryptographic execution analysis, step telemetry, unmasked keys, and benchmark metrics directly to your device.
                        </p>
                    </div>

                    <form onSubmit={handleGenerateReport}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#c9d1d9', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                                Execution ID
                            </label>
                            <input
                                type="text"
                                value={executionId}
                                onChange={(e) => setExecutionId(e.target.value)}
                                placeholder="e.g. exec-1725612345-a1b2c"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#0d1117',
                                    border: '1px solid #30363d',
                                    borderRadius: '6px',
                                    color: '#7ee787',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#c9d1d9', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                                Export Format
                            </label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormat('pdf')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: format === 'pdf' ? 'rgba(56, 139, 253, 0.15)' : '#0d1117',
                                        border: `1px solid ${format === 'pdf' ? '#388bfd' : '#30363d'}`,
                                        borderRadius: '6px',
                                        color: format === 'pdf' ? '#58a6ff' : '#8b949e',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📄 PDF Format (Formatted Document)
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormat('txt')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: format === 'txt' ? 'rgba(46, 160, 67, 0.15)' : '#0d1117',
                                        border: `1px solid ${format === 'txt' ? '#2ea043' : '#30363d'}`,
                                        borderRadius: '6px',
                                        color: format === 'txt' ? '#7ee787' : '#8b949e',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📝 TXT Format (Plain Text Log)
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                background: 'rgba(248, 81, 73, 0.15)',
                                border: '1px solid #f85149',
                                borderRadius: '6px',
                                color: '#ff7b72',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                padding: '12px',
                                background: 'rgba(46, 160, 67, 0.15)',
                                border: '1px solid #2ea043',
                                borderRadius: '6px',
                                color: '#7ee787',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}>
                                ✅ {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: loading ? '#21262d' : '#238636',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)'
                            }}
                        >
                            {loading ? 'Generating Report...' : `Generate & Download ${format.toUpperCase()} Report`}
                        </button>
                    </form>
                </div>
            </div>
        </PageShell>
    );
}
