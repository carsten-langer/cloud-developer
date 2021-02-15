import * as AWS from 'aws-sdk'
import {createLogger} from "../utils/logger";

//const AWSXRay = require('aws-xray-sdk')
//const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('S3Access')
const urlExpiration = process.env.TODOS_S3_SIGNED_URL_EXPIRATION
const bucket = process.env.TODOS_S3_BUCKET

export class S3Access {
    constructor(
        private readonly s3Client = createS3Client(),
        private readonly todosBucket = bucket) {
    }

    generateUploadUrl(todoId: string): { url: string, uploadUrl: string } {
        const uploadUrl = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.todosBucket,
            Key: todoId,
            Expires: parseInt(urlExpiration)
        })
        const url = uploadUrl.split('?')[0]
        logger.info('generateUploadUrl', {url, uploadUrl})
        return {url, uploadUrl}
    }

    async deleteTodoItem(todoId: string): Promise<void> {
        logger.info('deleteObject', todoId)
        await this.s3Client.deleteObject( {
            Bucket: this.todosBucket,
            Key: todoId
        }).promise()
    }
}

function createS3Client() {
    // if (process.env.IS_OFFLINE) {
    // ...
    // }
    return new AWS.S3({signatureVersion: 'v4'})
}
