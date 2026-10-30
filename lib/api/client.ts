export class ClientApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "CLIENT_ERROR") {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ClientApiError("Không thể kết nối máy chủ QMusic.", 0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    let message = "Không thể tải dữ liệu.";
    try {
      const body = (await response.json()) as { error?: { message?: string; code?: string } };
      if (body.error?.message) message = body.error.message;
      throw new ClientApiError(message, response.status, body.error?.code ?? "REQUEST_FAILED");
    } catch (error) {
      if (error instanceof ClientApiError) throw error;
      throw new ClientApiError(message, response.status, "REQUEST_FAILED");
    }
  }

  return (await response.json()) as T;
}
