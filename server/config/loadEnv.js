import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Side-effect-only module: populates process.env from the server-local .env
// file before anything else loads. Must be the very first import in
// server.js — ES module imports are evaluated in source order, so any
// module imported after this one (app.js and everything it pulls in, e.g.
// nodemailer/cloudinary clients that read process.env at import time) is
// guaranteed to see the real credentials instead of undefined.
dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
});
