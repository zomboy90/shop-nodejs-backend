import type { AWS } from '@serverless/typescript';

import { createProduct, getProductsById, getProductsList, catalogBatchProcess } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_PRODUCTS: 'products',
      TABLE_STOCKS: 'stocks',
      REGION: '${self:provider.region}',
      ACCOUNT_ID: '${self:custom.accountId}',
      TOPIC_CREATE_PRODUCTS_ARN: 'arn:aws:sns:${self:provider.region}:${self:custom.accountId}:${self:custom.topicCreateProducts}'
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:DescribeTable',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:PartiQLInsert',
          'dynamodb:PartiQLUpdate',
          'dynamodb:PartiQLDelete',
          'dynamodb:PartiQLSelect'
        ],
        Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/*'
      },
      {
        Effect: 'Allow',
        Action: [
          'sqs:*'
        ],
        Resource: 'arn:aws:sqs:${self:provider.region}:${self:custom.accountId}:*'
      },
      {
        Effect: 'Allow',
        Action: [
          'sns:*'
        ],
        Resource: 'arn:aws:sns:${self:provider.region}:${self:custom.accountId}:*'
      }
    ]
  },
  // import the function via paths
  functions: { createProduct, getProductsById, getProductsList, catalogBatchProcess },
  package: { individually: true },
  custom: {
    accountId: '649764365395',
    queueCatalogItems: 'catalogItemsQueue',
    topicCreateProducts: 'createProductsTopic',
    email1: 'raj90zomboy@gmail.com',
    email2: 'darkesthour543@mail.ru',
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
      }
    },
    autoswagger: {
      generateSwaggerOnDeploy: true,
      host: 'qwoeu1qbla.execute-api.us-east-1.amazonaws.com/dev',
    }
  },
  resources: {
    Resources: {
      products: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'products',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            },
            {
              AttributeName: 'title',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'title',
              KeyType: 'RANGE'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      },
      stocks: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'stocks',
          AttributeDefinitions: [
            {
              AttributeName: 'product_id',
              AttributeType: 'S'
            },
            {
              AttributeName: 'count',
              AttributeType: 'N'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'product_id',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'count',
              KeyType: 'RANGE'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      },
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: '${self:custom.queueCatalogItems}',
        }
      },
      createProductsTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: '${self:custom.topicCreateProducts}'
        }
      },
      createProductsSubscriptionDefault: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: '${self:custom.email1}',
          TopicArn: {
            Ref: 'createProductsTopic'
          },
          FilterPolicy: {
            messagePrice: ['Default']
          }
        }
      },
      createProductsSubscriptionDiscount: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: '${self:custom.email2}',
          TopicArn: {
            Ref: 'createProductsTopic'
          },
          FilterPolicy: {
            messagePrice: ['Default', 'Sale']
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
