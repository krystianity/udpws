const EventEmitter = require("events");
const dgram = require("dgram");

const ServerConnection = require("./ServerConnection.js");

class Server extends EventEmitter {

    constructor({address, port, family, zombieTimeout, zombieInterval}){
        super();
        this._socket = dgram.createSocket(family || "udp4");
        this._connections = {};
        this._attachDefaultListeners(this._socket);
        this._socket.bind(port, address);
        this._zt = null;
        this._runZombieInterval(zombieTimeout || 30000, zombieInterval || 5000);
    }

    close(callback){
        clearInterval(this._zt);
        this._socket.close(callback);
    }

    _runZombieInterval(zombieTimeout, zombieInterval){

        if(zombieTimeout === -1 || zombieInterval === -1){
            return;
        }

        this._zt = setInterval(() => {
            const now = Date.now();
            const cks = Object.keys(this._connections);
            for(let i = 0; i < cks.length; i++){
                if(now > cks[i].lastMessageReceived + zombieTimeout &&
                    now > cks[i].lastMessageSent + zombieTimeout){
                    cks[i]._zombie();
                }
            }
        }, zombieInterval);
    }

    _attachDefaultListeners(socket){

        socket.on("close", () => {
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
            this.emit("listening", address.address, address.port);
        });
    }

    _socketExists(address, port){
        return this._connections[address + ":" + port];
    }

    _createSocket(address, port){
        const connection = new ServerConnection(address, port, this);
        this._connections[address + ":" + port] = connection;
        return connection;
    }

    _deleteSocket(address, port){
        delete this._connections[address + ":" + port];
    }

    _handleMessage(address, port, message){

        if(!address || !port){
            return;
        }

        let socket = this._socketExists(address, port);

        if(!socket){
            socket = this._createSocket(address, port);
            this.emit("connection", socket);
        }

        socket._handleMessage(message);
    }
}

module.exports = Server;