import { APIGatewayProxyHandler } from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { LogLevel, log } from '@libs/log';

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
  try {
    const s3Client = new S3Client({});
    const requestedFileName = event.queryStringParameters.name;
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: process.env.UPLOADED_FOLDER + '/' + requestedFileName
    });
    const preSignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    });

    log(LogLevel.Info, `Presigned url is successfully created: ${preSignedUrl}`);

    return formatJSONResponse({
        message: preSignedUrl
    });

  } catch (err) {
    log(LogLevel.Error, err);
    return formatJSONResponse({
      message: JSON.stringify(err)
    });
  }
};
