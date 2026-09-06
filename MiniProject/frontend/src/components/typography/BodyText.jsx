

export const BodyText = ({
    children,
    size = 'base', // lg, base, sm, xs
    className = '',
    color = 'primary', // primary, secondary, muted
    as: Component = 'p'
}) => {
    return (
        <Component className={`type-body-${size} text-${color} ${className}`}>
            {children}
        </Component>
    );
};
