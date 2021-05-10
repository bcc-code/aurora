import Logger, * as bunyan from 'bunyan'
import { LoggingBunyan } from '@google-cloud/logging-bunyan'

// Creates a Bunyan Cloud Logging client
const loggingBunyan = new LoggingBunyan()

const logger = (loggerName: string): Logger =>
    bunyan.createLogger({
        name: loggerName,
        streams: [
            { stream: process.stdout, level: 'debug' },
            loggingBunyan.stream('info'),
        ],
    })

export { logger }
