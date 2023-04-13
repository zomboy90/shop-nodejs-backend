import { middyfy } from '@libs/lambda';
import { createProduct } from './createProduct';

export const main = middyfy(createProduct);
