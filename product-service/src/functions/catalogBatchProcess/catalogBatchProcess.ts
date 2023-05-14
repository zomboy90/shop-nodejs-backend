import { formatJSONResponse } from '@libs/api-gateway';
import { LogLevel, log } from '@libs/log';
import { ProductService } from '@services/product.service';
import { StatusCode } from '@types';
import { SQSEvent } from 'aws-lambda';
import  { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const productService = new ProductService();
const snsClient = new SNSClient({ region: process.env.REGION });

export const catalogBatchProcess = async (event: SQSEvent) => {
  log(LogLevel.Info, event);

  const ids: string[] = [];

  try {
    for (const row of event.Records) {
      const createProductDTO = JSON.parse(row.body);
      const id = await productService.createProduct(createProductDTO);
      const message = `Product is successfully created with id ${id}`;
      await snsClient.send(new PublishCommand({
        Message: message,
        TopicArn: process.env.TOPIC_CREATE_PRODUCTS_ARN,
        MessageAttributes: {
          messagePrice: {
            DataType: 'String',
            StringValue: createProductDTO.price < 3 ? 'Sale' : 'Default'
          }
        }
      }));
      log(LogLevel.Info, message);
    }
    
    return formatJSONResponse(StatusCode.Ok, ids);
  } catch(err) {
    log(LogLevel.Error, err);
    return formatJSONResponse(StatusCode.InternalServerError, err);
  }
};
