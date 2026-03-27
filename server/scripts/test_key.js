// No node-fetch needed in Node 22
require('dotenv').config();

const key = process.env.GEMINI_KEY1;
const model = 'gemini-1.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

async function test() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
