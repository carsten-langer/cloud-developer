import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {deleteTodoItem} from "../../businesslogic/Todos";
import {cors} from "middy/middlewares";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";

const middy = require("middy");
const logger = createLogger('deleteTodo')

// TODO: Remove a TODO item by id
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    await deleteTodoItem(userId, todoId)

    logger.info('Returning 204')
    return {
        statusCode: 204,
        body: ''
    }
})

handler.use(
    cors({
        credentials: true
    })
)
