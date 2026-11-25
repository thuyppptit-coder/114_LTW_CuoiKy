const inputClass = (hasError) =>
    `w-24 rounded border px-2 py-1 dark:bg-gray-800 ${
        hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    }`;

const ReadingRow = ({ room, values, errors, serverError, onChange }) => {
    const electricNew = values?.electricNew ?? "";
    const waterNew = values?.waterNew ?? "";

    const electricUsed = electricNew !== "" ? Number(electricNew) - room.electricOld : null;
    const waterUsed = waterNew !== "" ? Number(waterNew) - room.waterOld : null;

    return (
        <tr className="border-t border-gray-200 align-top dark:border-gray-700">
            <td className="px-2 py-2 font-medium">{room.name}</td>

            <td className="px-2 py-2">{room.electricOld}</td>
            <td className="px-2 py-2">
                <input
                    type="number"
                    min="0"
                    aria-label={`Điện mới phòng ${room.name}`}
                    value={electricNew}
                    onChange={(e) => onChange(room._id, "electricNew", e.target.value)}
                    className={inputClass(errors.electricNew)}
                />
                {errors.electricNew && <p className="mt-1 text-xs text-red-600">{errors.electricNew}</p>}
            </td>
            <td className="px-2 py-2 text-gray-500">
                {electricUsed !== null && electricUsed >= 0 ? electricUsed : "—"}
            </td>

            <td className="px-2 py-2">{room.waterOld}</td>
            <td className="px-2 py-2">
                <input
                    type="number"
                    min="0"
                    aria-label={`Nước mới phòng ${room.name}`}
                    value={waterNew}
                    onChange={(e) => onChange(room._id, "waterNew", e.target.value)}
                    className={inputClass(errors.waterNew)}
                />
                {errors.waterNew && <p className="mt-1 text-xs text-red-600">{errors.waterNew}</p>}
            </td>
            <td className="px-2 py-2 text-gray-500">
                {waterUsed !== null && waterUsed >= 0 ? waterUsed : "—"}
            </td>

            <td className="px-2 py-2 text-xs text-red-600">{serverError}</td>
        </tr>
    );
};

export default ReadingRow;