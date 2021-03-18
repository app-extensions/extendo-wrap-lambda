This is the entry point that is run by Lambda when the user image is dispatched (i.e., when their config is executed)

The code here is responsible for:
1. mapping the Lambda event date to the extendo-github protocol (e.g., to /tmp/input.json)
2. invoking the user's image with a user-defined command line
3. collecting up and returning the result (from /tmp/output.json)
