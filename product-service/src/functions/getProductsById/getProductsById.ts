import { formatJSONResponse } from "@libs/api-gateway";
import { ProductService } from "@services/product.service";
import { StatusCode } from "@types";
import { APIGatewayProxyHandler } from "aws-lambda";
import { log } from '@libs/log';

const productService = new ProductService();

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  const { productId } = event.pathParameters;

  log({
    message: 'Get product by id is triggered',
    body: productId
  });

  try {
    const product = await productService.getProductById(productId);
    return formatJSONResponse(StatusCode.Ok, product);
  } catch(err) {
    return formatJSONResponse(StatusCode.NotFoundError, {
      message: err.message
    });
  }
};
