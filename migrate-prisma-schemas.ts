const { execSync } = require('child_process');

// Generate a random string for the migration name
const randomString = Math.random().toString(36).substring(2, 10);

console.log('Running migration with name: ' + randomString);
execSync(`npx prisma migrate dev --name ${randomString}`, { stdio: 'inherit' });
