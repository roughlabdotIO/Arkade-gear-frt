import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const PORT = process.env.PORT || 4000;

const app = express();

// Reverse-proxy API calls to the Express/webretro backend so the SPA can always
// call relative "/api/..." paths, in both dev (Vite proxy) and prod (here).
app.use('/api', async (req, res) => {
  const target = `${BACKEND_URL}${req.originalUrl}`;
  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: 'half',
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') res.setHeader(key, value);
    });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: String(err) });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Arkade Gear frontend listening on :${PORT}, proxying /api to ${BACKEND_URL}`);
});
