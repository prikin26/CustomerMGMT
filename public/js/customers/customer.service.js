'use strict';
angular.module('customers').factory('Customers', ['$resource',
	function($resource) {
		return $resource('customers/:custId', { custId: '@id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);