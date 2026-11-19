import Button from "./Button";

// Tạo danh sách trang cần hiện: 1 ... 4 5 6 ... 10
const getPages = (page, totalPages) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Phân trang" className="mt-4 flex flex-wrap items-center gap-1">
            <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Trước
            </Button>

            {getPages(page, totalPages).map((p, index) =>
                p === "..." ? (
                    <span key={`dots-${index}`} className="px-2">...</span>
                ) : (
                    <Button
                        key={p}
                        variant={p === page ? "primary" : "secondary"}
                        aria-current={p === page ? "page" : undefined}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </Button>
                )
            )}

            <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                Sau
            </Button>
        </nav>
    );
};

export default Pagination;