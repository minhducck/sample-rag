import * as dotenv from 'dotenv'

export const APPLICATION_CONFIGURATION = dotenv.config()?.parsed ?? {};
