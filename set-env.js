const fs = require('fs');

const apiKey = process.env.ANTHROPIC_API_KEY || '';

const envContent = `export const environment = {
  production: true,
  anthropicApiKey: '${apiKey}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', envContent);
fs.writeFileSync('./src/environments/environment.prod.ts', envContent);
