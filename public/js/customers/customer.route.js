'use strict';
//Setting up route
angular.module('customers').config(['$routeProvider',
	function($routeProvider) {
		// Expenses state routing
		$routeProvider.
		when('/customers', {
			templateUrl: 'js/customers/views/list.html'
		}).
		when('/customers/create', {
			templateUrl: 'js/customers/views/create.html'
		}).
		when('/customers/:custId', {
			templateUrl: 'js/customers/views/view.html'
		}).
		when('/customers/:custId/edit', {
			templateUrl: 'js/customers/views/create.html'
		}).
      	otherwise({
        	redirectTo: '/customers'
        });;
	}
]);