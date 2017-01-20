var LoktraCart = angular.module('LoktraCart',[]);

LoktraCart
  .service('Cart', ['$rootScope', 'Reviewer', function ($rootScope, Reviewer) { 
      var that = this;    
      $rootScope.$on('onStorageModify', function()  {
        that.refresh();
      });    
      this._cart = {};    
      this._cartLookUp = function(id)  {
        return this._cart.hasOwnProperty(id) ? true : false;
      }    
      this.getCart = function(){
        this._cart = Reviewer.fetch();
        if(!this._cart) { this._cart = {}; }
        
        return this._cart;
      };  
      this.addItem = function(product){
        if(this._cartLookUp(product.id))  {
          this.changeQuantity(product.id);
        }else {
          this._newItem(product);
        }        
        this.save();
      };      
      this._newItem = function(product)  {
        product.quantity = 1;
        this._cart[product.id] = product;
      };  
      this.addItems = function(products) {
        angular.forEach(products, function(product) {
          this.addItem(product);
        }, this);
      };  
      this.save = function() {
        Reviewer.save(this._cart);
      };
        this.remove = function (id) {
        if(!--this._cart[id].quantity) { delete this._cart[id]; }
        this.save();
      }; 
      this.clear = function() {
        this._cart = {};
        Reviewer.remove();
      };  
      this.persist = function() {};  
      this.changeQuantity = function (id){
        this._cart[id].quantity++;
      };  
      this.refresh = function () {
        $rootScope.$broadcast('onCartUpdate')
      };
  }]);

LoktraCart
  .factory('DummyData', function()  {
    return [
      {
        id : 'Nike001', name : 'Nike', price : '$100',
        description: 'Nike, Inc. is an American multinational corporation.'
      },
      {
        id : 'Adi002', name : 'Adidas', price : '$210',
        description: 'Adidas AG is a German multinational corporation.'
      },
      {
        id : 'Ree003', name : 'Reebok', price : '$290',
        description: 'Reebok is a global athletic footwear and apparel company.'
      },
      {
          id: 'Asi004', name: 'Asics', price: '$390',
          description: 'ASICS is a Japanese multinational athletic equipment company.'
      },
      {
          id: 'Tim005', name: 'Timberland', price: '$236',
          description: 'Timberland LLC is an American manufacturer of outdoors shoes.'
      }
    ];
  });

LoktraCart
  .provider('Reviewer', function ()  {    
    var identifier;    
    return {
        setSourceIdentifier: function (id) {
        identifier = id;
      },      
      $get : ['$rootScope', '$window', function($rootScope, $window) {        
        angular.element($window).on('Reviewer', function (event) {
            if (event.key === identifier) {
                alert("hi");
            $rootScope.$broadcast('onStorageModify');
          }
        });        
        return {
          save : function(data)  {
            localStorage.setItem(identifier, JSON.stringify(data));
          },      
          fetch : function() {
            return JSON.parse(localStorage.getItem(identifier));
          },      
          remove : function()  {
            localStorage.removeItem(identifier);
          }
        };
      }]
    }
  });
  
LoktraCart
  .config(function(ReviewerProvider)  {
    ReviewerProvider.setSourceIdentifier('cart');
  });
  
LoktraCart
  .controller('ItemListController', ['$rootScope', '$scope', 'Cart', 'DummyData',
    function($rootScope, $scope, Cart, DummyData) {
      
      $scope.cart = Cart.getCart();
      $scope.products = DummyData;
      $scope.addProduct = function(index)  {
        Cart.addItem($scope.products[index]);
      };
      $scope.removeProduct = function (index, thisElement) {
          while( thisElement.item.quantity!=0) {
              Cart.remove(index);
          }
      };
      $scope.clearcart = function () {
          Cart.clear();
          $scope.cart = Cart.getCart();
      };        
      $scope.increaseQuantity = function (index) {
          var pos;
          console.log(index);
          for (let i in $scope.products) {
              if ($scope.products[i].id == index) {
                  pos = i;
                  break;
              }
          }
          Cart.addItem($scope.products[pos]);
      };
      $scope.decreaseQuantity = function (index) {
          Cart.remove(index);
      };
      $scope.refreshcart = function () {
          
          Cart.refresh();
      };
      $rootScope.$on('onCartUpdate', function () {
          $scope.cart = Cart.getCart();
      });
    }
  ]);