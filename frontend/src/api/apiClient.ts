const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(
    public readonly path: string,
    public readonly status: number,
    statusText: string
  ) {
    super(`Request to ${path} failed with ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

type QueryParams = Record<string, string | number>;

function buildUrl(path: string, params?: QueryParams): string {
  if (!params) {
    return `${API_URL}${path}`;
  }

  const entries = Object.entries(params).map(([key, value]) => [key, String(value)]);
  const query = new URLSearchParams(entries);

  return `${API_URL}${path}?${query}`;
}

export async function fetchJson<T>(path: string, params?: QueryParams): Promise<T> {
  const res = await fetch(buildUrl(path, params));

  if (!res.ok) {
    throw new ApiError(path, res.status, res.statusText);
  }

  return res.json();
}
