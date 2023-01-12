import * as core from '@actions/core'
import Lambda from 'aws-sdk/clients/lambda'
import fs from 'fs'

async function run() {
    try {
        const LayerName = core.getInput('layer_name', { required: true })
        // const zipFile = core.getInput('zip_file', { required: true })

        const path = require('path')
        const absolutePath = path.resolve('.')
        core.info('my path => ' + absolutePath)

        // const lambdaConfig: Lambda.Types.ClientConfiguration = {
        //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        //     apiVersion: '2015-03-31',
        //     maxRetries: 2,
        //     region: process.env.AWS_REGION,
        //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        //     sslEnabled: true,
        // }

        // const lambda = new Lambda(lambdaConfig)

        // core.info('Publishing...')

        // const response = await lambda
        //     .publishLayerVersion({
        //         Content: {
        //             ZipFile: fs.readFileSync(zipFile),
        //         },
        //         LayerName,
        //     })
        //     .promise()

        // core.info(`Publish Success : ${response.LayerVersionArn}`)
    } catch (error) {
        core.setFailed(error as any)
    }
}

run()
