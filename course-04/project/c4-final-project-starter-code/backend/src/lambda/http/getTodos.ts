import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {cors} from "middy/middlewares";
import {getTodoItems} from "../../businesslogic/Todos";
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";

const middy = require("middy");
const logger = createLogger('getTodos')

// TODO: Get all TODO items for a current user
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const userId = getUserId(event)
    const todoItems = {items: await getTodoItems(userId)}

    logger.info('Returning', todoItems)
    return {
        statusCode: 200,
        body: JSON.stringify(todoItems)
    }
})

handler.use(
    cors({
        credentials: true
    })
)

