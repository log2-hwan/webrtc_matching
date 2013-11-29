var MatchingSystem = function(nick,config) {
	var socket = io.connect(config.matchServer);
	this.nick = nick;
	this.events = {};
	var _this = this;
	socket.on('wait',function() {					
		var conn;
		var peer = new Peer(config.peerJS);
		var peerid;
		peer.on('open', function(id){
			socket.emit('join',{nick:nick,id:id});
			_this._emit('wait');
		});
		peer.on('connection', function(conn) {
			_this.conn = conn;
		
			conn.on('data',function(data) {
				switch(data.type) {
				case 'hello':
					_this._emit('connected',data.data);
					break;
				case 'data':
					_this._emit('data',data.data);
				}
			});
		});
	});
	socket.on('discover',function(user) {
		var peer = new Peer(config.peerJS);
		_this._emit('discover',{nick:user.nick});
		
		var conn = peer.connect(user.id);
		conn.on('open',function() {
			_this.conn = conn;
			conn.send({type:'hello',data:{nick:nick}});
			_this._emit('connected',{nick:user.nick});
			conn.on('data',function(data) {
				switch(data.type) {
				case 'data':
					_this._emit('data',data.data);
				}
			});
		});
	});
};

MatchingSystem.prototype._emit = function(type,data) {
	if(!this.events[type]) return;
	
	var _this = this;
	this.events[type].forEach(function(listener) {
		listener.call(_this,data);
	});
};

MatchingSystem.prototype.on = function(type,cb) {
	if(!this.events[type]) this.events[type] = [];
	
	this.events[type].push(cb);
};

MatchingSystem.prototype.off = function(type,cb) {
	this.events[type].splice(cb);
};

MathcingSystem.prototype.send = function(data) {
	if(!this.conn) return;
	
	this.conn.send({type:'data',data:data});
};