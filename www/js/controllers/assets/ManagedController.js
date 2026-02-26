angular.module("omniControllers")
	.controller("AssetsManagedController",["$scope", "PropertyManager", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT",
		function AssetsManagedController($scope, PropertyManager, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT){
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
			var assetCreation = new Transaction(54,$scope.issuerData.selectedAddress,fee,{
		          transaction_version:0,
		          ecosystem:$scope.ecosystem,
		          property_type : $scope.propertyDetails.propertyType, 
		          previous_property_id: 0, 
		          property_category:$scope.propertyDetails.propertyCategory || '', 
		          property_subcategory:$scope.propertyDetails.propertySubcategory || '', 
		          property_name:$scope.propertyDetails.propertyName, 
		          property_url:$scope.propertyDetails.propertyUrl || '', 
		          property_data:$scope.propertyDetails.propertyData || '', 
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
					numberProperties: 0,
					totalCost : assetCreation.totalCost,
					confirmText:"ASSET.ISSUANCE.CREATE",
					explorerUrl:ADDRESS_EXPLORER_URL,
					successRedirect:"/wallet/assets" 
				},
				transaction:assetCreation
			})
		  }
		}
	])
