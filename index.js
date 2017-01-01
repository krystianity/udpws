const Server = require("./lib/Server.js");
const Client = require("./lib/Client.js");
Client.Server = Server; //ws style
module.exports = Client;