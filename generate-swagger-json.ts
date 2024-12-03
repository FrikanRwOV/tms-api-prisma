import fs from 'fs';
import swaggerSpec from './server/swagger';

// Write swagger.json
fs.writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger JSON generated successfully');
