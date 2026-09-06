

export const DisplayText = ({
    children,
    size = 'lg', // hero, xl, lg
    className = '',
    as: Component = 'h1'
}) => {
    return (
        <Component className={`type-display-${size} ${className}`}>
            {children}
        </Component>
    );
};
