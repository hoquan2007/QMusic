export class ApiError extends Error {
  status: number;
  code: string;
  retryAfter?: number;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR", retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return new ApiError("Nguồn nhạc phản hồi quá lâu. Vui lòng thử lại.", 504, "UPSTREAM_TIMEOUT");
    }
    return new ApiError(error.message, 502, "UPSTREAM_ERROR");
  }
  return new ApiError("Đã có lỗi không xác định.", 500, "INTERNAL_ERROR");
}
