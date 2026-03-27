require('dotenv').config();
const key = process.env.GEMINI_KEY1;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function test() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('MODELS:', data.models ? data.models.map(m => m.name) : 'No models');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
