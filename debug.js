// drop this in /tmp/test in a built/wrapped mermaid render image and then run with `node debug.js`
const entry = require('./entryPoint/index').handler
const data = {
  params: {
    "content": "https://raw.githubusercontent.com/app-extensions/test/main/Lorenz.ipynb",
    "inputs": {
      "contentType": "application/ipynb"
    },
    "options": {
      "dummy": "test option"
    }
  },
  contextParts: {
    token: "ljdsflksjlkfds"
  }

}
const run = async () => {
  const result = await entry(data)
  console.log(`result: ${result}`)
}
run()
