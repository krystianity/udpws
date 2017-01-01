# udpws
- nodejs udp server/client ws (websocket) style
- minimalistic and still low-level (no protocol implementation)
- ECMA 6; node version > 4.0.0
- install via `npm install --save udpws`
- run tests via `npm test`
- check ./coverage/lcov-report/index.html for test coverage
- usage is similar to ws or uws, check ./test/int/Socket.test.js if
more explanation is necessary

```javascript
// server
    const udpws = require("udpws");
    const server = new udpws.Server({
        host: "localhost",
        port: 21455,
        family: "udp4"
    });
    
    server.on("error", error => {
        console.log("server error " + error.message);
    });

    server.on("close", () => {
        console.log("server closing.");
    });

    server.on("connection", connection => {

        console.log(`new connection from ${connection.address}:${connection.port}.`);

        connection.on("message", message => {
            console.log("new message from connection: " + message + " as count " + count);
            connection.send("echo: " + message, err => {
                connection.close();
            });
        });

        connection.on("close", () => {
            console.log("connection closed.");
        });
    });

    server.on("listening", (address, port) => {
        console.log(`server listening ${address}:${port}.`);
    });
```

```javascript
// client
    const udpws = require("udpws");
    const client = new udpws({
         host: "localhost",
         port: 21455,
         family: "udp4"
     });
    
    client.on("error", error => {
        console.log("client error " + error.message);
    });

    client.on("close", () => {
        console.log("client closing.");
    });

    client.on("message", message => {
        console.log("client message: " + message);
    });

    client.on("open", (address, port) => {
        console.log(`client ready and listening ${address}:${port}.`);
    });
```