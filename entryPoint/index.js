console.log(`line 1`)
const fs = require('fs').promises
const childProcess = require('child_process')

const dataDir = '/tmp/extendo-compute'
const inputFile = `${dataDir}/input.json`
const outputFile = `${dataDir}/output.json`
const errorFile = `${dataDir}/error.json`
console.log('loading handler')

module.exports.handler = async (event) => {
  console.log('in handler')
  try {
    // Since Lambda can reuse containers, clean up our key files from what might have been a previous run.
    await fs.rm(outputFile, { force: true })
    await fs.rm(errorFile, { force: true })
    console.log('removed files')

    // Grab the event parts and stash for use by the target handler.
    // Note the difference here between this and Node deployed in a zip. 
    // See https://github.com/aws/aws-lambda-nodejs-runtime-interface-client/issues/17
    const { params, contextParts } = event
    await fs.mkdir(dataDir, { recursive: true })
    console.log('between mkdir and write input file')
    await fs.writeFile(inputFile, JSON.stringify(params, null, 2))

    console.log('about to exec')
    console.log (`cmd: ${process.env.CMD_LINE}`)
    console.log(`tok: ${contextParts.token.slice(-8)}`)
    // run the command line spec'd in the environment (left there when we built the image) and include any context
    const child = childProcess.exec(process.env.CMD_LINE, { env: { GITHUB_TOKEN: contextParts.token } })
    await new Promise((resolve, reject) => {
      child.stdout.on('data', data => console.log(`child-out: ${data}`))
      child.stderr.on('data', data => console.log(`child-err: ${data}`))
      child.on('error', error => reject(error))
      child.on('exit', code => {
        console.log(`exit exec with code: ${code}`)
        // purposefully reject with a non-Error here so the catch knows to look for an error file
        if (code !== 0) return reject('Exec exited with non-zero code: ' + code)
        resolve()
      })
    })
    console.log(`done exec`)

    // Grab the output and return it as an object. 
    // Note the difference here between this and Node deployed in a zip. 
    // See https://github.com/aws/aws-lambda-nodejs-runtime-interface-client/issues/17
    const output = await fs.readFile(outputFile)
    console.log(`read outputFile and returning : ${output.slice(0,1000)}`)
    return JSON.parse(output)
  } catch (error) {
    // rethrow if it's already an error. Likely means that it happened in this wrapper
    if (error instanceof Error) throw error
    try {
      // See if the nested handler left us an error file. If so, re throw whatever they left 
      const output = await fs.readFile(errorFile)
      console.log(`Got error file : ${output}`)
      throw JSON.parse(output)
    } catch (err) {
      // all else fails, rethrow the original object (known not to be an Error)
      console.log(`Last chance error : ${error.toString()}`)
      throw error
    }
  }
}
