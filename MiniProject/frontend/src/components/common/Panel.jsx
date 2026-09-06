
import './Panel.css';

export const Panel = ({
    children,
    variant = 'default', // default, elevated, highlighted, success, warning, danger, info
    className = ''
}) => {
    return (
        <div className={`panel panel-${variant} ${className}`}>
            {children}
        </div>
    );
};
