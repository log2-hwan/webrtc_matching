var io = require('socket.io');

module.export = {
	listen: function(prot) {
		io.listen(port);
		var queue = [];
		io.sockets.on('connection', function (socket) {
			if(queue.length)
				socket.emit('discover',queue.shift());
			else {
				socket.emit('wait');
				socket.on('join', function (data) {
					queue.push(data);
				});
			}
		});
	}
};