import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {TodoItem} from "../models/TodoItem";
import {TodosAccess} from "../datalayer/TodosAccess";
import {S3Access} from "../datalayer/S3Access";

const uuidv4 = require('uuid/v4');
const todosAccess = new TodosAccess()
const s3Access = new S3Access()

export async function createTodoItem(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuidv4()
    const createdAt = new Date().toISOString();

    const newTodoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false
    }

    return await todosAccess.createTodoItem(newTodoItem)
}

export async function generateUploadUrl(userId: string, todoId: string): Promise<string> {
    const {url, uploadUrl} = s3Access.generateUploadUrl(todoId)
    await todosAccess.addUrlToTodo(userId, todoId, url)
    return uploadUrl
}

export async function getTodoItems(userId: string): Promise<TodoItem[]> {
    return todosAccess.getTodoItems(userId)
}

export async function updateTodoItem(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<void> {
    return todosAccess.updateTodoItem(userId, todoId, todoUpdate)
}

export async function deleteTodoItem(userId: string, todoId: string): Promise<void> {
    await todosAccess.deleteTodoItem(userId, todoId)
    return s3Access.deleteTodoItem(todoId)
}
