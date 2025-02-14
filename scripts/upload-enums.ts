import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-1",
});

async function uploadTypescriptEnums() {
  try {
    const bucketName = process.env.SWAGGER_BUCKET_NAME;
    const stage = process.env.STAGE || "dev";

    if (!bucketName) {
      throw new Error("SWAGGER_BUCKET_NAME environment variable is not set");
    }

    // Get all files from the enums directory
    const enumsDir = path.join(process.cwd(), "server", "enums");
    const files = fs.readdirSync(enumsDir);

    // Upload each file to S3
    for (const file of files) {
      const filePath = path.join(enumsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      
      // Determine content type based on file extension
      const contentType = file.endsWith('.json') 
        ? 'application/json'
        : file.endsWith('.ts') 
          ? 'application/x-typescript'
          : 'text/plain';

      const uploadParams = {
        Bucket: `${bucketName}-${stage}`,
        Key: `enums/${file}`,
        Body: fileContent,
        ContentType: contentType,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log(
        `Uploaded ${file} to s3://${bucketName}-${stage}/enums/${file}`
      );
    }

    console.log("All enum files uploaded successfully!");
  } catch (error) {
    console.error("Error uploading TypeScript enums:", error);
    throw error;
  }
}

if (require.main === module) {
  uploadTypescriptEnums();
}

export default uploadTypescriptEnums; 