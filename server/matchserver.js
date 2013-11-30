var sockio = require('socket.io');
var PeerServer = require('peer').PeerServer;

module.exports = {
	queue: [],
	listen: function(port,peerPort) {
		this.io = sockio.listen(port);
		this.server = new PeerServer({ port: peerPort });
		this.io.sockets.on('connection', function (socket) {
			if(queue.length)
				socket.emit('discover',this.getUser());
			else {
				socket.emit('wait');
				socket.on('join', function (data) {
					this.addUser(data);
				});
			}
		});
	},
	addUser: function(user) {
		this.queue.push(data);		//Default: Queue on memory
	},
	getUser: function() {
		return this.queue.shift();	//Default: Queue on memory
	}
};