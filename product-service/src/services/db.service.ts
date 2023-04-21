import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DBService {
  private _ddbClient: DynamoDBClient;
  private _ddbDocClient: DynamoDBDocumentClient;

  constructor() {
    this._ddbClient = new DynamoDBClient({ apiVersion: '2012-08-10' });
    this._ddbDocClient = DynamoDBDocumentClient.from(this._ddbClient, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
      },
      unmarshallOptions: {
        wrapNumbers: false
      },
    });
  }

  get ddbClient(): DynamoDBClient {
    return this._ddbClient;
  }

  get ddbDocClient(): DynamoDBDocumentClient {
    return this._ddbDocClient;
  }

  
}
