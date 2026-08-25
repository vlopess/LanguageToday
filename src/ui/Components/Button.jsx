const VARIANTS = {
    default:
        "bg-primary text-white hover:bg-primary-dark disabled:bg-sunken disabled:text-muted/60 disabled:cursor-not-allowed",
    secondary:
        "bg-surface text-ink border border-line hover:border-muted/50 disabled:text-muted/50 disabled:cursor-not-allowed",
    ghost:
        "bg-transparent text-muted hover:text-ink hover:bg-sunken disabled:opacity-50",
    danger:
        "bg-danger text-white hover:brightness-95 disabled:opacity-50",
};

export const Button = ({ children, variant = "default", className = "", ...props }) => {
    return (
        <button
            {...props}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-ring ${VARIANTS[variant] || VARIANTS.default} ${className}`}
        >
            {children}
        </button>
    );
};
