const EventEmitter = require("events");

class ServerConnection extends EventEmitter {

    constructor(address, port, ref){
        super();
        this.address = address;
        this.port = port;
        this._ref = ref;
        this.createdAt = Date.now();
        this.lastMessageReceived = null;
        this.lastMessageSent = null;
        this.isClosed = false;
    }

    send(message, callback){
        if(this._ref && this._ref._socket) {
            this.lastMessageSent = Date.now();
            this._ref._socket.send(message, this.port, this.address, callback);
        } else if(callback){
            callback(new Error("reference or socket is dead."));
        }
    }

    close(callback){

        if(this.isClosed){
            if(callback){
                return callback(new Error("is already closed."));
            } else {
                throw new Error("is already closed.");
            }
        }

        this.isClosed = true;
        this._ref._deleteSocket(this.address, this.port);
        this._ref = null;

        if(callback){
            callback(); //ws style
        } else {
            this.emit("close");
        }
    }

    _zombie(){

        if(!this.isClosed){
            this.emit("close");
        }

        this.isClosed = true;
        this._ref._deleteSocket(this.address, this.port);
        this._ref = null;
    }

    _handleMessage(message){
        this.lastMessageReceived = Date.now();
        this.emit("message", message);
    }
}

module.exports = ServerConnection;