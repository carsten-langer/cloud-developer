import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {cors} from "middy/middlewares";
import {updateTodoItem} from "../../businesslogic/Todos";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";

const middy = require("middy");
const logger = createLogger('updateTodo')

// TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const todoUpdate: UpdateTodoRequest = JSON.parse(event.body)
    await updateTodoItem(userId, todoId, todoUpdate)

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
