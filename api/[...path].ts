import { app } from '../server';

// Vercel routes every /api/* request through this function. Express keeps the
// existing endpoint paths intact: /api/ai/cv-extract,
// /api/ai/import-opportunity, and /api/ai/generate-materials.
export default function handler(request: any, response: any) {
  return app(request, response);
}
