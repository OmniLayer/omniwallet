angular.module("omniControllers")
	.controller("DExSaleController", ["$scope", "Orderbook", "PropertyManager",
		function DExSaleController($scope, Orderbook, PropertyManager ){
			$scope.selectedAddress = $scope.wallet.tradableAddresses()[0]
			$scope.selectedAsset = $scope.wallet.getAsset($scope.selectedAddress.balance[0].id);
			$scope.ecosystem = 1;
			$scope.setAddress = function(address){
				$scope.selectedAddress = address;
				$scope.selectedAsset = $scope.wallet.getAsset($scope.selectedAddress.balance[0].id);
			}
			
			$scope.setAsset = function(asset){
				$scope.sellingAsset = asset;
				let nextEco = (asset.id < 2147483648 && asset.id != 2) ? 1 : 2;
				if($scope.ecosystem != nextEco){
					$scope.ecosystem = nextEco;
					$scope.loadCurrencies();	
				}
			}
			$scope.setDesiredAsset = function(asset){
				$scope.desiredAsset = asset;
			}

			$scope.loadCurrencies = function(){
				PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
			      $scope.availableTokens = result.data.properties.sort(function(a, b) {
			          var currencyA = a.name.toUpperCase();
			          var currencyB = b.name.toUpperCase();
			          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
			      });
			      $scope.desiredAsset = $scope.availableTokens[0];
			  	});
			}

			$scope.validateDexSaleForm = function(){

				var orderbook = new Orderbook({desired:$scope.propertyDesired, selling:$scope.propertySelling});

			};
		}])