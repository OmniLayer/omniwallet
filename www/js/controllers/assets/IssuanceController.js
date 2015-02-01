angular.module("omniControllers")
	.controller("AssetsIssuanceController",["$scope", "PropertyManager", "Transaction",
		function AssetsIssuanceController($scope, PropertyManager, Transaction){
		  $scope.ecosystem = 2;
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807";
		  $scope.categories = [];
		  $scope.subcategories = [];
		  $scope.issuerData = {};
		  $scope.propertyDetails = {propertyType : 2, propertyCategory : ''};
		  
		  $scope.setEcosystem = function(){
		    $scope.categories=[];
		    $scope.subcategories=[];
		    $scope.loadCategories();
		  };
		  
		  $scope.loadCategories=function(){
		    PropertyManager.loadCategories($scope.ecosystem).then(function(result){  
		      $scope.categories=result.data.categories.sort();
		    });
		  };
		  $scope.loadSubcategories=function(category){
		    $scope.propertySubcategory = '';
		    PropertyManager.loadSubcategories($scope.ecosystem, category).then(function(result){  
		      $scope.subcategories=result.data.subcategories.sort();
		    });
		  };
		  
		  $scope.setEcosystem();
		  
		  $scope.isDivisible=function(){
		    return $scope.propertyDetails.propertyType == 2 || $scope.propertyDetails.propertyType == 66 || $scope.propertyDetails.propertyType == 130
		  };
		  
		  $scope.typeChanged = function(){
		    $scope.tokenStep = $scope.tokenMin = $scope.isDivisible() ? 0.00000001 : 1;
		    $scope.tokenMax = $scope.isDivisible() ? "92233720368.54775807" : "9223372036854775807";
		  };

		  $scope.confirm =function(){
			//TODO: VALIDATIONS
		  	var fee = new Big($scope.issuerData.minerFees);
			var crowdsaleCreation = new Transaction(51,$scope.issuerData.selectedAddress,fee,{
		          transaction_version:0,
		          ecosystem:$scope.ecosystem,
		          property_type : $scope.propertyDetails.propertyType, 
		          previous_property_id: 0, 
		          property_category:$scope.propertyDetails.propertyCategory || '\0', 
		          property_subcategory:$scope.propertyDetails.propertySubcategory || '\0', 
		          property_name:$scope.propertyDetails.propertyName, 
		          property_url:$scope.propertyDetails.propertyUrl || '\0', 
		          property_data:$scope.propertyDetails.propertyData || '\0', 
		          number_properties:$scope.isDivisible() ? +new Big($scope.numberOfTokens).times(SATOSHI_UNIT).valueOf() : +$scope.numberOfTokens,
		          currency_identifier_desired:$scope.selectedCurrency.currencyId,
		          deadline:Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0) / 1000,
		          earlybird_bonus:$scope.earlyBirdBonus,
		          percentage_for_issuer:$scope.percentageForIssuer,
		          donate: $scope.account.getSetting("donate")
		        });


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/crowdsale.html',
				scope:{
					title:"ASSET_CROWDSALE_MODALTITLE",
				    divisible : $scope.isDivisible(),
				    propertyName : $scope.propertyDetails.propertyName,
				    propertyData : $scope.propertyDetails.propertyData,
				    propertyCategory : $scope.propertyDetails.propertyCategory,
				    propertySubcategory : $scope.propertyDetails.propertySubcategory,
				    propertyUrl : $scope.propertyDetails.propertyUrl,
				    selectedCurrency : $scope.selectedCurrency,
				    numberOfTokens: $scope.numberOfTokens,
				    deadline : (new Date(Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0))).toUTCString(),
				    earlyBirdBonus : $scope.initialEarlyBirdBonus,
				    percentageForIssuer : $scope.percentageForIssuer,
				    fees : $scope.issuerData.minerFees,
				    totalCost : crowdsaleCreation.totalCost,
					confirmText:"ASSET_CROWDSALE_START",
					explorerUrl:ADDRESS_EXPLORER_URL
				},
				transaction:crowdsaleCreation
			})
		  }
		  
		  transactionGenerationController.setModalScope = function($modalScope){
		    $modalScope.transactionSuccess = false, $modalScope.transactionError = false, $modalScope.waiting = false, $modalScope.privKeyPass = {};
		    $modalScope.convertSatoshiToDisplayedValue=  $scope.convertSatoshiToDisplayedValue,
		    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
		    $modalScope.numberProperties=  $scope.numberProperties,
		    $modalScope.divisible= $scope.isDivisible() ? 'divisible' : 'indivisible',
		    $modalScope.propertyName= $scope.propertyName,
		    $modalScope.propertyCategory= $scope.propertyCategory,
		    $modalScope.propertySubcategory= $scope.propertySubcategory,
		    $modalScope.propertyUrl= $scope.propertyUrl;
		    $modalScope.propertyData= $scope.propertyData;
		    $modalScope.selectedAddress= $scope.selectedAddress;
		    $modalScope.minerFees= +$scope.convertDisplayedValue($scope.minerFees);
		    $modalScope.totalCost= +$scope.convertDisplayedValue($scope.totalCost);
		    $modalScope.expanded = true;
		    $modalScope.rendered = false;
		    $modalScope.setExpandableDiv = function(){
		      $timeout(function(){
		        $scope.$apply(function(){
		          var offsetHeight = document.getElementById('expandable-div').offsetHeight;
		          var lines = offsetHeight/25;
		          if (lines > 2) {
		            $modalScope.longText = true;
		            $modalScope.expanded = false;
		          }
		          else {
		            $modalScope.longText = false;
		            $modalScope.expanded = true;
		          } 
		        });   
		      },0,false);  
		    }

		    
		  };
		  
		  transactionGenerationController.generateData = function(){
		    return {
		      from:$scope.selectedAddress,
		      transactionType: 50,
		      transactionData: {
		        transaction_version:0,
		        ecosystem:$scope.ecosystem,
		        property_type : $scope.propertyType, 
		        previous_property_id:$scope.previousPropertyId || 0, 
		        property_category:$scope.propertyCategory || '\0', 
		        property_subcategory:$scope.propertySubcategory || '\0', 
		        property_name:$scope.propertyName, 
		        property_url:$scope.propertyUrl || '\0', 
		        property_data:$scope.propertyData || '\0', 
		        number_properties: $scope.isDivisible() ? +$scope.convertDisplayedValue($scope.numberProperties) : +$scope.numberProperties,
		        transaction_from: $scope.selectedAddress,
		        fee: $scope.convertDisplayedValue($scope.minerFees),
		        testnet: (TESTNET || false),
		        donate: Account.getSetting("donate")
		      }
		    };
		  };
		}
		])