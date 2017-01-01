const expect = require("expect.js");

const udpws = require("./../../index.js");

describe("Socket Integration", function(){

    const config = {
        host: "localhost",
        port: 21345,
        family: "udp4"
    };

    let server = null;
    let client = null;

    before(function(done){
        done();
    });

    after(function(done){
        setTimeout(() => {
            done();
        }, 1200);
    });

    it("should be able to start server", function(done) {

        server = new udpws.Server(config);

        server.on("error", error => {
            console.log("server error " + error.message);
        });

        server.on("close", () => {
            console.log("server closing.");
        });

        server.on("connection", connection => {

            console.log(`new connection from ${connection.address}:${connection.port}.`);

            let count = 0;
            connection.on("message", message => {
                count++;
                console.log("new message from connection: " + message + " as count " + count);
                connection.send("echo: " + message, err => {
                    expect(err).to.be.equal(null);

                    if(count >= 2){
                        connection.close();
                    }
                });
            });

            connection.on("close", () => {
                console.log("connection closed.");
            });
        });

        server.on("listening", (address, port) => {
            console.log(`server listening ${address}:${port}.`);
            done();
        });
    });

    it("should be able to start client", function(done) {

        client = new udpws(config);

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
            done();
        });
    });

    it("should be able to send a message from client to server", function(done){
        client.send("hans wurst", err => {
            expect(err).to.be.equal(null);
            done();
        });
    });

    it("should be able to send another message from client to server", function(done){
        setTimeout(() => {
            client.send("und noch einmal", err => {
                expect(err).to.be.equal(null);
                done();
            });
        }, 1000);
    });

    it("should be able to send a third message from client to server", function(done){
        setTimeout(() => {
            client.send("und noch ein drittes mal", err => {
                expect(err).to.be.equal(null);
                done();
            });
        }, 500);
    });
});