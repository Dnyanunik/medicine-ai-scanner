const fs = require('fs');

const targetPath = './src/environments/environment.ts';
const envConfigFile = `export const environment = {
  production: true,
  anthropicApiKey: '${process.env.ANTHROPIC_API_KEY || ''}'
};
`;

fs.mkdirSync('./src/environments', { recursive: true });
fs.writeFileSync(targetPath, envConfigFile);
console.log('✅ environment.ts generated for Vercel build.');
