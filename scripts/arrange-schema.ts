import fs from 'fs';
import path from 'path';

function arrangeSchema(schemaPath: string) {
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const lines = content.split('\n');

  // Initialize sections
  let generators: string[] = [];
  let datasource: string[] = [];
  let models: { name: string; content: string[] }[] = [];
  let enums: { name: string; content: string[] }[] = [];
  
  let currentSection: string[] = [];
  let currentType = '';
  let currentName = '';

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section starts
    if (line.startsWith('generator ')) {
      if (currentSection.length > 0) {
        addToappropriateSection(currentType, currentName, currentSection);
      }
      currentType = 'generator';
      currentSection = [line];
    } else if (line.startsWith('datasource ')) {
      if (currentSection.length > 0) {
        addToappropriateSection(currentType, currentName, currentSection);
      }
      currentType = 'datasource';
      currentSection = [line];
    } else if (line.startsWith('model ')) {
      if (currentSection.length > 0) {
        addToappropriateSection(currentType, currentName, currentSection);
      }
      currentType = 'model';
      currentName = line.split(' ')[1];
      currentSection = [line];
    } else if (line.startsWith('enum ')) {
      if (currentSection.length > 0) {
        addToappropriateSection(currentType, currentName, currentSection);
      }
      currentType = 'enum';
      currentName = line.split(' ')[1];
      currentSection = [line];
    } else if (line.trim() === '') {
      if (currentSection.length > 0) {
        addToappropriateSection(currentType, currentName, currentSection);
        currentSection = [];
        currentType = '';
        currentName = '';
      }
    } else {
      currentSection.push(line);
    }
  }

  // Add the last section if exists
  if (currentSection.length > 0) {
    addToappropriateSection(currentType, currentName, currentSection);
  }

  function addToappropriateSection(type: string, name: string, section: string[]) {
    switch (type) {
      case 'generator':
        generators.push(...section, '');
        break;
      case 'datasource':
        datasource.push(...section, '');
        break;
      case 'model':
        models.push({ name, content: [...section, ''] });
        break;
      case 'enum':
        enums.push({ name, content: [...section, ''] });
        break;
    }
  }

  // Sort models and enums alphabetically
  models.sort((a, b) => a.name.localeCompare(b.name));
  enums.sort((a, b) => a.name.localeCompare(b.name));

  // Combine all sections
  const arrangedContent = [
    ...generators,
    ...datasource,
    ...models.flatMap(m => m.content),
    ...enums.flatMap(e => e.content)
  ].join('\n');

  // Write back to file
  fs.writeFileSync(schemaPath, arrangedContent);
  console.log('Schema file has been rearranged successfully!');
}

// Execute the script
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
arrangeSchema(schemaPath); 