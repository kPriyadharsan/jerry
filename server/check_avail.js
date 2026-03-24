require('dotenv').config();
const key = process.env.GEMINI_KEY1;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function check() {
  const res = await fetch(url);
  const data = await res.json();
  const names = data.models.map(m => m.name.replace('models/', ''));
  console.log('FLASH:', names.filter(n => n.includes('flash')));
  console.log('PRO:', names.filter(n => n.includes('pro')));
}
check();
