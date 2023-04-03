import { formatJSONResponse, notFoundErrorResponse } from "@libs/api-gateway";
import { loadData } from "@libs/load-data";
import { APIGatewayProxyHandler } from "aws-lambda";

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  const { productId } = event.pathParameters;
  const productsList = await loadData();
  const product = productsList.find(product => product.id === productId);
  if (product) {
    return formatJSONResponse({ product });
  }
  return notFoundErrorResponse();
};
