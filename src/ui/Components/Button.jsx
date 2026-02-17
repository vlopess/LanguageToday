export const Button = ({ children, className = "", ...props }) => {
    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-2xl bg-[#11457E] text-white hover:opacity-90 transition flex items-center gap-2 ${className}`}
        >
            {children}
        </button>
    );
};
