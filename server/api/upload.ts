import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { init } from "@paralleldrive/cuid2";
import { Router } from "express";
const { Jimp } = require("jimp");
const createId = init();
const router = Router();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-1",
});

async function upload(blobName: string, buffer: Buffer, type: string) {
  const params = {
    Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
    Key: blobName,
    Body: buffer,
    ContentType: type,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return {
    Location: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`,
  };
}

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Upload a file with optional image processing
 *     description: Uploads a file to S3 and processes images with thumbnail and scaled versions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - base64
 *             properties:
 *               type:
 *                 type: string
 *                 description: MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
 *               base64:
 *                 type: string
 *                 format: base64
 *                 description: Base64 encoded file content
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 original:
 *                   type: string
 *                   description: URL of the original uploaded file
 *                 thumbnail:
 *                   type: string
 *                   description: URL of the thumbnail version (only for images)
 *                   nullable: true
 *                 scaled:
 *                   type: string
 *                   description: URL of the scaled version (only for images)
 *                   nullable: true
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

// Add this after your other route definitions
router.post("/", async (req, res) => {
  try {
    if (!req.body.type || !req.body.base64) {
      throw "Payload must contain 'type' and 'base64' fields!";
    }

    const originalFileType = req.body.type;
    const originalFileBuffer = Buffer.from(req.body.base64, "base64");
    const folderId = createId();
    const originalFileName = `${folderId}/original.${
      originalFileType.split("/")[1]
    }`;

    const { Location: originalLocation } = await upload(
      originalFileName,
      originalFileBuffer,
      originalFileType
    );

    let body = {
      original: originalLocation,
      thumbnail: undefined,
      scaled: undefined,
    };

    if (originalFileType.split("/")[0] === "image") {
      // Create thumbnail
      const thumbnailImage = await Jimp.fromBuffer(originalFileBuffer);
      const thumbnailFileBuffer = await thumbnailImage
        .resize({ w: 500, h: 500 })
        .getBuffer(originalFileType);

      const thumbnailFileName = `${folderId}/thumbnail.${
        originalFileType.split("/")[1]
      }`;
      const { Location: thumbnailLocation } = await upload(
        thumbnailFileName,
        thumbnailFileBuffer,
        originalFileType
      );
      body.thumbnail = thumbnailLocation;

      // Create scaled version
      const scaledImage = await Jimp.fromBuffer(originalFileBuffer);
      const scaledFileBuffer = await scaledImage
        .resize({ w: 1280, h: Jimp.AUTO })
        .getBuffer(originalFileType);

      const scaledFileName = `${folderId}/scaled.${
        originalFileType.split("/")[1]
      }`;
      const { Location: scaledLocation } = await upload(
        scaledFileName,
        scaledFileBuffer,
        originalFileType
      );
      body.scaled = scaledLocation;
    }

    res.status(200).json(body);
  } catch (error) {
    console.error("File processing error:", error);
    res.status(400).json({ error: error.toString() });
  }
});

export default router;