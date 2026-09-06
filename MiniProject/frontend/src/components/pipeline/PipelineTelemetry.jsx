import React from 'react';

export const PipelineTelemetry = ({
    telemetry = null,
    isProcessing = false,
    stepNumber = 1
}) => {
    const duration = telemetry?.durationMs
        ? `${Number(telemetry.durationMs).toFixed(2)} ms`
        : '0.00 ms';
    const lastOp = telemetry?.lastOperation || 'IDLE';
    const channel = telemetry?.channel || 'PIPELINE';
    const integrity = telemetry?.integrity || 'NOMINAL';

    const formattedStep = String(stepNumber).padStart(2, '0');

    return (
        <div className="telemetry-panel">
            <div className="telemetry-header">
                {formattedStep} / TELEMETRY
            </div>

            <div className="telemetry-duration-huge">
                {duration}
            </div>
            <div className="telemetry-label-sm">
                LAST OPERATION DURATION
            </div>

            {/* Waveform Equalizer */}
            <div className={`telemetry-waveform${isProcessing ? ' active' : ''}`}>
                <div className="telemetry-bar" style={{ height: '30%' }} />
                <div className="telemetry-bar" style={{ height: '60%' }} />
                <div className="telemetry-bar" style={{ height: '40%' }} />
                <div className="telemetry-bar" style={{ height: '85%' }} />
                <div className="telemetry-bar" style={{ height: '50%' }} />
                <div className="telemetry-bar" style={{ height: '70%' }} />
                <div className="telemetry-bar" style={{ height: '35%' }} />
                <div className="telemetry-bar" style={{ height: '90%' }} />
                <div className="telemetry-bar" style={{ height: '45%' }} />
                <div className="telemetry-bar" style={{ height: '25%' }} />
            </div>

            <div className="telemetry-meta-row">
                <span className="telemetry-meta-key">OPERATION</span>
                <span className="telemetry-meta-val">{lastOp.toUpperCase()}</span>
            </div>

            <div className="telemetry-meta-row">
                <span className="telemetry-meta-key">CHANNEL</span>
                <span className="telemetry-meta-val">{channel.toUpperCase()}</span>
            </div>

            <div className="telemetry-meta-row">
                <span className="telemetry-meta-key">INTEGRITY</span>
                <span className="telemetry-meta-val nominal">{integrity}</span>
            </div>
        </div>
    );
};
