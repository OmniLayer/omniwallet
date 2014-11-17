angular.module("omniServices")
	.service("BalanceSocket", ["$rootScope",function BalanceSocketService($rootScope){
		var self = this;

		self.socket = io.connect('http://' + document.domain + ':' + location.port + "/balance");

		self.on = function(eventName,callback){
			self.socket.on(eventName,function(msg){
				$rootScope.$apply(function(){callback(msg)});
			})
		}

		self.emit = function(eventName,data){
			self.socket.emit(eventName,data);
		}
	}])