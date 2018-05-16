class MyApp extends Polymer.Element {
    /**
     * Define the id of Custom Elements
     * 
     * @returns id name
     */
    static get is() {
      return 'my-app';
    }

    /**
     * getter for all the properties utilized in class
     * 
     * @returns all properties used in current class
     */
    static get properties() {
      return {
        item: {
          type: String,
          reflectToAttribute: true,
          observer: '_itemChanged',
        },
        routeData: Object,
        subroute: String,
        // This shouldn't be neccessary, but the Analyzer isn't picking up
        // Polymer.Element#rootPath
        rootPath: String,
        itemNumber: {
          type: Number,
          value: 0,
          computed: '_computeItemNumber(item)'
        },
        newItemNumber: {
          type: Number,
          computed: '_computeNewItemNumber(itemNumber, cart.length)'
        },
        cart: {
          type: Array,
          value: [{
              name: "Hello",
              price: 9.9
            },
            {
              name: "Fellow",
              price: 29.9
            },
            {
              name: "Bye",
              price: 99.9
            },
          ]
        },
        cartItem: {
          type: Object,
          value: {
            giftMessage: "",
            shippingAddress: {
              firstName: "",
              lastName: "",
              streetAddress1: "",
              streetAddress2: "",
              cityName: "",
              state: "",
              zipCode: "",
              recipientNumber: ""
            }
          }
        },
        looped: {
          type: Object,
          notify: true,
          value: {
            all: false,
            first: false,
            at: 0,
            last: 0,
          }
        },
        selectedTab: {
          type: Number,
          value: 0,
          observer: '_selectedTabModifield'
        }
      };
    }

    /**
     * Observers of Class
     */
    static get observers() {
      return [
        '_routeitemChanged(routeData.item)',
        '_cartItemChanged(cartItem.shippingAddress.*)',
        '_cartGiftChanged(cartItem.giftMessage)',
        '_cartLengthChange(cart.length)'
      ];
    }
    
    /**
     * Ready Life Cycle method of the element
     */
    ready() {
      super.ready();
      var _this = this;
      this.allowedCardNetworks = ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'];

      if (window.PaymentRequest) {
        var request = this.createPaymentRequest();

        request.canMakePayment()
          .then(function (result) {
            if (result) {
              // Display PaymentRequest dialog on interaction with the existing checkout button
              _this.$.buyButton.addEventListener('click', function (e) {
                _this.onBuyClicked(e)
              }.bind(this), false);
            }
          })
          .catch(function (err) {
            _this.showErrorForDebugging(
              'canMakePayment() error! ' + err.name + ' error: ' + err.message);
          });
      } else {
        _this.showErrorForDebugging('PaymentRequest API not available.');
      }
    }

    /**
     * Observed function called whenever the route is changed
     * 
     * @param {String} item 
     */
    _routeitemChanged(item) {
      console.log("Route Change", this.item);
      this.item = item || '0';
    }

    /**
     * Observer function called whenever cartItem Object is changed
     */
    _cartItemChanged() {
      this.set('cart.' + this.itemNumber + ".shippingAddress", Object.assign({}, this.cartItem.shippingAddress));
    }

    /**
     * Observer function called whenever cartItem.giftMessage Object is changed
     */
    _cartGiftChanged() {
      this.set('cart.' + this.itemNumber + ".giftMessage", this.cartItem.giftMessage);
    }

    /**
     * Observer function called whenever item is changed
     * 
     * @param {Number} item numerical representation of cart index
     */
    _itemChanged(item) {
      if (item > (this.cart.length - 1)) {
        window.history.go(-1);
      } else {
        if (!isNaN(item)) {
          console.log("saved Cart Item", this.cartItem.shippingAddress, item);
          this.setCartItem();
          console.log("current Item", this.itemNumber);
          console.log("cart", this.cart);
        }
      }
    }

    /**
     * set the cartItem Object with values form array
     */
    setCartItem() {
      console.log(this.itemNumber);
      if (this.itemNumber < this.cart.length) {
        this.set('cartItem.name', this.cart[this.itemNumber].name);
        this.set('cartItem.price', this.cart[this.itemNumber].price);
      }
      if (this.itemNumber < this.cart.length && this.cart[this.itemNumber].shippingAddress) {
        this.set('cartItem.giftMessage', this.cart[this.itemNumber].giftMessage);
        this.set('cartItem.shippingAddress', Object.assign({}, this.cart[this.itemNumber].shippingAddress));
      } else {
        console.log(this.itemNumber);
        this.set('cartItem.giftMessage', "");
        this.set('cartItem.shippingAddress', {
          firstName: "",
          lastName: "",
          streetAddress1: "",
          streetAddress2: "",
          cityName: "",
          state: "",
          zipCode: "",
          recipientNumber: ""
        });
      }
    }

    /**
     * Computation function for evaluating the route for next page
     * 
     * @param {*} itemNumber 
     */
    _computeNewItemNumber(itemNumber) {
      let newItemNumber = itemNumber + 1;
      if (newItemNumber < (this.cart.length)) {
        return newItemNumber;
      } else {
        return "review";
      }
    }

    /**
     * Computation function to switch tabs based on item
     * 
     * @param {*} item index route of the current cart array 
     */
    _computeItemNumber(item) {
      if (item === "review" && this.looped.all) {
        this.set("selectedTab", 1);
        this.set('looped', {
          all: true,
          at: this.cart.length,
          last: this.itemNumber,
          first: true
        });
        console.log("Go to Review Page", this.selectedTab);
        return 0;
      } else if (item === "review" && !this.looped.all) {
        this.set("route.path", "/");
        return 0;
      } else {
        this.set("selectedTab", 0);
        return parseInt(item);
      }
    }

    /**
     * Function to switch current tab
     */
    _selectedTabModifield() {
      if (this.selectedTab === 0) {
        this.$.shipping.removeAttribute("hidden");
        this.$.review.setAttribute("hidden", true);
      }
      if (this.selectedTab === 1) {
        this.$.shipping.setAttribute("hidden", true);
        this.$.review.removeAttribute("hidden");
      }
    }

    /**
     * fires on click of next button. Make you jump to nex item in array
     */
    _nextItem() {
      if (this.newItemNumber === "review") {
        this.set('looped.all', true);
      }
      this.set('route.path', '/' + this.newItemNumber);
      this.set('looped.last', this.itemNumber);
    }

    /**
     * fires on click event of delete item in shipping tab. splice the array item on the fly
     */
    _deleteItem() {
      this.splice('cart', this.itemNumber, 1);
      if (this.itemNumber > (this.cart.length - 1)) {
        window.history.go(-1);
      }
      console.log(this.cart);
      this.setCartItem();
      this._computeNewItemNumber(this.itemNumber)
    }

     /**
     * fires on click event of delete item in review tab. splice the array item in review tab
     */
    _deleteReviewItem(e) {
      this.splice('cart', parseInt(e.currentTarget.indx), 1);
      console.log(this.cart);
    }

    /**
     * Fires on click of checkout button. Opens a Payment Request Modal.
     */
    onBuyClicked() {

      var _this = this;
      console.log(this);
      _this.createPaymentRequest()
        .show()
        .then(function (response) {
          // Dismiss payment dialog.
          response.complete('success');
          _this.handlePaymentResponse(response);
        })
        .catch(function (err) {
          _this.showErrorForDebugging(
            'show() error! ' + err.name + ' error: ' + err.message);
        });
    }

    /**
     * Builds the Payment Request
     */
    createPaymentRequest() {
      var _this = this;
      var methodData = [{
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: Array.from(this.allowedCardNetworks, (network) => network.toLowerCase())
        }
      }];

      var details = {
        total: {
          label: 'Test Purchase',
          amount: {
            currency: 'USD',
            value: '1.00'
          }
        }
      };

      var options = {
        requestPayerEmail: true,
        requestPayerName: true
      };

      return new PaymentRequest(methodData, details, options);
    }

    /**
     * Handle the response provided by payment request
     * 
     * @param {Object} response 
     */
    handlePaymentResponse(response) {
      var formattedResponse = document.createElement('pre');
      formattedResponse.appendChild(
        document.createTextNode(JSON.stringify(response.toJSON(), null, 2))
      );
      this.$.checkout.insertAdjacentElement('afterend', formattedResponse);
    }

    /**
     * Show Error for Debugging
     * 
     * @param {String} text 
     */
    showErrorForDebugging(text) {
      var errorDisplay = document.createElement('code');
      errorDisplay.style.color = 'red';
      errorDisplay.appendChild(document.createTextNode(text));
      var p = document.createElement('p');
      p.appendChild(errorDisplay);
      this.$.checkout.insertAdjacentElement('afterend', p);
    }

  }

  window.customElements.define(MyApp.is, MyApp);