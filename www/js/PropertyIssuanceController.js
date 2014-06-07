function PropertyIssuanceController($scope, $http,$modal, userService, walletTransactionService){

  $scope.propertyTypes = [
    { value: 1, description: "New Indivisible tokens"},
    { value: 2, description: "New Divisible currency"},
    { value: 65,  description: "Indivisible tokens replacing a previous property"},
    { value: 66,  description: "Divisible currency replacing a previous property"},
    { value: 129,  description: "Indivisible tokens appending a previous property"},
    { value: 130, description:  "Divisible currency appending a previous property"}
  ];
  $scope.isNewProperty = true;
  
  $scope.checkPropertyType = function(){
    if ($scope.propertyType != 1 && $scope.propertyType != 2)
      $scope.isNewProperty = false;
    else
      $scope.isNewProperty = true;
  };
  
  function getUnsignedPropertyIssuanceTransaction(propertyType, previousPropertyId, propertyCategory, propertySubcategory, propertyName, propertyUrl, propertyData, numberProperties, from) {
    var data = {
      transaction_version:0,
      ecosystem:2,
      property_type : propertyType, 
      previous_property_id:previousPropertyId || 0, 
      property_category:propertyCategory, 
      property_subcategory:propertySubcategory, 
      property_name:propertyName, 
      property_url:propertyUrl, 
      property_data:propertyData, 
      number_properties:numberProperties,
      transaction_from: from
    };
    var promise = walletTransactionService.getUnsignedTransaction(50,data);

    return promise;
  }
  
  function preparePropertyIssuanceTransaction(propertyType, previousPropertyId, propertyCategory, propertySubcategory, propertyName, propertyUrl, propertyData, numberProperties, from, $modalScope) {
    var addressData = userService.getAddress(from);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.propertyIssuanceTxPromise = getUnsignedPropertyIssuanceTransaction(propertyType, previousPropertyId, propertyCategory, propertySubcategory, propertyName, propertyUrl, propertyData, numberProperties, from);
    $scope.propertyIssuanceTxPromise.then(function(successData) {
      successData = successData.data;
      if (successData.status != 200) {
        $modalScope.waiting = false;
        $modalScope.issueError = true;
        $modalScope.error = 'Error preparing Property Issuance transaction: ' + successData.data;
      } else {
        var unsignedTransaction = successData.unsignedhex;

        try {
          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          /*var script = parseScript(successData.sourceScript);

          transaction.ins.forEach(function(input) {
            input.script = script;
          });*/

          //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()));
          var signedSuccess = transaction.signWithKey(privKey);

          var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());

          //Showing the user the transaction hash doesn't work right now
          //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());

          walletTransactionService.pushSignedTransaction(finalTransaction).then(function(successData) {
            var successData = successData.data;
            if (successData.pushed.match(/submitted|success/gi) != null) {
              $modalScope.waiting = false;
              $modalScope.issueSuccess = true;
              $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
            } else {
              $modalScope.waiting = false;
              $modalScope.issueError = true;
              $modalScope.error = successData.pushed; //Unspecified error, show user
            }
          }, function(errorData) {
            $modalScope.waiting = false;
            $modalScope.issueError = true;
            if (errorData.message)
              $modalScope.error = 'Server error: ' + errorData.message;
            else 
              if (errorData.data)
                $modalScope.error = 'Server error: ' + errorData.data;
              else
                $modalScope.error = 'Unknown Server Error';
            console.error(errorData);
          });

          //DEBUG console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );
          function parseScript(script) {
            var newScript = new Bitcoin.Script();
            var s = script.split(" ");
            for (var i = 0; i < s.length; i++) {
              if (Bitcoin.Opcode.map.hasOwnProperty(s[i])) {
                newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
              } else {
                newScript.writeBytes(Bitcoin.Util.hexToBytes(s[i]));
              }
            }
            return newScript;
          }
        } catch (e) {
          $modalScope.sendError = true;
          if (e.message)
            $modalScope.error = 'Error sending transaction: ' + e.message;
          else 
            if (e.data) 
              $modalScope.error = 'Error sending transaction: ' + e.data;
            else
              $modalScope.error = 'Unknown error sending transaction';
          console.error(e);
        }
      }
    }, function(errorData) {
      $modalScope.sendError = true;
      if (errorData.message)
        $modalScope.error = 'Server error: ' + errorData.message;
      else 
        if (errorData.data)
          $modalScope.error = 'Server error: ' + errorData.data;
        else
          $modalScope.error = 'Unknown Server Error';
      console.error(errorData);
    });
  }
  
  $scope.validatePropertyIssuanceForm = function() {
    var dustValue = 5430;
    var minerMinimum = 10000;
    var nonZeroValue = 1;

    var convertToSatoshi = [
      $scope.minerFees,
      $scope.balanceData[1]
    ];
    
    var convertedValues =$scope.convertDisplayedValue(convertToSatoshi);
    var minerFees = +convertedValues[0];
    var btcbalance = convertedValues[1];
    var numberProperties=$scope.numberProperties,
    propertyType = $scope.propertyType,
    previousPropertyId=$scope.previousPropertyId,
    propertyName=$scope.propertyName,
    propertyCategory=$scope.propertyCategory,
    propertySubcategory=$scope.propertySubcategory,
    propertyUrl=$scope.propertyUrl;
    
    var error = 'Please ';
    if ($scope.issuanceForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if (minerFees < minerMinimum)
      error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
    if ((minerFees <= btcbalance) == false)
        error += 'make sure you have enough Bitcoin to cover your fees, ';
    if (!propertyName || propertyName == '\0')
      error += 'make sure you enter a Property Name, ';
      
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/wallet_assets_issue_modal.html',
        controller: function($scope, $rootScope, userService, data, preparePropertyIssuanceTransaction, getUnsignedPropertyIssuanceTransaction, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.issueSuccess = false, $scope.issueError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=  convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=  getDisplayedAbbreviation,
          $scope.numberProperties=  data.numberProperties,
          $scope.propertyTypeName=  data.propertyTypeName,
          $scope.propertyName= data.propertyName,
          $scope.propertyCategory= data.propertyCategory,
          $scope.propertySubcategory= data.propertySubcategory,
          $scope.propertyUrl= data.propertyUrl;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            preparePropertyIssuanceTransaction(data.propertyType, data.previousPropertyId, data.propertyCategory, data.propertySubcategory, data.propertyName, data.propertyUrl, data.propertyData, data.numberProperties, data.from, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              from:$scope.selectedAddress,
              numberProperties:numberProperties,
              propertyType:propertyType,
              propertyTypeName:propertyType == 1 || propertyType == 65 || propertyType == 129? 'Indivisible' : 'Divisible', // Only values 1 or 2 are supported right now, but leave room for expansion.
              previousPropertyId:previousPropertyId,
              propertyName:propertyName,
              propertyCategory:propertyCategory,
              propertySubcategory:propertySubcategory,
              propertyUrl:propertyUrl,
              propertyData:'\0' // this is fixed to 1 byte by the spec
            };
          },
          preparePropertyIssuanceTransaction: function() {
            return preparePropertyIssuanceTransaction;
          },
          getUnsignedPropertyIssuanceTransaction: function() {
            return getUnsignedPropertyIssuanceTransaction;
          },
          pushSignedTransaction: function() {
            return walletTransactionService.pushSignedTransaction;
          },
          convertSatoshiToDisplayedValue: function() {
            return $scope.convertSatoshiToDisplayedValue;
          },
          getDisplayedAbbreviation: function() {
            return $scope.getDisplayedAbbreviation;
          }
        }
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.$parent.showErrors = true;
    }
  };
}
