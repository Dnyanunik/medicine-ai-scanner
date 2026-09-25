import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ Required to parse JSON body
app.use(express.json({ limit: '10mb' }));

// ✅ CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ✅ API route — BEFORE static files and Angular handler
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) return res.status(500).json({ error: 'API key missing' });

  try {
    const { image, language } = req.body || {};
    const targetLanguage = language || 'English';
    if (!image) return res.status(400).json({ error: 'No image provided.' });

    const mimeType = image.includes('data:')
      ? image.split(';')[0].split(':')[1]
      : 'image/jpeg';

    const base64Data = image.includes('base64,')
      ? image.split('base64,')[1]
      : image;

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.1,
      system: 'You are an expert AI medicine label extraction assistant. Output raw valid JSON only.',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Data
            }
          },
          {
            type: 'text',
            text: `Analyze medicine label. Return ONLY raw JSON. Target language: ${targetLanguage}.
{
  "medicineName": "",
  "activeIngredients": [],
  "strength": "",
  "form": "",
  "labelPurpose": "",
  "warnings": [],
  "storage": "",
  "expiryDate": "",
  "manufacturer": "",
  "confidence": "High",
  "imageFeedback": "",
  "generalAdvice": ""
}`
          }
        ]
      }]
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text ?? '';
    const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));

  } catch (error: unknown) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown'
    });
  }
});

// ✅ Serve static files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ✅ Angular SSR handles everything else
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
