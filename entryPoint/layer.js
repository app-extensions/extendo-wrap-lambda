const fs = require('fs').promises
const childProcess = require('child_process')

const inputFile = '/tmp/input.json'
const outputFile = '/tmp/output.json'

module.exports.handler = async (event) => {
  try {
    // Grab the input and structure it as an input file
    const { params, contextParts } = JSON.parse(event.body)
    await fs.writeFile(inputFile, JSON.stringify(params, null, 2))

    // run the command line spec'd in the environment (left there when we built the image) and include any context
    const child = childProcess.exec(process.env.CMD_LINE, { env: { GITHUB_TOKEN: contextParts.token } })
    await new Promise((resolve, reject) => {
      child.on('error', err => reject(err))
      child.on('exit', async code => {
        if (code !== 0) reject(new Error('exit code ' + code))
        resolve()
      })
    })

    // Grab the output and structure it as the response
    const output = await fs.readFile(outputFile)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(output)
    }
  } catch (error) {
    const output = await fs.readFile(outputFile)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      isBase64Encoded: false,
      body: output.error
    }
  }
}
