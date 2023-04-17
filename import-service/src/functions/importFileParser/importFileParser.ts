import { formatJSONResponse } from '@libs/api-gateway';
import { S3Event } from 'aws-lambda';
import { LogLevel, log } from '@libs/log';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, GetObjectCommandInput, DeleteObjectCommandOutput, CopyObjectCommandOutput } from '@aws-sdk/client-s3';
import { Product } from '../../../../product-service/src/types'; // TODO: share model between services

const csv = require('csv-parser');
const client = new S3Client({});

const copyObject = (bucket: string, key: string): Promise<CopyObjectCommandOutput> => {
  const command = new CopyObjectCommand({
    CopySource: `${bucket}/${key}`,
    Bucket: bucket,
    Key: key.replace(process.env.UPLOADED_FOLDER, process.env.PARSED_FOLDER),
  });

  return client.send(command);
};

const deleteObject = (bucket: string, key: string): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return client.send(command);
};

const streamToString = (stream): Promise<Product[]> => new Promise((resolve, reject) => {
  const chunks = [];
  stream.pipe(csv(['id','title','price','description','count']))
    .on('data', (chunk) => chunks.push(chunk))
    .on('error', reject)
    .on('end', () => {
      log(LogLevel.Info, chunks);
      resolve(chunks);
    });
});

const readFile = async (bucket: string, key: string): Promise<Product[]> => {
  const params: GetObjectCommandInput = {
    Bucket: bucket,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const response: GetObjectCommandOutput = await client.send(command);

  const { Body } = response; 

  return streamToString(Body);
};

export const importFileParses = async (event: S3Event) => {
  log(LogLevel.Info, event);

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const result = await readFile(bucket, key);
    log(LogLevel.Info, result);
    
    await copyObject(bucket, key);
    await deleteObject(bucket, key);

    log(LogLevel.Info, 'Successfully moved into Parsed folder');

    return formatJSONResponse({
      message: result,
    });
  } catch(err) {
    log(LogLevel.Error, err);
  }
};