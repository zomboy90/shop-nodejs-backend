import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { LogLevel, log } from '@libs/log';
import { ProductService } from '@services/product.service';
import schema from './schema';
import { CreateProductDTO, StatusCode } from '@types';

const productService = new ProductService();

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  log(LogLevel.Info, 'Creation of product is triggered');
  log(LogLevel.Info, event.body);

  const { title } = event.body;

  try {
    const id = await productService.createProduct(event.body as CreateProductDTO);

    return formatJSONResponse(StatusCode.Ok, {
      message: `Product "${ title }" successfully created with id ${ id }`
    });
  } catch(err) {
    return formatJSONResponse(StatusCode.InternalServerError, {
      message: err.message
    });
  }
};
