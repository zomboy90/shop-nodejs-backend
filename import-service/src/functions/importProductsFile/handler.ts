import { middyfy } from '@libs/lambda';
import { importProductsFile } from './importProductsFile';

export const main = middyfy(importProductsFile);
