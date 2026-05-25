import { createLogger } from '../core/logger.js';

const log = createLogger('gemini-image');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Generate an image using Gemini's image generation model.
 * Returns a base64 data URI (data:image/png;base64,...) or null on failure.
 */
export async function generateImage(prompt) {
  if (!GEMINI_API_KEY) {
    log.warn('No GEMINI_API_KEY configured — skipping image generation');
    return null;
  }

  try {
    const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      log.warn(`Gemini image API error ${res.status}: ${errBody.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const mime = part.inlineData.mimeType;
        const b64 = part.inlineData.data;
        log.info(`Gemini image generated (${mime}, ${(b64.length * 0.75 / 1024).toFixed(0)}KB)`);
        return `data:${mime};base64,${b64}`;
      }
    }

    log.warn('Gemini response contained no image parts');
    return null;
  } catch (err) {
    log.warn(`Gemini image generation failed: ${err.message}`);
    return null;
  }
}

/**
 * Generate an image and return raw buffer + mime type.
 * Useful when you need to write directly to a file.
 */
export async function generateImageBuffer(prompt) {
  if (!GEMINI_API_KEY) {
    log.warn('No GEMINI_API_KEY configured — skipping image generation');
    return null;
  }

  try {
    const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      log.warn(`Gemini image API error ${res.status}: ${errBody.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        log.info(`Gemini image generated (${part.inlineData.mimeType}, ${(buffer.length / 1024).toFixed(0)}KB)`);
        return { buffer, mimeType: part.inlineData.mimeType };
      }
    }

    log.warn('Gemini response contained no image parts');
    return null;
  } catch (err) {
    log.warn(`Gemini image generation failed: ${err.message}`);
    return null;
  }
}
