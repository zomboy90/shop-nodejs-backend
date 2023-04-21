import { SQSClient, SendMessageBatchRequest, SendMessageBatchCommand, SendMessageBatchRequestEntry } from  "@aws-sdk/client-sqs";
import { formatJSONResponse } from '@libs/api-gateway';
import { S3Event } from 'aws-lambda';
import { LogLevel, log } from '@libs/log';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, GetObjectCommandInput, DeleteObjectCommandOutput, CopyObjectCommandOutput } from '@aws-sdk/client-s3';
import { Product } from '../../../../product-service/src/types'; // TODO: share model between services

const csv = require('csv-parser');
const client = new S3Client({});
const sqsClient = new SQSClient({});

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
    .on('end', () => resolve(chunks));
});

const sendProducts = (products: Product[]) => {
  const params: SendMessageBatchRequest = {
    Entries: products.map(product => {
      return {
        Id: product.id,
        MessageBody: JSON.stringify(product),
      } as SendMessageBatchRequestEntry;
    }),
    QueueUrl: `https://sqs.${process.env.REGION}.amazonaws.com/${process.env.ACCOUNT_ID}/${process.env.QUEUE_NAME}`
  };

  log(LogLevel.Info, params);

  return sqsClient.send(new SendMessageBatchCommand(params));
};

const readFile = async (bucket: string, key: string): Promise<Product[]> => {
  const params: GetObjectCommandInput = {
    Bucket: bucket,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const response: GetObjectCommandOutput = await client.send(command);

  const { Body } = response; 

  return streamToString(Body).then((products: Product[]) => products.map(product => ({ ...product, count: Number(product.count), price: Number(product.price) })));
};

export const importFileParses = async (event: S3Event) => {
  log(LogLevel.Info, event);
  log(LogLevel.Info, client.config);

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const products = await readFile(bucket, key);
    
    await copyObject(bucket, key);
    await deleteObject(bucket, key);

    const r = await sendProducts(products);
    log(LogLevel.Info, r);

    return formatJSONResponse({
      message: products,
    });
  } catch(err) {
    log(LogLevel.Error, err);
  }
};