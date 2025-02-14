import * as fs from "fs/promises";
import * as path from "path";
import mjml2html from "mjml";

const TEMPLATE_DIR = "server/helpers/email-templates/mjml/";
const OUTPUT_DIR = "server/helpers/email-templates/ts/";

async function generateEmailTemplates() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Read all files from template directory
    const files = await fs.readdir(TEMPLATE_DIR);

    // Filter for .mjml files
    const mjmlFiles = files.filter((file) => file.endsWith(".mjml"));
    console.log("found", mjmlFiles.length, "mjml files");
    for (const file of mjmlFiles) {
      const filePath = path.join(TEMPLATE_DIR, file);
      const mjmlContent = await fs.readFile(filePath, "utf-8");

      // Convert MJML to HTML
      const { html } = mjml2html(mjmlContent);
      const emailName = file.replace(".mjml", "");

      // Scan for ${} expressions in HTML
      const variables = [];
      const regex = /\${([^}]+)}/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        variables.push(`${match[1]}:string`);
      }
      // Create output filename (replace .mjml with .html)
      const outputFile = path.join(OUTPUT_DIR, file.replace(".mjml", ".ts"));
      console.log(variables);
      // Write the HTML file
      await fs.writeFile(
        outputFile,
        `export const ${emailName}Email = (${variables.join(", ")}) => \`${html}\``
      );
      console.log(`Generated: ${outputFile}`);
    }

    console.log("Email template generation complete!");
  } catch (error) {
    console.error("Error generating email templates:", error);
    process.exit(1);
  }
}

generateEmailTemplates();
