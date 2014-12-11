angular.module("omniServices")
	.service("BalanceSocket", ["$rootScope","$location",function BalanceSocketService($rootScope,$location){
		var self = this;

		self.socket = io.connect($location.protocol()+'://' + $location.host() + ':' + $location.port() + "/balance");

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