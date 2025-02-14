import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Function to extract enums from schema
function extractEnums(schemaContent: string): Record<string, string[]> {
  const enumRegex = /enum\s+(\w+)\s*{([^}]*)}/g;
  const enums: Record<string, string[]> = {};

  let match;
  while ((match = enumRegex.exec(schemaContent))) {
    const enumName = match[1];
    const enumValues = match[2]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//')) // Remove empty lines and comments
      .map(value => value.replace(/\s*\/\/.*$/, '')); // Remove inline comments if any

    enums[enumName] = enumValues;
  }

  return enums;
}

// Main function
async function generateEnumJsonFiles() {
  try {
    // Read the schema file
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = readFileSync(schemaPath, 'utf-8');

    // Extract enums
    const enums = extractEnums(schemaContent);

    // Create enums directory if it doesn't exist
    const enumsDir = join(process.cwd(), 'server', 'enums');
    mkdirSync(enumsDir, { recursive: true });

    // Generate individual JSON files
    Object.entries(enums).forEach(([enumName, values]) => {
      const enumObject = {
        name: enumName,
        values: values,
        lookup: Object.fromEntries(values.map(value => [value, value])),
        options: values.map(value => ({
          label: value
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim(), // Remove any leading/trailing spaces
          value: value
        }))
      };

      const filePath = join(enumsDir, `${enumName.toLowerCase()}.json`);
      writeFileSync(filePath, JSON.stringify(enumObject, null, 2));
    });

    // Generate index.ts file
    const indexContent = Object.keys(enums)
      .map(enumName => `export { default as ${enumName} } from './${enumName.toLowerCase()}.json';`)
      .join('\n');

    writeFileSync(join(enumsDir, 'index.ts'), indexContent + '\n');

    console.log('Successfully generated enum JSON files!');
  } catch (error) {
    console.error('Error generating enum JSON files:', error);
  }
}

// Run the script
generateEnumJsonFiles(); 