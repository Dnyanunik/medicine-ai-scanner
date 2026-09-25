require('dotenv').config();
const { default: Anthropic } = require('@anthropic-ai/sdk');

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('❌ Error: ANTHROPIC_API_KEY is missing in your .env file!');
  process.exit(1);
}

console.log(`🔑 Key loaded: ${apiKey.substring(0, 14)}...`);

const anthropic = new Anthropic({ apiKey });

const modelsToTest = [
  'claude-sonnet-5',           // ✅ Current flagship
  'claude-haiku-4-5-20251001', // ✅ Current fast model
  'claude-opus-5-5',           // ✅ Current most capable
  'claude-sonnet-4-6',         // ✅ Previous gen, still live
];

async function testAllModels() {
  console.log('⏳ Testing Claude models...\n');
  for (const model of modelsToTest) {
    try {
      const message = await anthropic.messages.create({
        model,
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      console.log(`✅ WORKING : "${model}"`);
    } catch (error) {
      console.log(`❌ FAILED  : "${model}" -> ${error.message}`);
    }
  }
}

testAllModels();
