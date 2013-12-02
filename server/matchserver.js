var sockio = require('socket.io');
var PeerServer = require('peer').PeerServer;

module.exports = {
	queue: [],
	listen: function(port,peerPort) {
		this.io = sockio.listen(port);
		this.server = new PeerServer({ port: peerPort });
		var _this = this;
		this.io.sockets.on('connection', function (socket) {
			if(_this.isAvailable())
				socket.emit('discover',_this.getUser());
			else {
				socket.emit('wait');
				socket.on('join', function (data) {
					_this.addUser(data);
				});
			}
		});
	},
	addUser: function(user) {
		this.queue.push(user);		//Default: Queue on memory
	},
	getUser: function() {
		return this.queue.shift();	//Default: Queue on memory
	},
	isAvailable: function() {
		return !!this.queue.length;
	}
};