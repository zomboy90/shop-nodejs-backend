import { formatJSONResponse } from '@libs/api-gateway';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { loadData } from '@libs/load-data';

export const getProductsList: APIGatewayProxyHandler = async () => {
  const productsList = await loadData();
  return formatJSONResponse(productsList);
};
