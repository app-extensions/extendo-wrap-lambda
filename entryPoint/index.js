const fs = require('fs').promises
const childProcess = require('child_process')

const dataDir = '/tmp/extendo-compute'
const inputFile = `${dataDir}/input.json`
const outputFile = `${dataDir}/output.json`
const errorFile = `${dataDir}/error.json`

module.exports.handler = async (event) => {
  try {
    console.log(`Command line: ${process.env.CMD_LINE}`)
    console.log(JSON.stringify(event, null, 2))
    // Grab the input and structure it as an input file
    // NOTE: here `event` is the actual payload where as in the other handlers it is the netwoek event object
    // (with all the headers etc) that has a `body` prop.
    const { params, contextParts } = event
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(inputFile, JSON.stringify(params, null, 2))

    // run the command line spec'd in the environment (left there when we built the image) and include any context
    const child = childProcess.exec(process.env.CMD_LINE, { env: { GITHUB_TOKEN: contextParts.token } })
    await new Promise((resolve, reject) => {
      child.stdout.on('data', data => console.log(`child-out: ${data}`))
      child.stderr.on('data', data => console.log(`child-err: ${data}`))
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
    if (error instanceof Error) throw error
    const output = await readFile(errorFile)
    const parsed = JSON.parse(output.toString())
    throw parsed || error
  }
}

async function readFile(file) {
  try {
    // await in the try so we catch any error 
    return await fs.readFile(file)
  } catch (error) { return null }
}
