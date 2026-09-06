

export const Section = ({ children, className = '', id }) => {
    return (
        <section id={id} className={`section ${className}`}>
            {children}
        </section>
    );
};
