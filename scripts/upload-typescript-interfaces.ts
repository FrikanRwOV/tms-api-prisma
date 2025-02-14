import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-1",
});

async function uploadTypescriptInterfaces() {
  try {
    const bucketName = process.env.SWAGGER_BUCKET_NAME;
    const stage = process.env.STAGE || "dev";

    if (!bucketName) {
      throw new Error("SWAGGER_BUCKET_NAME environment variable is not set");
    }

    // Read the TypeScript interfaces file
    const interfacesContent = fs.readFileSync(
      "./prisma/typescript-interfaces.ts",
      "utf8"
    );

    // Upload to S3
    const uploadParams = {
      Bucket: `${bucketName}-${stage}`,
      Key: "typescript-interfaces.ts",
      Body: interfacesContent,
      ContentType: "application/x-typescript",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    console.log(
      `TypeScript interfaces uploaded to s3://${bucketName}-${stage}/typescript-interfaces.ts`
    );
  } catch (error) {
    console.error("Error uploading TypeScript interfaces:", error);
    throw error;
  }
}

if (require.main === module) {
  uploadTypescriptInterfaces();
}

export default uploadTypescriptInterfaces; 