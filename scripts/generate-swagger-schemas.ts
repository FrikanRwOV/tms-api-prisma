import fs from 'fs';
import path from 'path';

// Helper function to convert TypeScript types to OpenAPI/Swagger types
function convertType(type: string): { type?: string; format?: string; enum?: string[]; $ref?: string } {
  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'Date':
      return { type: 'string', format: 'date-time' };
    default:
      if (/^[A-Z]/.test(type)) {
        return { $ref: `#/components/schemas/${type}` };
      }
      return { type: 'string' };
  }
}

function generateSwaggerSchemas() {
  // Read the typescript interfaces file
  const interfacesPath = path.join(__dirname, '../prisma/typescript-interfaces.ts');
  const content = fs.readFileSync(interfacesPath, 'utf8');

  const schemas: Record<string, any> = {};

  // Extract enums
  const enumRegex = /export type (\w+) = ((?:"[^"]+"\s*\|?\s*)+);/g;
  let enumMatch;
  while ((enumMatch = enumRegex.exec(content)) !== null) {
    const enumName = enumMatch[1];
    const enumValues = enumMatch[2]
      .split('|')
      .map(v => v.trim().replace(/"/g, ''));
    
    schemas[enumName] = {
      type: 'string',
      enum: enumValues
    };
  }

  // Extract interfaces
  const interfaceRegex = /export interface (\w+) {([^}]+)}/g;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const interfaceContent = match[2];

    const properties: Record<string, any> = {};
    const propertyRegex = /(\w+)(\?)?:\s*([\w\[\]\|]+);/g;
    let propertyMatch;

    while ((propertyMatch = propertyRegex.exec(interfaceContent)) !== null) {
      const [, propertyName, optional, propertyType] = propertyMatch;
      
      // Handle array types
      if (propertyType.includes('[]')) {
        const baseType = propertyType.replace('[]', '');
        properties[propertyName] = {
          type: 'array',
          items: convertType(baseType)
        };
      }
      // Handle enum types
      else if (schemas[propertyType]) {
        properties[propertyName] = { ...schemas[propertyType] };
      }
      // Handle reference types
      else if (/^[A-Z]/.test(propertyType)) {
        properties[propertyName] = { $ref: `#/components/schemas/${propertyType}` };
      }
      // Handle basic types
      else {
        properties[propertyName] = convertType(propertyType);
      }

      if (optional) {
        properties[propertyName].nullable = true;
      }
    }

    schemas[interfaceName] = {
      type: 'object',
      properties
    };
  }

  // Write the generated schemas to a file
  const outputPath = path.join(__dirname, '../server/swagger/schemas.ts');
  const outputContent = `
export const schemas = ${JSON.stringify(schemas, null, 2)};
`;

  fs.writeFileSync(outputPath, outputContent);
  console.log('Swagger schemas generated successfully!');
}

if (require.main === module) {
  generateSwaggerSchemas();
}

export default generateSwaggerSchemas; 