import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { log } from '@libs/log';
import { v4 as uuidv4 } from 'uuid';
import { ProductService } from '@services/product.service';
import schema from './schema';
import { StatusCode } from '@types';

const productService = new ProductService();

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { title, description, price, count } = event.body;

  log({
    message: 'Creation of product is triggered',
    body: event.body
  });

  const product = { id: uuidv4(), title, description, price };
  const stock = { product_id: product.id, count };

  try {
    const id = await productService.createProduct(product, stock);

    return formatJSONResponse(StatusCode.Ok, {
      message: `Product "${ title }" successfully created.`,
      id
    });
  } catch(err) {
    return formatJSONResponse(StatusCode.InternalServerError, {
      message: err.message
    });
  }
};
