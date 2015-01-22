angular.module('customers').controller('customerController', ['$scope', '$routeParams', '$location', 'Customers', 
	function($scope,$routeParams, $location, Customers){
		$scope.removeMe = function(cust,ind,evt){
			evt.stopPropagation();
			evt.preventDefault();
			var ans = prompt('Please enter "DELETE" to confirm delete') || ""
			if(cust && ans.toLowerCase()==="delete"){
				cust.$remove();
				$scope.customers.splice(ind,1);
			}
		}

		$scope.list = function(){
			$scope.customers = Customers.query();
		};

		$scope.addItem = function(){
			if(!$scope.item.name || !$scope.item.price){
				alert("Please enter name and price both");
				return;
			}
			if(isNaN($scope.item.price)){
				alert("Please enter valid price");
			}
			$scope.products.push($scope.item);
			$scope.item = {};
		};

		$scope.findOne = function(){
			$scope.action = 'New'
			if($routeParams.custId){
				$scope.action = 'Edit';
				$scope.customer = Customers.get({ 
					custId: $routeParams.custId
				});
			}
		};

		$scope.save = function(){
			var customer;
			if($scope.action === "New"){
				customer = new Customers($scope.customer);
				customer.$save(function(response){
					$location.path('customers/' + response.id);
				}, function(err){
					$scope.errors = err.data.error;
				})
			} else {
				customer = $scope.customer;
				customer.$update(function(response){
					$location.path('customers/' + response.id);
				}, function(err){
					$scope.errors = err.data.error;
				})
			}
		}
}])