function WalletController($scope, $http, $q) {
 
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";

    $scope.addressArray = [];
    $scope.uuid = '';
  
    $scope.DeleteAddress = function(addrIdx) {
    	var newAddressArray = Wallet.DeleteIndex($scope.uuid, addrIdx);
    	$scope.addressArray.splice(addrIdx,1);
    }
    
    $scope.CreateNewWallet = function() {
    	Wallet.CreateNewWallet();
    }
    
    $scope.getWalletData = function () {
    
    	var myURLParams = BTCUtils.getQueryStringArgs();
	var uuid = myURLParams['uuid'];
    	$scope.uuid = uuid;

        $scope.getAddress = function (addr, callback) {
            return $http.get("addr/" + addr + ".json").success(
                function (value) {
                    return callback(value.data);
                }
            );
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

            $q.all(prom).then(function (data) {

                callback(data);
            });
        };

        //Get currencies
        $http.get('currencies.json', {}).success(function (data, status, headers, config) {
            //console.log('currencies');
            //console.log(data);

            $scope.currencies = data;

        }).then(function () {
            //console.log('finished');

            $scope.getAddresses(function (data) {
                console.log(data);

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

            for (var i = 0; i < wallets.length; i++) {
                if (wallets[i].uuid == uuid) {
                    return wallets[i];
                }
            }
            //Returning the first wallet
            if (!uuid && wallets.length > 0)
            	return wallets[0];
        }
        // No wallets - create one
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

            console.log(wallets);

            wallets.unshift(wallet);

            console.log(wallets);

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

            console.log(obj);
            console.log(JSON.stringify(obj));

            var wallets = new Array();
            wallets.push(obj);

            console.log(wallets);
            console.log(JSON.stringify(wallets));

            localStorage[Wallet.StorageKey] = JSON.stringify(wallets);
        }



        //open wallet.html with the URL parameter: uuid=uuid-of-first-address

        window.location.href = "wallet.html?uuid=" + uuidToOpen;


    }
};

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

    $('#syncWithServer').click(function () {
        Wallet.SyncWithServer();
    });
});