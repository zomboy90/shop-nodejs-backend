import { handlerPath } from '@libs/handler-resolver';

import schema from './schema';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'products',
        cors: true,
        request: {
          schemas: {
            'application/json': schema,
          },
        },
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
