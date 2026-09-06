
import './Button.css';

export const Button = ({
    children,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    disabled = false,
    loading = false,
    onClick,
    className = '',
    type = 'button'
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const stateClass = loading ? 'btn-loading' : disabled ? 'btn-disabled' : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${stateClass} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? <span className="loader"></span> : children}
        </button>
    );
};
