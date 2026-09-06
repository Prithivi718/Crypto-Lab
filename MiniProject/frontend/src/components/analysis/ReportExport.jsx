import React, { useState } from 'react';
import { exportReportFile } from '../../services/api';

export const ReportExport = ({ executionId }) => {
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleExport = async () => {
        if (!executionId) {
            setErrorMsg("No Execution ID available to generate report.");
            return;
        }

        setLoading(true);
        setStatusMsg('');
        setErrorMsg('');

        try {
            await exportReportFile(executionId, format);
            setStatusMsg(`REPORT READY ✓ (${format.toUpperCase()} Downloaded)`);
        } catch (err) {
            setErrorMsg(err.message || 'Report generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-card">
            <h3 className="export-card-title">Generate Execution Report</h3>
            <p className="export-card-desc">
                Export complete cryptographic execution analysis, step telemetry, material keys, and benchmark metrics directly to your local system.
            </p>

            <div className="export-format-selector">
                <button
                    type="button"
                    className={`format-option-btn${format === 'pdf' ? ' active' : ''}`}
                    onClick={() => setFormat('pdf')}
                >
                    [ PDF FORMAT ]
                </button>
                <button
                    type="button"
                    className={`format-option-btn${format === 'txt' ? ' active' : ''}`}
                    onClick={() => setFormat('txt')}
                >
                    [ TXT FORMAT ]
                </button>
            </div>

            {errorMsg && (
                <div style={{ color: 'var(--status-danger)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '12px' }}>
                    ⚠ {errorMsg}
                </div>
            )}

            {statusMsg && (
                <div style={{ color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '12px', fontWeight: 'bold' }}>
                    {statusMsg}
                </div>
            )}

            <button
                type="button"
                className="btn-generate-report"
                onClick={handleExport}
                disabled={loading}
            >
                {loading ? 'GENERATING REPORT...' : `GENERATE ${format.toUpperCase()} REPORT →`}
            </button>
        </div>
    );
};
