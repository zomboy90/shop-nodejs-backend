export enum LogLevel {
  Info = 'Info',
  Error = 'Error',
}

export function log(logLevel: LogLevel, message: string | Record<string, any>): void {
  console.log(`[${ logLevel }]: ${ typeof message === 'string' ? message : JSON.stringify(message) }`);
}
