
export const Card = ({ children, className = "", ...props }) => (
    <div
        {...props}
        className={`bg-surface border border-line rounded-xl ${className}`}
    >
        {children}
    </div>
);

export const CardContent = ({ children, className = "" }) => (
    <div className={className}>{children}</div>
);
