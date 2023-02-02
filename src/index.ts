import * as core from '@actions/core'
import Lambda from 'aws-sdk/clients/lambda'
import fs from 'fs'
import { execSync } from 'child_process'

const checkIfFileExists = async (filePath: string) => {
    try {
        return (await fs.promises.stat(filePath)).isFile()
    } catch (err) {
        return false
    }
}

const waitTillFilesExists = async (
    /**Path of the file to check. */
    filePath: string,
    /**Check for existence every x amount of milliseconds. @default 10 */
    checkEvery: number = 100,
    /**Check until x amount of milliseconds have passed. Reject the promise after that. @default 5000 */
    checkUntil: number = 5000
) => {
    let counter = 0 // keep track of how many times the setInterval has run
    return new Promise((res, rej) => {
        const id = setInterval(async () => {
            counter++
            const fileExists = await checkIfFileExists(filePath)
            if (fileExists) {
                clearInterval(id)
                res(true)
            } else {
                if (counter >= checkUntil / checkEvery) {
                    clearInterval(id)
                    rej(
                        `The file ${filePath} was not found after ${(checkEvery *
                            counter) /
                            1000} second(s).`
                    )
                }
            }
        }, checkEvery)
    })
}

async function run() {
    try {
        const LayerName = process.env.AWS_LAYER_NAME
        if (!LayerName) {
            throw new Error('layer name not found.')
        }
        const zipFile = 'build.zip'

        const repository = process.env.GITHUB_REPOSITORY!
        const repoName = repository.slice(repository.lastIndexOf('/') + 1)
        const targetPath = `/tmp/${repoName}`

        core.info('Cloning repository...')
        execSync(
            `git clone ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`,
            {
                cwd: '/tmp',
                stdio: 'inherit',
            }
        )

        core.info('Checking out into the target branch...')
        execSync(`git checkout ${process.env.GITHUB_REF_NAME}`, {
            cwd: targetPath,
            stdio: 'inherit',
        })

        core.info('Installing NPM packages...')
        execSync('npm install', {
            cwd: targetPath,
            stdio: 'ignore',
        })

        core.info('Zipping the package...')
        execSync(`zip -r ${zipFile} . -x .git*/*`, {
            cwd: targetPath,
            stdio: 'ignore',
        })

        await waitTillFilesExists(`${targetPath}/${zipFile}`)

        // push the built file to AWS lambda layer
        const lambda = new Lambda({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })

        const params = {
            LayerName,
            Content: {
                ZipFile: fs.readFileSync(`${targetPath}/${zipFile}`),
            },
            CompatibleRuntimes: ['nodejs18.x'],
            CompatibleArchitectures: ['x86_64'],
        }

        core.info('Publishing the layer...')
        const response = await lambda.publishLayerVersion(params).promise()
        core.info('Layer published successfully.')
        core.info(`Layer published successfully. Version: ${response.Version}`)
        const result = await lambda
            .updateFunctionConfiguration({
                FunctionName: 'testLambdaLayer',
                Layers: [
                    `arn:aws:lambda:us-east-2:620872262079:layer:${LayerName.trim()}:${
                        response.Version
                    }`,
                ],
            })
            .promise()

        core.info(`Function updated successfully. Version: ${result.Version}`)
    } catch (error) {
        core.setFailed(error as any)
    }
}

run()
