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
      ACCOUNT_ID: '${self:custom.accountId}',
      QUEUE_NAME: '${self:custom.queueName}',
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
      {
        Effect: 'Allow',
        Action: [
          'sqs:SendMessage'
        ],
        Resource: 'arn:aws:sqs:${self:provider.region}:${self:custom.accountId}:*'
      }
    ]
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    bucketName: 'zombo-shop-1-uploaded',
    uploadedFolder: 'uploaded',
    parsedFolder: 'parsed',
    accountId: '649764365395',
    queueName: 'catalogItemsQueue',
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
          CorsConfiguration: {
            CorsRules: [
                {
                    AllowedOrigins: ['*'],
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['PUT'],
                    MaxAge: 3000
                }
            ]
          }
        }
      },
      ApiGatewayResponse4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,PUT,POST,OPTIONS'"
          },
          RestApiId: '88xgxr26h3',
          ResponseType: 'DEFAULT_4XX'
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
