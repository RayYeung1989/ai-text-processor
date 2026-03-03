export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (path === '/api/process' && request.method === 'POST') {
      try {
        const { text, operation } = await request.json();

        if (!text) {
          return new Response(JSON.stringify({ error: 'Text is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let result;
        switch (operation) {
          case 'summarize':
            result = await summarizeText(text);
            break;
          case 'improve':
            result = await improveText(text);
            break;
          case 'shorten':
            result = shortenText(text);
            break;
          case 'expand':
            result = expandText(text);
            break;
          default:
            result = text;
        }

        return new Response(JSON.stringify({ result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Serve static HTML
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

// Simple text processing functions (no AI needed for basic operations)
function shortenText(text) {
  // Simple summarization by extracting key sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length <= 2) return text;
  return sentences.slice(0, 2).join('. ') + '.';
}

function expandText(text) {
  // Simple expansion by adding transitional phrases
  const phrases = [
    'Furthermore, ',
    'Additionally, ',
    'Moreover, ',
    'In addition, ',
    'Consequently, '
  ];
  let result = text;
  let phraseIndex = 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length > 1) {
    const newSentences = sentences.map((s, i) => {
      if (i === 0) return s.trim();
      return phrases[phraseIndex++ % phrases.length] + s.trim();
    });
    result = newSentences.join('. ') + '.';
  }
  return result;
}

async function summarizeText(text) {
  // Simple extractive summarization
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length <= 3) return text;

  // Score sentences by length (prefer medium length)
  const scored = sentences.map(s => ({
    text: s.trim(),
    score: Math.abs(50 - s.trim().length)
  }));

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 3).map(s => s.text).join('. ') + '.';
}

async function improveText(text) {
  // Simple text improvement
  let result = text;

  // Fix common issues
  result = result.replace(/\s+/g, ' '); // Multiple spaces
  result = result.replace(/,\s*,/g, ','); // Double commas
  result = result.replace(/\.\s*\./g, '.'); // Double periods

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result.trim();
}

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Text Processor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #333;
      margin-bottom: 8px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .input-group { margin-bottom: 20px; }
    label {
      display: block;
      margin-bottom: 8px;
      color: #444;
      font-weight: 500;
    }
    textarea {
      width: 100%;
      height: 150px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      transition: border-color 0.2s;
    }
    textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    .operations {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .operation-btn {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .operation-btn:hover {
      border-color: #667eea;
      background: #f5f3ff;
    }
    .operation-btn.active {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
    }
    .result {
      margin-top: 24px;
      padding: 16px;
      background: #f5f3ff;
      border-radius: 8px;
      display: none;
    }
    .result.show { display: block; }
    .result h3 {
      color: #667eea;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .result p {
      color: #333;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .loading {
      text-align: center;
      color: #666;
      display: none;
    }
    .loading.show { display: block; }
    .pricing {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
    }
    .pricing p {
      color: #666;
      font-size: 13px;
    }
    .pricing strong {
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>AI Text Processor</h1>
    <p class="subtitle">Transform your text with AI-powered operations</p>

    <div class="input-group">
      <label>Enter your text</label>
      <textarea id="inputText" placeholder="Paste or type your text here..."></textarea>
    </div>

    <div class="operations">
      <button class="operation-btn active" data-op="summarize">Summarize</button>
      <button class="operation-btn" data-op="improve">Improve</button>
      <button class="operation-btn" data-op="shorten">Shorten</button>
      <button class="operation-btn" data-op="expand">Expand</button>
    </div>

    <button class="submit-btn" onclick="processText()">Process Text</button>

    <p class="loading" id="loading">Processing...</p>

    <div class="result" id="result">
      <h3>Result:</h3>
      <p id="resultText"></p>
    </div>

    <div class="pricing">
      <p><strong>Free</strong> - 10 texts/day | <strong>$9/mo</strong> - Unlimited</p>
    </div>
  </div>

  <script>
    let currentOp = 'summarize';

    document.querySelectorAll('.operation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.operation-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentOp = btn.dataset.op;
      });
    });

    async function processText() {
      const text = document.getElementById('inputText').value.trim();
      if (!text) {
        alert('Please enter some text');
        return;
      }

      document.getElementById('loading').classList.add('show');
      document.getElementById('result').classList.remove('show');

      try {
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, operation: currentOp })
        });

        const data = await res.json();

        if (data.error) {
          alert(data.error);
        } else {
          document.getElementById('resultText').textContent = data.result;
          document.getElementById('result').classList.add('show');
        }
      } catch (e) {
        alert('Error: ' + e.message);
      }

      document.getElementById('loading').classList.remove('show');
    }
  </script>
</body>
</html>
`;
