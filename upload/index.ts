import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { init } from "@paralleldrive/cuid2";
const { Jimp } = require("jimp");
const createId = init();


const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-1",
});

/**
 * Summary: File upload handling and image processing.
 *
 * Description: Uploads provided files to aws s3 and additionally performs
 * resize processing on images.
 *
 * @param {Object} event Lambda function invocation event.
 *
 * @return {Object}      An object containing the response status and payload.
 */
async function fileservice(event) {
  try {
  

    // check if a request body is present and parse JSON
    if (!event.body) {
      throw "Please provide a JSON payload!";
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      throw "Invalid JSON payload!";
    }

    if (!payload.type || !payload.body) {
      throw "Payload must contain 'type' and 'body' fields!";
    }

    console.log("payload", payload);  

    // get the file type from payload
    const originalFileType = payload.type;

    // get the file buffer from base64-encoded body
    const originalFileBuffer = Buffer.from(payload.body, "base64");

    // generate a unique folder id
    const folderId = createId();

    // concat folderId with original file name
    const originalFileName = `${folderId}/original.${originalFileType.split("/")[1]}`;

    // upload the file to s3
    const { Location: originalLocation } = await upload(
      originalFileName,
      originalFileBuffer,
      originalFileType
    );

    // initialise the response body with the original file url
    let body = {
      original: originalLocation,
      thumbnail: undefined,
      scaled: undefined,
    };
    console.log("originalFileType", originalFileType);
    // check if file is an image, in order to perform image processing
    if (originalFileType.split("/")[0] === "image" ) {
      // Create thumbnail
      const thumbnailImage = await Jimp.fromBuffer(originalFileBuffer);
      const thumbnailFileBuffer = await thumbnailImage
        .resize({ w: 500, h: 500 })
        .getBuffer(getJimpMimeType(originalFileType));

      // concat folderId with thumbnail file name and file extension
      const thumbnailFileName = `${folderId}/thumbnail.${originalFileType.split("/")[1]}`;

      // upload the file to s3
      const { Location: thumbnailLocation } = await upload(
        thumbnailFileName,
        thumbnailFileBuffer,
        originalFileType
      );

      // add the thumbnail image file url to the response body
      body.thumbnail = thumbnailLocation;

      // Create scaled version
      const scaledImage = await Jimp.fromBuffer(originalFileBuffer);
      const scaledFileBuffer = await scaledImage
        .resize({w: 1280, h: Jimp.AUTO})
        .getBuffer(getJimpMimeType(originalFileType));

      // concat folderId with thumbnail file name and file extension
      const scaledFileName = `${folderId}/scaled.${originalFileType.split("/")[1]}`;

      // upload the file to s3
      const { Location: scaledLocation } = await upload(
        scaledFileName,
        scaledFileBuffer,
        originalFileType
      );

      // add the scaled image file url to the response body
      body.scaled = scaledLocation;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(body),
    };
  } catch (error) {
    console.error('Jimp processing error:', error);
    // catch all errors and return to client with 400 status
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(error),
    };
  }
}

/**
 * Summary: Uploads a file to aws s3.
 *
 * Description: Uploads a file to aws s3.
 *
 * @param {String} blobName Name of the file to upload.
 * @param {Object} buffer   Actual file buffer.
 * @param {Object} type     File mime type.
 *
 * @return {Object}         An object containing the upload request response.
 */
async function upload(blobName, buffer, type) {
  const params = {
    Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
    Key: blobName,
    Body: buffer,
    ContentType: type,
  };

  const command = new PutObjectCommand(params);
  const response = await s3Client.send(command);
  return { Location: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}` };
}

function getJimpMimeType(mimeType: string) {
  switch(mimeType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return Jimp.MIME_JPEG;
    case 'image/png':
      return Jimp.MIME_PNG;
    case 'image/bmp':
      return Jimp.MIME_BMP;
    default:
      return Jimp.MIME_JPEG; // default fallback
  }
}

exports.fileservice = fileservice;
