const StatCard = ({ label, value, hint, tone = "blue" }) => {
    const tones = {
        blue: "border-blue-200 dark:border-blue-900",
        green: "border-green-200 dark:border-green-900",
        yellow: "border-yellow-200 dark:border-yellow-900",
        red: "border-red-200 dark:border-red-900",
    };

    return (
        <div className={`rounded border p-4 ${tones[tone]}`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
};

export default StatCard;