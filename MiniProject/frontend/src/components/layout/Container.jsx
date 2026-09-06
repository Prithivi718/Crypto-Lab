

export const Container = ({ children, wide = false, className = '' }) => {
    const containerClass = wide ? 'container-wide' : 'container';
    return (
        <div className={`${containerClass} ${className}`}>
            {children}
        </div>
    );
};
