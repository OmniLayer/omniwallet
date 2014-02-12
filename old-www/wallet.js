function WalletController($scope, $http, $q) {

  $scope.footer = "FOOTER";
  $scope.title = "TITLE";

  $scope.addressArray = [];
  $scope.uuid = '';
  $scope.wallet = Wallet.GetWallet();

  $scope.DeleteAddress = function(addrIdx) {
    var newAddressArray = Wallet.DeleteIndex($scope.uuid, addrIdx);
    $scope.addressArray.splice(addrIdx,1);
  }

  $scope.CreateNewWallet = function() {
    Wallet.CreateNewWallet();
  }

  $scope.SyncWithServer = function() {
    Wallet.SyncWithServer();
  }

  $scope.AddPrivKey = function() {
    Wallet.AddPrivKey();
  }
  $scope.getWalletData = function () {

    var myURLParams = BTCUtils.getQueryStringArgs();
    var uuid = myURLParams['uuid'];
    $scope.uuid = uuid;

    $scope.getAddress = function (addr, callback) {
      return returnval = $http.get("/v1/address/addr/" + addr + ".json").then(
        function (value) {
        return value;
      },
      function( value ) {
        // If the address can't be found in the blockchain, just make an empty dummy object.
        return {
          'data': {
            'address': addr,
            'balance': []
          }
        };
      }
      );
      return returnval;
    }

    $scope.getAddresses = function (callback) {

      var wallet = Wallet.GetWallet();

      var addresses = wallet.addresses;
      $scope.uuid = wallet.uuid;

      var prom = [];
      addresses.forEach(function (obj, i) {
        var addr = obj;

        prom.push($scope.getAddress(addr, function (value) {
        }));
      });

      $q.all(prom).then(
        function (data) {
        callback(data);
      },
      function( data ) {
        callback( data );
      });
    };

    //Get currencies
    $http.get('currencies.json', {}).success(function (data, status, headers, config) {

      $scope.currencies = data;

    }).then(function () {

      $scope.getAddresses(function (data) {

        data.forEach(function (obj, i) {

          //Sort currencies as in the table and show only needed

          var dataBalance = [];


          for (var i = 0; i < $scope.currencies.length; i++) {
            //For each currency in the currencies find the balance and add it to the array
            var currency = $scope.currencies[i].symbol;
            //    console.log(currency);

            var item = Wallet.FindItemInArray(obj.data.balance, currency);
            //console.log('value');
            //console.log(item);

            dataBalance.push(item);
          }

          var data = {
            balance: dataBalance,
            address: obj.data.address

          };

          $scope.addressArray.push(data);
        });

        //console.log($scope.addressArray);
        //alert();
      });
    });



  }

  $scope.getWalletData();
}

Wallet = function () {

};
Wallet.FindItemInArray = function (array, item) {
  if (array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].symbol == item) {
        return array[i].value;
      }
    }

  }
  return "/";
};
Wallet.StorageKey = "master-wallets";

Wallet.SyncWithServer = function () {
  console.log("Syncing");
  if (!localStorage[Wallet.StorageKey]) {
    Wallet.CreateNewWallet();
  }
  var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

  var postData = {
    type: 'SYNCWALLET',
    masterWallets: localStorage[Wallet.StorageKey]
  }
  console.log('posting', postData);
  $.post('/v1/user/wallet/sync/', postData, function(data, status, headers, config) {
    console.log(data);
  });
};

Wallet.GenerateUUID = function () {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};

Wallet.GetWallet = function () {
  if (Wallet.supportsStorage()) {

    var myURLParams = BTCUtils.getQueryStringArgs();
    var uuid = myURLParams['uuid'];

    if (localStorage[Wallet.StorageKey]) {
      var wallets = JSON.parse(localStorage[Wallet.StorageKey]);
      console.log( 'Found ' + wallets.length + ' wallets.' );

      for (var i = 0; i < wallets.length; i++) {
        if (wallets[i].uuid == uuid) {
          return wallets[i];
        }
      }
      //Returning the first wallet
      if (!uuid && wallets.length > 0)
        {
          console.log( 'Just returning the first wallet.' );
          return wallets[0];
        }
    }
    // No wallets - create one
    console.log( 'No wallets already exist, making a new one.' );
    Wallet.CreateNewWallet(uuid);
    var wallets = JSON.parse(localStorage[Wallet.StorageKey]);
    return wallets[0];
  }
  return new Array();
};

Wallet.AddAddress = function (address) {
  if (Wallet.supportsStorage()) {

    var uuidToOpen = "";

    if (!localStorage[Wallet.StorageKey]) 
      {
        Wallet.CreateNewWallet();
      }
      var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

      //Add address to the first wallet
      wallets[0].addresses.push(address);

      uniqueArray = wallets[0].addresses.filter(function(elem, pos) {
        return wallets[0].addresses.indexOf(elem) == pos;
      });

      wallets[0].addresses = uniqueArray;

      uuidToOpen = wallets[0].uuid;

      localStorage[Wallet.StorageKey] = JSON.stringify(wallets);

      window.location.href = "wallet.html?uuid=" + uuidToOpen;

  }
};

