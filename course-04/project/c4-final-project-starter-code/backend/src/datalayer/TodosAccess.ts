import * as AWS from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {createLogger} from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('createTodoItem', todoItem)
        return this.docClient.put({
            TableName: this.todosTable,
            Item: {...todoItem}
        })
            .promise()
            .then(() => todoItem)
    }

    async getTodoItems(userId: string): Promise<TodoItem[]> {
        logger.info('getTodoItems', userId)
        return this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {':userId': userId},
            ScanIndexForward: true
        }).promise()
            .then(r => r.Items as TodoItem[])
    }

    async updateTodoItem(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<void> {
        logger.info('updateTodoItem', {userId, todoId, todoUpdate})
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeNames: {'#name': 'name'},
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
            },
            UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
        }).promise()
    }

    async addUrlToTodo(userId: string, todoId: string, url: string): Promise<void> {
        logger.info('addUrl', {userId, todoId, url})
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeValues: {':attachmentUrl': url},
            UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
        }).promise()
    }

    async deleteTodoItem(userId: string, todoId: string): Promise<void> {
        logger.info('deleteTodoItem', {userId, todoId})
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}
