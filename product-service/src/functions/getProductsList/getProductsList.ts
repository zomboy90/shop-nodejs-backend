import { formatJSONResponse } from '@libs/api-gateway';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { StatusCode } from '@types';
import { LogLevel, log } from '@libs/log';
import { ProductService } from '@services/product.service';

const productService = new ProductService();

export const getProductsList: APIGatewayProxyHandler = async () => {
  log(LogLevel.Info, 'Get product list is triggered');
  try {
    const productsList = await productService.getProducts();
    return formatJSONResponse(StatusCode.Ok, productsList);
  } catch(err) {
    return formatJSONResponse(StatusCode.InternalServerError, {
      message: err.message
    });
  }
};
