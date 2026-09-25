import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is missing in server environment.' });
  }

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

    const prompt = `Analyze the provided image of a medicine package or bottle.
1. Extract structured label data strictly from what is visible.
2. Evaluate image quality and provide helpful plain-language patient guidance.

TARGET OUTPUT LANGUAGE: Translate all text outputs (warnings, advice, storage, purpose, etc.) into ${targetLanguage}.

STRICT EXTRACTION RULES:
1. Extract ONLY visible information. Use "Not clearly visible" or [] if unreadable.
2. Return ONLY a single raw valid JSON object. No markdown formatting, no code blocks, no preamble text.

JSON Structure:
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
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',        // ✅ Updated from deprecated claude-3-5-sonnet-20241022
      max_tokens: 1500,
      temperature: 0.1,
      system: 'You are an expert AI medicine label extraction assistant and clinical health communicator. You output raw valid JSON only.',
      messages: [
        {
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
              text: prompt
            }
          ]
        }
      ]
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text ?? '';  // ✅ type-safe

    const cleanJsonText = rawText
        .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const extractedData = JSON.parse(cleanJsonText);
    return res.status(200).json(extractedData);

  } catch (error: unknown) {
    console.error('Claude API Error:', error);
    return res.status(500).json({
      error: 'Failed to analyze medicine label with Claude.',
      details: error instanceof Error ? error.message : 'Unknown error'   // ✅ type-safe
    });
  }
}
