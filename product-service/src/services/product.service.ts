import { AttributeValue, ScanCommand, ScanCommandOutput, TransactWriteItemsCommand, ExecuteStatementCommand, ExecuteStatementCommandOutput } from '@aws-sdk/client-dynamodb';
import { DBService } from './db.service';
import { Product, Stock } from '@types';

export class ProductService {
  private readonly dbService: DBService;

  constructor() {
    this.dbService = new DBService();
  }

  private convertCommandOutputIntoProductModel(products: Record<string, AttributeValue>[], stocks: Record<string, AttributeValue>[]): Product[] {
    const newProductList = products.map(item => {
      return {
        id: item.id?.S,
        title: item.title?.S,
        description: item.description?.S,
        price: +item.price?.N
      }
    });
    const newStocksList = stocks.map(item => {
      return {
        product_id: item.product_id?.S,
        count: +item.count?.N
      }
    });

    const result = newProductList.map(product => {
      const stock = newStocksList.find(s => s.product_id === product.id);
      return { ...product, count: stock?.count };
    });

    return result;
  }

  private convertModelIntoCommandInputItem(item: unknown): Record<string, AttributeValue> {
    const commandInputItem = {};
    for (const [key, value] of Object.entries(item)) {
      if (value) {
        commandInputItem[key] = { [(typeof value).slice(0, 1).toUpperCase()]: value.toString() };
      }
    }
    return commandInputItem;
  }

  public async getProducts(): Promise<Product[]> {
    const productsTableParams = {
      TableName: process.env.TABLE_PRODUCTS,
    };

    const stocksTableParams = {
      TableName: process.env.TABLE_STOCKS,
    };

    try {
      const productsOutput: ScanCommandOutput = await this.dbService.ddbClient.send(new ScanCommand(productsTableParams));
      const stocksOutput: ScanCommandOutput = await this.dbService.ddbClient.send(new ScanCommand(stocksTableParams));

      return this.convertCommandOutputIntoProductModel(productsOutput.Items, stocksOutput.Items);
    } catch(err) {
      throw new Error('Failed to fetch products');
    }
  };

  public async createProduct(product: Product, stock: Stock): Promise<string> {
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: process.env.TABLE_PRODUCTS,
            Item: this.convertModelIntoCommandInputItem(product),
            ConditionExpression: `attribute_not_exists(#id)`,
            ExpressionAttributeNames: { "#id": "id" },
          }
        },
        {
          Put: {
            TableName: process.env.TABLE_STOCKS,
            Item: this.convertModelIntoCommandInputItem(stock),
            ConditionExpression: `attribute_not_exists(#product_id)`,
            ExpressionAttributeNames: { "#product_id": "product_id" },
          }
        }
      ]
    };

    try {
      await this.dbService.ddbClient.send(new TransactWriteItemsCommand(params));
      return product.id;
    } catch(err) {
      throw new Error(`${err.name} ${err.message}`);
    }
  }

  public async getProductById(id: string): Promise<Product[]> {
    const productsTableParams = {
      Statement: `SELECT * FROM ${ process.env.TABLE_PRODUCTS } where id=?`,
      Parameters: [{ S: id }],
    };
    const stocksTableParams = {
      Statement: `SELECT * FROM ${ process.env.TABLE_STOCKS } where product_id=?`,
      Parameters: [{ S: id }],
    };
    try {
      const product: ExecuteStatementCommandOutput = await this.dbService.ddbDocClient.send(new ExecuteStatementCommand(productsTableParams));
      const stock: ExecuteStatementCommandOutput = await this.dbService.ddbDocClient.send(new ExecuteStatementCommand(stocksTableParams));
      return this.convertCommandOutputIntoProductModel(product.Items, stock.Items);
    } catch(err) {
      throw new Error(`Product with id "${ id }" not found`);
    }
  }

}
