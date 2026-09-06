export interface ServerRom {
  name: string;
  size: number;
}

/** Origin of the Express/webretro backend (where /api, /roms and the emulator app itself are served from). Defaults to localhost:8000 for local dev. */
export function getBackendOrigin(): string {
  return (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';
}

export async function listServerRoms(): Promise<ServerRom[]> {
  const res = await fetch('/api/roms/list');
  if (!res.ok) {
    throw new Error(`Failed to list server ROMs: ${res.status}`);
  }
  return res.json();
}

export function uploadRom(file: File, onProgress?: (percent: number) => void): Promise<ServerRom> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/roms/upload');

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(xhr.responseText || `Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));

    const formData = new FormData();
    formData.append('rom', file);
    xhr.send(formData);
  });
}

/** Absolute URL to a ROM file already stored on the backend, for feeding into the emulator iframe. */
export function serverRomUrl(fileName: string): string {
  return `${getBackendOrigin()}/roms/${encodeURIComponent(fileName)}`;
}
