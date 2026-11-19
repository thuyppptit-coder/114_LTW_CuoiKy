const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
};

const Button = ({ children, variant = "primary", type = "button", disabled = false, className = "", ...rest }) => (
    <button
        type={type}
        disabled={disabled}
        className={`rounded px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
        {...rest}
    >
        {children}
    </button>
);

export default Button;