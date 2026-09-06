

export const Heading = ({
    children,
    size = 'md', // xl, lg, md, sm
    className = '',
    as: Component = 'h2'
}) => {
    return (
        <Component className={`type-heading-${size} ${className}`}>
            {children}
        </Component>
    );
};
