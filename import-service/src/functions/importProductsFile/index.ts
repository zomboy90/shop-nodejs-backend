import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'import',
        authorizer: 'arn:aws:lambda:us-east-1:649764365395:function:authorization-service-dev-basicAuthorizer',
        cors: true,
      },
    },
  ],
};
