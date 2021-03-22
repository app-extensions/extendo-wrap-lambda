const fs = require('fs').promises
const childProcess = require('child_process')

const dataDir = '/extendo-compute'
const inputFile = `${dataDir}/input.json`
const outputFile = `${dataDir}/output.json`
const errorFile = `${dataDir}/error.json`

module.exports.handler = async (event) => {
  try {
    // Grab the input and structure it as an input file
    const { params, contextParts } = JSON.parse(event.body)
    await fs.writeFile(inputFile, JSON.stringify(params, null, 2))

    // run the command line spec'd in the environment (left there when we built the image) and include any context
    console.log(process.env.CMD_LINE)
    const child = childProcess.exec(process.env.CMD_LINE, { env: { GITHUB_TOKEN: contextParts.token } })
    await new Promise((resolve, reject) => {
      child.on('error', error => reject(error))
      child.on('exit', code => {
        if (code !== 0) return reject(new Error('Exec exited with non-zero code: ' + code))
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
    console.log(`Exec error: ${error.message}`)
    const output = await readFile(outputFile)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(output || { errorType: 'Error', errorMessage: error.message })
    }
  }
}

function readFile(file) {
  try {
    return fs.readFile(file)
  } catch (error) { return null }
}