const CARD_WRITER_BASE_URL = 'http://localhost:5555';

export interface ReaderStatus {
  ok: boolean;
  reader?: string;
  error?: string;
}

export interface CardWriteResult {
  ok: boolean;
  uid?: string;
  bytesWritten?: number;
  error?: string;
}

export interface CardReadResult {
  ok: boolean;
  uid?: string;
  url?: string;
  error?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  try {
    return await res.json();
  } catch {
    throw new Error(`Card writer helper returned an unexpected response (${res.status})`);
  }
}

export async function getReaderStatus(): Promise<ReaderStatus> {
  try {
    const res = await fetch(`${CARD_WRITER_BASE_URL}/status`);
    return await parseJsonResponse<ReaderStatus>(res);
  } catch {
    return { ok: false, error: 'Card writer helper not reachable - is server.py running?' };
  }
}

export async function writeCard(url: string): Promise<CardWriteResult> {
  try {
    const res = await fetch(`${CARD_WRITER_BASE_URL}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await parseJsonResponse<CardWriteResult>(res);
  } catch {
    return { ok: false, error: 'Card writer helper not reachable - is server.py running?' };
  }
}

export async function readCard(): Promise<CardReadResult> {
  try {
    const res = await fetch(`${CARD_WRITER_BASE_URL}/read`);
    return await parseJsonResponse<CardReadResult>(res);
  } catch {
    return { ok: false, error: 'Card writer helper not reachable - is server.py running?' };
  }
}
