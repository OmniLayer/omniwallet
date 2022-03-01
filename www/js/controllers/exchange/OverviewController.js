angular.module("omniControllers")
      .controller("ExchangeOverviewController",["$scope", "$http", "$q", "hashExplorer",
            function ExchangeOverviewController($scope, $http, $q, hashExplorer) {

                  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
                  $scope.currencyUnit = 'stom'
                  $scope.timeNow = Date.now();
                  $scope.timeAll = $scope.timeNow - 1394834400000;
                  $scope.timeOptions = [
                      {name:'24 Hours', value:'86400'},
                      {name:'1 Week', value:'604800'},
                      {name:'1 Month', value:'2419200'},
                      {name:'3 Month', value:'7257600'},
                      {name:'All', value:$scope.timeAll}
                  ];
                  $scope.selectedTimeframe = $scope.timeOptions[4].value;
                  $scope.noOrders=false;
                  $scope.loading = true;


                  $scope.setEcosystem = function(ecosystem){
                       $scope.ecosystem = ecosystem;
                       $scope.loadMarkets();
                  };

                  $scope.markets = [{propertyid:1, propertyname:"Omni", propertytype:2, displayname:"Omni Token #1"}];
                  $scope.ecosystem = 1;
                  $scope.filterMarkets = true;
                  $scope.activeCurrency = {};

                  if ($scope.account.loggedIn) {
                        $scope.hasCoins = $scope.wallet.getAsset(1) != undefined;
                        $scope.hasBitcoins = $scope.wallet.getAsset(0).tradable;
                        //$scope.selectedAsset = $scope.wallet.getAsset(1);
                  } else {
                        $scope.hasCoins = false;
                        $scope.hasBitcoins = false;
                  }


                  $scope.loadMarkets = function(){
                      var postData = {
                        ecosystem: $scope.ecosystem,
                        filter: $scope.filterMarkets,
                        version: 1
                      };
                      //console.log('loading markets',postData);
                      $http.post('/v1/omnidex/designatingcurrencies',postData).then(
                          function success(response) {
                              $scope.markets = response.data.currencies;
                              //console.log('markets',$scope.markets);
                              filteredMarkets=response.data.filter;
                              $scope.selectedCurrency = $scope.markets[0];
                              $scope.setActiveCurrency();
                          },
                          function(error){
                              console.log(error)
                          }
                      );
                  }

                  $scope.getData = function(time, currency) {
                      //console.log('running getData',time,currency);
                      $scope.noOrders=false;
                      $scope.loading = true;
                      $scope.orderbook = [];
                      var transaction_data = [];
                      var coin = currency.propertyid || $scope.activeCurrency.propertyid;
                      var postData = {
                        type: 'TIME',
                        currencyType: coin,
                        time: time || $scope.selectedTimeframe
                      };
                      $http.post('/v1/exchange/offers', postData).success(function(offerSuccess) {
                        if (offerSuccess.data.length > 0) {
                          transaction_data = offerSuccess.data
                          //DEBUG console.log(transaction_data)
                          //turn everything to number value
                          transaction_data.forEach(function(tx) {
                            transaction_data_keys = Object.keys(tx);
                            transaction_data_keys.forEach(function(key) {
                              if ((typeof tx[key] === 'string') && (tx[key].search(/[a-zA-Z]/g) === -1)) {
                                tx[key] = +tx[key]
                              }
                            });
                          });

                          if ($scope.account.loggedIn) {
                            transaction_data.forEach(function(tx) {
                              tx['mine'] = false;
                              if ($scope.wallet.getAddress(tx.from_address)) {
                                tx['mine'] = true;
                              }
                            });
                          }

                          transaction_data = transaction_data.filter(function(item) {
                            var orderType = item.tx_type_str.toLowerCase()
                            var orderStatus = item.color.match(/invalid|expired|bgc-done/gi) || []
                            //DEBUG console.log(orderStatus, item.color)
                            return (orderType == 'sell offer') && (orderStatus.length == 0)
                          });

                          angular.forEach(transaction_data, function(transaction, index) {
                            //DEBUG console.log(new Date(Number(transaction.tx_time)))
                            transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 18) + '...'
                            transaction_data[index].from_address_concat = transaction.from_address.substring(0, 7) + '...' + transaction.from_address.substring(transaction.from_address.length-7);
                            transaction_data[index].to_address_concat = transaction.to_address.substring(0, 7) + '...' + transaction.to_address.substring(transaction.to_address.length-7);
                          });

                          transaction_data=transaction_data.filter(function(elem) {
                            return (elem.action != 3);
                          });

                          transaction_data.sort(function(a, b) {
                            return a.formatted_price_per_coin - b.formatted_price_per_coin
                          }); // sort cheapest; sort most recent (b.tx_time - a.tx_time)

                          transaction_data.length == 0 ? transaction_data.push({ tx_hash_concat: 'No offers/bids found for this timeframe', tx_hash: 'No offers/bids found for this timeframe'  }) : transaction_data;

                        } else
                          $scope.noOrders = true;
                          $scope.orderbook = transaction_data;
                          $scope.loading = false;
                          console.log($scope.orderbook);
                        }
                      );
                  } //getData

                  $scope.setActiveCurrency = function() {

                    if (!$scope.selectedCurrency) {
                      $scope.activeCurrency = $scope.markets[0]
                    } else {
                      $scope.activeCurrency = $scope.selectedCurrency;
                      if ($scope.account.loggedIn) {
                        $scope.hasCoins = $scope.wallet.getAsset($scope.activeCurrency.propertyid) != undefined;
                        $scope.selectedAsset = $scope.wallet.getAsset($scope.activeCurrency.propertyid);
                      } else {
                        $scope.hasCoins = false;
                      }
                    }

                    var random = Math.random();
                    $scope.saleView = '/views/exchange/partials/sale.html?r='+random;
                    $scope.showNoCoinAlert = false;

                    // trigger getData
                    $scope.getData($scope.selectedTimeframe,$scope.activeCurrency);
                  }
}])
