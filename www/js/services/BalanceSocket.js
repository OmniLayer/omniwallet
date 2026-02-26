angular.module("omniServices")
	.service("BalanceSocket", ["$rootScope","$location",function BalanceSocketService($rootScope,$location){
		var self = this;
		self.connected =false;
		self.connect = function(){
			self.socket = io.connect($location.protocol()+'://' + $location.host() + ':' + $location.port() + "/balance", {'forceNew':true});
			self.connected=true;
		}

		self.disconnect = function(){
			self.socket.disconnect();
			self.socket=null;
			self.connected =false;
		}

		self.on = function(eventName,callback){
			self.socket.on(eventName,callback);
			// function(msg){
			// 	$rootScope.$apply(function(){callback(msg)});
			// })
		}

		self.emit = function(eventName,data){
			self.socket.emit(eventName,data);
		}
	}])
