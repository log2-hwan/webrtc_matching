var MatchingSystem = function(nick,config) {
	this.socket = io.connect('http://'+config.url+':'+config.port.matching);
	this.nick = nick;
	this.events = {};
	this.syncData = {};
	this.prevSyncTime = 0;
	var _this = this;
	
	this._init(config);
};

MatchingSystem.prototype._init = function(config) {
	var _this = this;
	this.socket.on('wait',function() {
		_this._initPeer(config);
		
		_this.peer.on('open', function(id){
			_this.socket.emit('join',{nick:_this.nick,id:id});
			_this._emit('wait');
		});
		_this.peer.on('connection', function(conn) {
			_this._initConnection(conn);
		});
	});
	this.socket.on('discover',function(user) {
		_this._emit('discover',{nick:user.nick});
		_this._initPeer(config);
		
		var conn = _this.peer.connect(user.id);
		conn.on('open',function() {
			_this.isHost = false;
			conn.send({type:'hello',data:{nick:_this.nick}});
			_this._emit('connected',{nick:user.nick});
			_this._initConnection(conn);
		});
	});
	if(Object.observe) {
		Object.observe(this.syncData,function(e) {
			_this.conn.send({type:'sync',data:e,time:Date.now()});
		});
	}
};

MatchingSystem.prototype._initPeer = function(config) {
	var _this = this;	
	this.peer = new Peer({host:config.url,port:config.port.peer});
	this.peer.on('error',function(e) {
		_this._emit('error',e);
	});
};

MatchingSystem.prototype._initConnection = function(conn) {
	var _this = this;
	this.conn = conn;
	this.conn.on('data',function(data) {
		switch(data.type) {
		case 'hello':
			_this.isHost = true;
			_this._emit('connected',data.data);
			break;
		case 'data':
			_this._emit('data',data.data);
			break;
		case 'sync':
			if(data.time<=_this.prevSyncTime) return;
			_this.prevSyncTime = data.time;
			data.data.forEach(function(val) {
				_this.syncData[val.name] = val.object[val.name];
			});
			break;
		}
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

MatchingSystem.prototype.send = function(data) {
	if(!this.conn) return;
	
	this.conn.send({type:'data',data:data});
};