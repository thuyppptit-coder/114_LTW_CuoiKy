import { useEffect } from "react";

const Modal = ({ open, title, children, onClose }) => {
    // Lắng nghe phím Esc khi modal đang mở, gỡ listener khi đóng hoặc unmount
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className="w-full max-w-md rounded bg-white p-5 text-gray-900 shadow-lg dark:bg-gray-800 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()} // bấm trong hộp không đóng modal
            >
                <h3 id="modal-title" className="mb-3 text-lg font-semibold">{title}</h3>
                {children}
            </div>
        </div>
    );
};

export default Modal;