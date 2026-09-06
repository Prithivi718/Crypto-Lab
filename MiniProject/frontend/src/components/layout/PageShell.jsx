

export const PageShell = ({ children, className = '' }) => {
    return (
        <div className={`page-shell ${className}`}>
            {children}
        </div>
    );
};
