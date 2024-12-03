import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import SwaggerUI from "swagger-ui-dist";
const swaggerJson = require('./swagger.json')
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-1",
});

async function generateAndUploadSwaggerHtml() {
  try {
    const bucketName = process.env.SWAGGER_BUCKET_NAME;
    const stage = process.env.STAGE || "dev";

    if (!bucketName) {
      throw new Error("SWAGGER_BUCKET_NAME environment variable is not set");
    }

    // Get the swagger-ui-dist files
    const swaggerDistPath = SwaggerUI.getAbsoluteFSPath();

    // Read the swagger-ui standalone HTML template
    const htmlTemplate = fs.readFileSync(
      `${swaggerDistPath}/swagger-initializer.js`,
      "utf8"
    );

    const swaggerJsonUrl = `https://${bucketName}-${stage}.s3.amazonaws.com/${stage}/swagger.json`;

    // Create custom HTML with embedded Swagger spec
    const customHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
    <style>
        .swagger-ui .topbar { display: none }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js"></script>
    <script src="./swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '${swaggerJsonUrl}',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true
            });
        };
    </script>
</body>
</html>`;

    // Files to upload
    const files = [
      {
        name: "index.html",
        content: customHtml,
        contentType: "text/html",
      },
      {
        name: "swagger-ui.css",
        content: fs.readFileSync(`${swaggerDistPath}/swagger-ui.css`),
        contentType: "text/css",
      },
      {
        name: "swagger-ui-bundle.js",
        content: fs.readFileSync(`${swaggerDistPath}/swagger-ui-bundle.js`),
        contentType: "application/javascript",
      },
      {
        name: "swagger-ui-standalone-preset.js",
        content: fs.readFileSync(
          `${swaggerDistPath}/swagger-ui-standalone-preset.js`
        ),
        contentType: "application/javascript",
      },
      {
        name: "swagger.json",
        content: JSON.stringify(swaggerJson),
        contentType: "application/json",
      },
    ];

    // Upload all files
    for (const file of files) {
      const uploadParams = {
        Bucket: `${bucketName}-${stage}`,
        Key: `${stage}/${file.name}`,
        Body: file.content,
        ContentType: file.contentType,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
    }

    console.log(
      `Swagger documentation uploaded to s3://${bucketName}-${stage}/${stage}/`
    );
  } catch (error) {
    console.error(
      "Error generating and uploading Swagger documentation:",
      error
    );
    throw error;
  }
}

if (require.main === module) {
  generateAndUploadSwaggerHtml();
}

export default generateAndUploadSwaggerHtml;
