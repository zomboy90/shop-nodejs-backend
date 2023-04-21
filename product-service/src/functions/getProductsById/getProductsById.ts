import { formatJSONResponse } from "@libs/api-gateway";
import { ProductService } from "@services/product.service";
import { StatusCode } from "@types";
import { APIGatewayProxyHandler } from "aws-lambda";
import { log, LogLevel } from '@libs/log';

const productService = new ProductService();

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  const { productId } = event.pathParameters;

  log(LogLevel.Info, 'Get product by id is triggered');
  log(LogLevel.Info, productId);

  try {
    const product = await productService.getProductById(productId);
    return formatJSONResponse(StatusCode.Ok, product);
  } catch(err) {
    return formatJSONResponse(StatusCode.NotFoundError, {
      message: err.message
    });
  }
};
