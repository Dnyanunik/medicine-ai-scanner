import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('POST /api/analyze called');

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  // Read API key from Vercel Environment Variables
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');

    return res.status(500).json({
      error: 'Anthropic API key is not configured on the server'
    });
  }

  try {
    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },

        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    console.log(
      'Anthropic response status:',
      response.status
    );

    // Anthropic returned an error
    if (!response.ok) {
      console.error(
        'Anthropic API error:',
        JSON.stringify(data)
      );

      return res.status(response.status).json(data);
    }

    // Success
    return res.status(200).json(data);

  } catch (error) {
    console.error(
      'Server error:',
      error
    );

    return res.status(500).json({
      error: 'Failed to communicate with Anthropic API'
    });
  }
}