Wallet.AddAddress = function (address) {
  if (Wallet.supportsStorage()) {

    var uuidToOpen = "";

    if (!localStorage[Wallet.StorageKey]) 
      {
        Wallet.CreateNewWallet();
      }
      var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

      //Add address to the first wallet
      wallets[0].addresses.push(address);

      uniqueArray = wallets[0].addresses.filter(function(elem, pos) {
        return wallets[0].addresses.indexOf(elem) == pos;
      });

      wallets[0].addresses = uniqueArray;

      uuidToOpen = wallets[0].uuid;

      localStorage[Wallet.StorageKey] = JSON.stringify(wallets);

      window.location.href = "wallet.html?uuid=" + uuidToOpen;

  }
};

Wallet.GetAddressesOfFirstWallet = function () {
  var retVal = new Array();
  if (!Wallet.supportsStorage()) {
    return retVal;
  }

  if (!localStorage[Wallet.StorageKey]) {
    return retVal;
  }

  var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

  if (wallets.length <= 0 || wallets.length > 100 || !wallets[0] || !wallets[0].addresses) {
    return retVal;
  }

  retVal = wallets[0].addresses;

  return retVal;
};


Wallet.DeleteIndex = function (walletUuid, idx) {
  if (!Wallet.supportsStorage()) {
    return null;
  }

  if (!localStorage[Wallet.StorageKey]) {
    return null;
  }

  var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

  if (wallets.length < 0 || wallets.length > 100) {
    return null;
  }

  var walletIndex = -1;
  for (var i = 0; i < wallets.length; i++) {
    if (wallets[i].uuid == walletUuid) {
      walletIndex = i;
    }
  }

  if (walletIndex < 0)
    return null;


  wallets[walletIndex].addresses.splice(idx,1);

  var retVal = wallets[walletIndex].addresses;

  localStorage[Wallet.StorageKey] = JSON.stringify(wallets);

  return retVal;
};


Wallet.CreateNewWallet = function (in_uuid) {
  var uuid = (in_uuid)? in_uuid : Wallet.GenerateUUID();
  if (Wallet.supportsStorage()) {

    var uuidToOpen = "";

    if (localStorage[Wallet.StorageKey]) {
      var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

      //Create new wallet
      var addresses = new Array();
      var wallet = {
        uuid: uuid,
        addresses: addresses
      };

      wallets.unshift(wallet);

      uuidToOpen = wallets[0].uuid;

      localStorage[Wallet.StorageKey] = JSON.stringify(wallets);
    }
    else {//Walets dont exists
      //Create new wallet and add this addr to it

      uuidToOpen = uuid;

      var addresses = new Array();

      var obj = {
        uuid: uuid,
        addresses: addresses
      };

      var wallets = new Array();
      wallets.push(obj);

      localStorage[Wallet.StorageKey] = JSON.stringify(wallets);
    }
    //open wallet.html with the URL parameter: uuid=uuid-of-first-address
    window.location.href = "wallet.html?uuid=" + uuidToOpen;
  }
};
Wallet.AddPrivKey = function() {
  var wallet = this.GetWallet();
  var priv = document.forms['privkeyentry'].privkey.value
  var pass = document.forms['privkeyentry'].password.value

  if(pass) {
    try {
      var key = new _Bitcoin.ECKey(priv);
      var enc = key.getEncryptedFormat(pass);

      this.StoreKey({address: key.getBitcoinAddress().toString(), encrypted: enc });
      this.AddAddress(key.getBitcoinAddress().toString());
    } catch(e) {
      console.log('error: not a known format',e);
      $('.priverror').show();
      $('.priventry').hide();
    }
  } else {
    console.log('error: we require a passphrase to store keys.');
    $('.priverror').show();
  }
}
Wallet.StoreKey = function(encrypted) {
  if (Wallet.supportsStorage()) {

    var wallets = JSON.parse(localStorage[Wallet.StorageKey]);

    if( !wallets[0].keys)
      wallets[0].keys = []
    //Add address to the first wallet
    wallets[0].keys.push(encrypted);

    localStorage[Wallet.StorageKey] = JSON.stringify(wallets);

  }
}
Wallet.DecryptPrivKey = function(encrypted, passphrase) {
  //namespacing concerns, can't sign and decode on same page without this
  __Bitcoin = Bitcoin; Bitcoin = _Bitcoin;
  __Crypto = Crypto; Crypto = _Crypto

  var key = new _Bitcoin.ECKey.decodeEncryptedFormat(encrypted,passphrase);
  var decrypted = key.getWalletImportFormat();

  _Bitcoin = Bitcoin; Bitcoin = __Bitcoin;
  _Crypto = Crypto; Crypto = __Crypto

  return decrypted;
}

Wallet.supportsStorage = function () {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};


$(document).ready(function () {
  $('#createNewWallet').click(function () {
    Wallet.CreateNewWallet();
  });
});
