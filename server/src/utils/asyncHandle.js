// Bọc controller async, lỗi tự chuyển sang errorHandler (khỏi viết try/catch)
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;