const colors = {
    gray: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
};

const Badge = ({ children, color = "gray" }) => (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
        {children}
    </span>
);

export default Badge;