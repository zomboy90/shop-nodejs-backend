export interface Log {
  message: string;
  body?: any;
}

export const log = (message: Log) => {
  console.log(`🐾 [Log]: ${message.message} ${message.body ? JSON.stringify(message.body) : ''}`);
}
