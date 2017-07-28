'use strict';
angular.module('omniFilters')
    .filter('bigjs', ['$sce', function ($sce) {
        return function (input, format, noZerosTrimming) {
            var dropFraction = false;

            if (input == null || format == null) 
                return input;
            if (format === '') 
                return '';
            if (format.indexOf('.') < 0) {
                format = format.replace(/(\D*$)/, ".0$1");
                dropFraction = true;
            }

            var nums = Big(input).toFixed(8);
            if (!noZerosTrimming && nums !== '0') {
                nums = nums.replace(/0+(?=\D+$)|0+$/g, '').replace(/(^\D*|:)?0+/g, function(str, p1) {return p1 ? p1 + '0' : str;});
            }
            nums = nums.split('.');

            if (nums[1] !== undefined && format.indexOf('.') >= 0 && nums[1].replace(/\D/g, '') === '') {
                nums[1] = '0' + nums[1];
            }

            if (nums.length > 1 && !dropFraction) {
                nums[0] = '<span class="numeral-left">' + nums[0] + '</span>';
                nums[1] = '<span class="numeral-right">.' + nums[1] + '</span>';
            }
            else {
                nums[0] = '<span class="numeral-integer">' + nums[0] + '</span>';
                nums = [nums[0]];
            }

            return $sce.trustAsHtml(nums.join(''));
        };
    }]);
