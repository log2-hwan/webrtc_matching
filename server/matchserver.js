var io = require('socket.io');

module.exports = {
	queue: [],
	listen: function(port) {
		io.listen(port);
		io.sockets.on('connection', function (socket) {
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