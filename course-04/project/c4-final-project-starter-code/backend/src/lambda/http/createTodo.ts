import {cors} from 'middy/middlewares'
import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {createTodoItem} from "../../businesslogic/Todos";
import {getUserId} from "../utils";
import {createLogger} from '../../utils/logger'

const middy = require("middy");
const logger = createLogger('createTodo')

// TODO: Implement creating a new TODO item
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const todoItem = {item: await createTodoItem(newTodo, userId)}

    logger.info('Returning', todoItem)
    return {
        statusCode: 201,
        body: JSON.stringify(todoItem)
    }
})

handler.use(
    cors({
        credentials: true
    })
)
