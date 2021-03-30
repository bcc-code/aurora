import * as bunyan from 'bunyan';
import { LoggingBunyan } from '@google-cloud/logging-bunyan'

// Creates a Bunyan Cloud Logging client
const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
  name: 'firebase',
  streams: [
    {stream: process.stdout, level: 'debug'},
    loggingBunyan.stream('info'),
  ],
});

export { logger };
