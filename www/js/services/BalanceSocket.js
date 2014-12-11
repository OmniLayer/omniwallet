angular.module("omniServices")
	.service("BalanceSocket", ["$rootScope","$location",function BalanceSocketService($rootScope,$location){
		var self = this;

		self.connect = function(){
			self.socket = io.connect($location.protocol()+'://' + $location.host() + ':' + $location.port() + "/balance");
		}

		self.disconnect = function(){
			self.socket.disconnect();
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