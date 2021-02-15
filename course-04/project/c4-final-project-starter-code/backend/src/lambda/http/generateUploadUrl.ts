import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {generateUploadUrl} from "../../businesslogic/Todos";
import {cors} from "middy/middlewares";
import {createLogger} from "../../utils/logger";
import {getUserId} from "../utils";

const middy = require("middy");
const logger = createLogger('generateUploadUrl')

// TODO: Return a presigned URL to upload a file for a TODO item with the provided id
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const uploadUrl = {uploadUrl: await generateUploadUrl(userId, todoId)}

    logger.info('Returning', uploadUrl)
    return {
        statusCode: 200,
        body: JSON.stringify(uploadUrl)
    }
})

handler.use(
    cors({
        credentials: true
    })
)
