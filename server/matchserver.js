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
					socket.data = data;
					_this.addUser(data);
				});
			}
			socket.on('disconnect', function () {
				_this.removeUser(socket.data.id);
			});
		});
	},
	addUser: function(user) {
		this.queue.push(user);		//Default: Queue on memory
	},
	getUser: function() {
		var user = this.queue.shift();
		return user;				//Default: Queue on memory
	},
	removeUser: function(id) {
		this.queue.splice(id);
	},
	isAvailable: function() {
		return !!this.queue.length;
	}
};