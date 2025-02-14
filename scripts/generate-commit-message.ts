import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

function getGitDiff(): string {
  try {
    return execSync('git diff --cached').toString();
  } catch (error) {
    console.error('Error getting git diff:', error);
    return '';
  }
}

function getChangedFiles(): string[] {
  try {
    return execSync('git diff --cached --name-only')
      .toString()
      .split('\n')
      .filter(Boolean);
  } catch (error) {
    console.error('Error getting changed files:', error);
    return [];
  }
}

function categorizeChanges(files: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    features: [],
    fixes: [],
    docs: [],
    chore: [],
    tests: [],
    refactor: [],
  };

  files.forEach(file => {
    const ext = path.extname(file);
    const filename = path.basename(file);

    // Categorize based on file type and location
    if (filename.includes('test') || filename.includes('spec')) {
      categories.tests.push(file);
    } else if (ext === '.md' || file.includes('docs/')) {
      categories.docs.push(file);
    } else if (filename.startsWith('fix-')) {
      categories.fixes.push(file);
    } else if (
      ['.github', '.gitignore', 'package.json', 'tsconfig.json'].some(item =>
        file.includes(item)
      )
    ) {
      categories.chore.push(file);
    } else if (file.includes('refactor')) {
      categories.refactor.push(file);
    } else {
      categories.features.push(file);
    }
  });

  return categories;
}

function generateCommitMessage(): string {
  const changedFiles = getChangedFiles();
  const categories = categorizeChanges(changedFiles);
  const diff = getGitDiff();

  let message = '';

  // Add category summaries
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      message += `${category}: \n`;
      files.forEach(file => {
        message += `- ${file}\n`;
      });
      message += '\n';
    }
  });

  // Add detailed changes
  message += '\nDetailed Changes:\n';
  message += '----------------\n';
  message += diff;

  return message;
}

function saveCommitMessage(message: string) {
  const outputPath = path.join(process.cwd(), 'COMMIT_MESSAGE.txt');
  fs.writeFileSync(outputPath, message);
  console.log('Commit message generated and saved to:', outputPath);
}

// Execute
const commitMessage = generateCommitMessage();
saveCommitMessage(commitMessage); 