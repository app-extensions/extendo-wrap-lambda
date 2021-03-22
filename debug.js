// drop this in /tmp/test in a built/wrapped mermaid render image and then run with `node debug.js`
const entry = require('../../entryPoint/index').handler
const data = {
  params: {
    "content": "gantt\ndateFormat  YYYY-MM-DD\ntitle Adding GANTT diagram to mermaid\nexcludes weekdays 2014-01-10\n\nsection A section\nCompleted task            :done,    des1, 2014-01-06,2014-01-08\nActive task               :active,  des2, 2014-01-09, 3d\nFuture task               :         des3, after des2, 5d\nFuture task2               :         des4, after des3, 5d\n",
    "options": {
      "contentType": "github/mermaid"
    },
    "inputs": {
      "dummy": "test arg"
    }
  },
  contextParts: {}

}
entry(data)