import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products/{productId}',
        cors: true,
        responses: {
          200: {
            description: 'Get product by identifier',
            bodyType: 'Product',
          },
          404: {
            description: 'Not found the product',
          }
        }
      }
    }
  ],
};
