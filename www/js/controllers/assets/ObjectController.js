angular.module("omniControllers")
    .controller("AssetsObjectController", ["$scope", "PropertyManager", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT",
        function AssetsIssuanceController($scope, PropertyManager, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT) {
            $scope.tokenStep = 1;
            $scope.tokenMin = 0;
            $scope.tokenMax = "9223372036854775807";
            $scope.issuerData = {};
            $scope.propertyDetails = { propertyType: 2, propertyCategory: 'Object' };
            $scope.ecosystem = 2;

            // $scope.setEcosystem = function (ecosystem) {
            //     $scope.ecosystem = ecosystem;
            // };

            // $scope.setEcosystem(2);

            $scope.confirm = function () {
                //TODO: VALIDATIONS
                var fee = new Big($scope.issuerData.minerFees);
                var assetCreation = new Transaction(50, $scope.issuerData.selectedAddress, fee, {
                    transaction_version: 0,
                    ecosystem: $scope.ecosystem,
                    property_type: $scope.propertyDetails.propertyType,
                    previous_property_id: 0,
                    property_category: $scope.propertyDetails.propertyCategory || '',
                    property_subcategory: '',
                    property_name: $scope.propertyDetails.propertyName,
                    property_url: $scope.propertyDetails.propertyUrl || '',
                    property_data: $scope.propertyDetails.propertyData || '',
                    number_properties: +new Big($scope.numberProperties).valueOf(),
                    donate: $scope.account.getSetting("donate")
                });


                $scope.modalManager.openConfirmationModal({
                    dataTemplate: '/views/modals/partials/issuance.html',
                    scope: {
                        title: "ASSET.ISSUANCE.MODALTITLE",
                        divisible: false,
                        propertyName: $scope.propertyDetails.propertyName,
                        propertyData: $scope.propertyDetails.propertyData,
                        propertyCategory: $scope.propertyDetails.propertyCategory,
                        propertySubcategory: '',
                        propertyUrl: $scope.propertyDetails.propertyUrl,
                        numberProperties: $scope.numberProperties,
                        totalCost: assetCreation.totalCost,
                        confirmText: "ASSET.OBJECT.CREATE",
                        explorerUrl: ADDRESS_EXPLORER_URL,
                        successRedirect: "/wallet/assets"
                    },
                    transaction: assetCreation
                })
            }
        }
    ])