import { useState, useRef } from 'react';

export const MissionUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={`upload-terminal-panel${isDragOver ? ' drag-over' : ''}`}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt"
                style={{ display: 'none' }}
            />

            {/* Drop Zone */}
            <div
                className="upload-drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload mission briefing file"
            >
                <div className="upload-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>

                <h3 className="upload-title type-heading-sm">Drop mission briefing</h3>

                <p className="upload-subtext type-body-sm">
                    {selectedFile ? (
                        <span className="upload-file-status">📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                        'Drag and drop a .TXT file or browse from device'
                    )}
                </p>
            </div>

            {/* Terminal Metadata Footer */}
            <div className="upload-terminal-footer">
                <span className="upload-meta-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    ENCRYPTED IN TRANSIT
                </span>
                <span className="upload-meta-tag">MAX 10 MB</span>
            </div>
        </div>
    );
};
