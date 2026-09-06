

export const MonoText = ({
    children,
    size = 'base', // lg, base, sm, xs
    className = '',
    color = 'primary', // primary, secondary, muted
    as: Component = 'span'
}) => {
    return (
        <Component className={`type-mono-${size} text-${color} ${className}`}>
            {children}
        </Component>
    );
};
