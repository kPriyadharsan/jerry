// ─── PRO JERRY API ───────────────────────────────────────────────────────────
// This file securely communicates with your Express server.
// ────────────────────────────────────────────────────────────────────────────

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * BRAIN CHAT — Use this for the main Jerry interface.
 * It uses your profile, activity history, and memory to generate responses.
 */
export async function jerryChat(message) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${SERVER_URL}/api/chat`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message }),
  });


  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Communication error' }));
    throw new Error(error.error || 'Failed to reach Jerry');
  }

  return await res.json(); // Returns { response, intent }
}

/**
 * RAW GEMINI CHAT — Context-free fast response.
 */
export async function chatAI(prompt) {
  return await callProxy('chat', prompt);
}

/**
 * ANALYSIS — For summarizing text or specialized tasks.
 */
export async function analysisAI(prompt) {
  return await callProxy('analysis', prompt);
}

// Internal proxy helper
async function callProxy(endpoint, prompt) {
  const res = await fetch(`${SERVER_URL}/api/gemini/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Proxy error' }));
    throw new Error(error.error || 'Gemini proxy failed');
  }

  const data = await res.json();
  return data.text ?? '';
}
