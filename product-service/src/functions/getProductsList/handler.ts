import { middyfy } from '@libs/lambda';
import { getProductsList } from './getProductsList';

export const main = middyfy(getProductsList);
