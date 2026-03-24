require('dotenv').config();
const key = process.env.GEMINI_KEY1;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function test() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      const names = data.models.map(m => m.name);
      console.log('ALL MODELS:', names);
      console.log('FLASH MODELS:', names.filter(n => n.includes('flash')));
    } else {
      console.log('DATA:', data);
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
