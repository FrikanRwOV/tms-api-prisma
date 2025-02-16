import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { init } from "@paralleldrive/cuid2";
import sharp from "sharp";
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
    console.log("sharp", event);
    if (!sharp) {
      throw new Error('Sharp is not initialized');
    }

    // check if a request body is present
    if (!event.body) {
      throw "Please provide a binary file!";
    }

    // get the content-type header
    const contentType =
      event.headers["Content-Type"] || event.headers["content-type"];

    // get the original file buffer from the request body
    const originalFileBuffer = Buffer.from(event.body, "base64");

    // determine the file mime type and extension
    const originalFileType = contentType;

    // generate a unique folder id
    const folderId = createId();

    // concat folderId with original file name
    const originalFileName = `${folderId}/original`;

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

    // check if file is an image, in order to perform image processing
    if (originalFileType.split("/")[0] === "image") {
      // resize the image to 500 x 500 and get the new file buffer
      const thumbnailFileBuffer = await sharp(originalFileBuffer)
        .resize(500, 500)
        .toBuffer();

      // concat folderId with thumbnail file name and file extension
      const thumbnailFileName = `${folderId}/thumbnail`;

      // upload the file to s3
      const { Location: thumbnailLocation } = await upload(
        thumbnailFileName,
        thumbnailFileBuffer,
        originalFileType
      );

      // add the thumbnail image file url to the response body
      body.thumbnail = thumbnailLocation;

      // resize the image to 1280 x ? and get the new file buffer
      const scaledFileBuffer = await sharp(originalFileBuffer)
        .resize(1280)
        .toBuffer();

      // concat folderId with thumbnail file name and file extension
      const scaledFileName = `${folderId}/scaled`;

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
    console.error('Sharp processing error:', error);
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
    ACL: "public-read",
  };

  const command = new PutObjectCommand(params);
  const response = await s3Client.send(command);
  return { Location: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}` };
}

exports.fileservice = fileservice;
