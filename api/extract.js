export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, prompt, data, mime, text, model } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    let parts = [];
    if (text) {
      parts = [{ text: prompt + '\n\n---\nCONTENT:\n' + text }];
    } else {
      parts = [
        { text: prompt },
        { inline_data: { mime_type: mime, data: data } }
      ];
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    };

    const modelName = model || 'gemini-2.0-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: json?.error?.message || `API error ${response.status}`
      });
    }

    return res.status(200).json(json);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
