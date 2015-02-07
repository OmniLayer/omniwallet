angular.module("omniControllers")
	.controller("AssetsIssuanceController",["$scope", "PropertyManager", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT",
		function AssetsIssuanceController($scope, PropertyManager, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT){
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807";
		  $scope.categories = [];
		  $scope.subcategories = [];
		  $scope.issuerData = {};
		  $scope.propertyDetails = {propertyType : 2, propertyCategory : ''};
		  
		  $scope.setEcosystem = function(ecosystem){
		  	$scope.ecosystem=ecosystem;
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
		  
		  $scope.setEcosystem(2);
		  
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
			var assetCreation = new Transaction(50,$scope.issuerData.selectedAddress,fee,{
		          transaction_version:0,
		          ecosystem:$scope.ecosystem,
		          property_type : $scope.propertyDetails.propertyType, 
		          previous_property_id: 0, 
		          property_category:$scope.propertyDetails.propertyCategory || '\0', 
		          property_subcategory:$scope.propertyDetails.propertySubcategory || '\0', 
		          property_name:$scope.propertyDetails.propertyName, 
		          property_url:$scope.propertyDetails.propertyUrl || '\0', 
		          property_data:$scope.propertyDetails.propertyData || '\0', 
		          number_properties:$scope.isDivisible() ? +new Big($scope.numberProperties).times(SATOSHI_UNIT).valueOf() : +$scope.numberProperties,
		          donate: $scope.account.getSetting("donate")
		        });


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/issuance.html',
				scope:{
					title:"ASSET.ISSUANCE.MODALTITLE",
				    divisible : $scope.isDivisible(),
				    propertyName : $scope.propertyDetails.propertyName,
				    propertyData : $scope.propertyDetails.propertyData,
				    propertyCategory : $scope.propertyDetails.propertyCategory,
				    propertySubcategory : $scope.propertyDetails.propertySubcategory,
				    propertyUrl : $scope.propertyDetails.propertyUrl,
				    numberProperties: $scope.numberProperties,
				    totalCost : assetCreation.totalCost,
					confirmText:"ASSET.ISSUANCE.CREATE",
					explorerUrl:ADDRESS_EXPLORER_URL
				},
				transaction:assetCreation
			})
		  }
		}
		])