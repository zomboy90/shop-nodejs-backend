import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      REGION: '${self:provider.region}',
      BUCKET: '${self:custom.bucketName}',
      UPLOADED_FOLDER: '${self:custom.uploadedFolder}',
      PARSED_FOLDER: '${self:custom.parsedFolder}',
    },
    iamRoleStatements: [
      {
        Action: ['s3:ListBucket'],
        Effect: 'Allow',
        Resource: 'arn:aws:s3:::${self:custom.bucketName}'
      },
      {
        Effect: 'Allow',
        Action: [
          's3:*'
        ],
        Resource: 'arn:aws:s3:::${self:custom.bucketName}/*'
      },
    ]
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    bucketName: 'zombo-shop-1-uploaded',
    uploadedFolder: 'uploaded',
    parsedFolder: 'parsed',
    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      watch: {
        pattern: ['src/**/*.ts'],
        ignore: ['temp/**/*']
      },
    },
  },
  resources: {
    Resources: {
      ImportFileBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.bucketName}',
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
