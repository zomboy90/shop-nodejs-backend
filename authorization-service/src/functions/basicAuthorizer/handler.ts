import { LogLevel, log } from '@libs/log';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent) => {
    log(LogLevel.Info, event);

    const { USER } = process.env;
    const { PASSWORD } = process.env;

    const auth = Buffer.from(`${USER}:${PASSWORD}`).toString('base64');

    log(LogLevel.Info, process.env);

    const Effect = event.authorizationToken?.split(' ').pop() === auth ? 'Allow' : 'Deny';

    return {
        principalId: event.type.toString(),
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect,
                    Resource: event.methodArn,
                },
            ],
        }
    };
};

export const main = basicAuthorizer;
