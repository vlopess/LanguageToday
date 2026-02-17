
export const Card = ({ children, className = "", ...props }) => (
    <div
        {...props}
        className={`bg-white border rounded-2xl ${className}`}
    >
        {children}
    </div>
);

export const CardContent = ({ children, className = "" }) => (
    <div className={className}>{children}</div>
);