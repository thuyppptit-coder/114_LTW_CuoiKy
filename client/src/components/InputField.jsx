const InputField = ({ label, name, error, ...rest }) => (
    <div className="mb-4">
        <label htmlFor={name} className="mb-1 block text-sm font-medium">
            {label}
        </label>
        <input
            id={name}
            name={name}
            className={`w-full rounded border px-3 py-2 dark:bg-gray-800 ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
            {...rest}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default InputField;