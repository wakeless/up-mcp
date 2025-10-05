This is an MCP Server which allows server access to the Up API (https://developer.up.com.au/#welcome)

It is built in NodeJS and utilises vitest for testing and the official MCP typescript sdk for mcp access: https://github.com/modelcontextprotocol/typescript-sdk

It requires an environment variable to be set UP_PERSONAL_ACCESS_TOKEN="..." for the access, this
is available through the Up app.

It is built in Typescript.

The Up OpenApi is available here. https://raw.githubusercontent.com/up-banking/api/refs/heads/master/v1/openapi.json

