const EventEmitter = require("events")
const dgram = require("dgram");

class Client extends EventEmitter {

    constructor(options){
        super();

        if(!options){
            throw new Error("provide a connection string or connection options.");
        }

        if(typeof options === "string"){
            options = options.split(":");
            this.host = options[0];
            this.port = parseInt(options[1]);
            this.family = "udp4";
        } else if(typeof options === "object"){
            this.host = options.host;
            this.port = parseInt(options.port);
            this.family = options.family || "udp4";
        } else {
            throw new Error("options must be a string or an object.");
        }

        if(!this.host || !this.port){
            throw new Error("host or port are missing.");
        }

        this._socket = dgram.createSocket(this.family);
        this._attachDefaultListeners(this._socket);
        this._socket.bind(); //let os decide where to bind
    }

    send(message, callback){
        if(this._socket) {
            this._socket.send(message, this.port, this.address, callback);
        } else if(callback){
            callback(new Error("socket is closed or dead."));
        }
    }

    close(callback){
        this._socket.close(callback);
    }

    _attachDefaultListeners(socket){

        socket.on("close", () => {
            this._socket = null;
            this.emit("close");
        });

        socket.on("error", err => {
            this.emit("error", err);
            this.emit("close");
            socket.close();
        });

        socket.on("message", (message, rinfo) => {
            this._handleMessage(rinfo.address, rinfo.port, message);
        });

        socket.on("listening", () => {
            const address = socket.address();
            this.emit("open", address.address, address.port);
        });
    }

    _handleMessage(address, port, message){

        if(port !== this.port){
            return;
        }

        this.emit("message", message);
    }
}

module.exports = Client;
