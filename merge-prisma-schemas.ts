const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'prisma/models');
const outputFile = path.join(__dirname, 'prisma/schema.prisma');

// Add datasource and generator blocks at the beginning
const header = `
datasource db {
  provider = "postgresql" // or your DB provider
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`;

// Read and merge all model files from 'prisma/models'
const models = fs
  .readdirSync(modelsDir)
  .filter((file) => file.endsWith('.prisma'))
  .map((file) => fs.readFileSync(path.join(modelsDir, file), 'utf-8'))
  .join('\n');

// Write the merged content into 'schema.prisma'
fs.writeFileSync(outputFile, `${header}\n\n${models}`);

console.log('Prisma schema generated successfully!');
