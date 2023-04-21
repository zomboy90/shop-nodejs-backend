import { Product, Stock } from './api-types';

export type CreateProductDTO = Omit<Product, 'id'> & Omit<Stock, 'product_id'>;
