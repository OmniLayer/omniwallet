function PropertyIssuanceController($scope, $http,$modal, userService, walletTransactionService){
  $scope.showErrors=false;
  
  function getUnsignedPropertyIssuanceTransaction(property_type, previous_property_id, property_category, property_subcategory, property_name, property_url, property_data, number_properties) {
    var data = {
      property_type : property_type, 
      previous_property_id:previous_property_id, 
      property_category:property_category, 
      property_subcategory:property_subcategory, 
      property_name:property_name, 
      property_url:property_url, 
      property_data:property_data, 
      number_properties:number_properties
    };
    var promise = walletTransactionService.getUnsignedTransaction(50,data);

    return promise;
  }
  
  function preparePropertyIssuanceTransaction(property_type, previous_property_id, property_category, property_subcategory, property_name, property_url, property_data, number_properties, from, $modalScope) {
    var addressData = userService.getAddress(from);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.propertyIssuanceTxPromise = getUnsignedPropertyIssuanceTransaction(property_type, previous_property_id, property_category, property_subcategory, property_name, property_url, property_data, number_properties, from, $modalScope);
    $scope.propertyIssuanceTxPromise.then(function(successData) {

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
    var property_type = $scope.property_type; 


    var minerFees = property_type == 1 ? $scope.minerFees : new Big($scope.minerFees).times(new Big(0.00000001)).toFixed(8);;
    var number_properties=$scope.number_properties,
    property_type=$scope.property_type,
    previous_property_id=$scope.previous_property_id,
    property_name=$scope.property_name,
    property_category=$scope.property_category,
    property_subcategory=$scope.property_subcategory,
    property_url=$scope.property_url;
    
    var error = 'Please ';
    if ($scope.sendForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/explorer_asset_issuance_modal.html',
        controller: function($scope, $rootScope, userService, data, prepareSendTransaction, getUnsignedSendTransaction,convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.issueSuccess = false, $scope.issueError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=  convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=  getDisplayedAbbreviation,
          $scope.number_properties=  data.number_properties,
          $scope.property_type_name=  data.property_type_name,
          $scope.property_name= data.property_name,
          $scope.property_category= data.property_category,
          $scope.property_subcategory= data.property_subcategory,
          $scope.property_url= data.property_url;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            preparePropertyIssuanceTransaction(data.property_type, data.previous_property_id, data.property_category, data.property_subcategory, data.property_name, data.property_url, data.property_data, data.number_properties, from, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              number_properties:number_properties,
              property_type:property_type,
              property_type_name:property_type == 1 || property_type == 65 || property_type == 129? 'Indivisible' : 'Divisible', // Only values 1 or 2 are supported right now, but leave room for expansion.
              previous_property_id:previous_property_id,
              property_name:property_name,
              property_category:property_category,
              property_subcategory:property_subcategory,
              property_url:property_url,
              property_data:'\0' // this is fixed to 1 byte by the spec
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
