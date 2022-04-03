/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordeon();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.dom = {
        accordeonTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
        form: thisProduct.element.querySelector(select.menuProduct.form),
        formInputs: thisProduct.element.querySelectorAll(select.all.formInputs),
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
        imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget),
      };
    }

    initAccordeon() {
      const thisProduct = this;
      const classActive = classNames.menuProduct.wrapperActive;
      thisProduct.dom.accordeonTrigger.addEventListener('click', function (evt) {
        evt.preventDefault();
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (!thisProduct.element.classList.contains(classActive) && activeProduct) {
          activeProduct.classList.remove(classActive);
        }
        thisProduct.element.classList.toggle(classActive);
      });
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.dom.form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        thisProduct.processOrder();
        thisProduct.prepareCartElement();
      });
    }

    processOrder() {
      const thisProduct = this;
      const serializedForm = utils.serializeFormToObject(thisProduct.dom.form);
      let productPrice = thisProduct.data.price;
      for (let param in thisProduct.data.params) {
        const selectedParams = serializedForm[param];
        const paramToCheck = thisProduct.data.params[param];
        for (let option in paramToCheck.options) {
          const optionToCheck = paramToCheck.options[option];
          const productImage = thisProduct.dom.imageWrapper.querySelector(`.${param}-${option}`);
          if (optionToCheck.hasOwnProperty('default') && !selectedParams.includes(option)) {
            productPrice = (productPrice - optionToCheck.price);
          } else if (!optionToCheck.hasOwnProperty('default') && selectedParams.includes(option)) {
            productPrice = (productPrice + optionToCheck.price);
          }
          if (selectedParams.includes(option) && productImage) {
            productImage.classList.add(classNames.menuProduct.imageVisible); 
          } else if (!selectedParams.includes(option) && productImage) {
            productImage.classList.remove(classNames.menuProduct.imageVisible);
          }
          thisProduct.selectedOptions = selectedParams;
        }
      }
      thisProduct.dom.priceElem.innerHTML = productPrice * thisProduct.amountWidget.value;
      thisProduct.priceOfOne = productPrice;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
      thisProduct.dom.amountWidgetElem.addEventListener('update', function() {
        thisProduct.processOrder();
      });
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        price: thisProduct.priceOfOne,
        params: {},
      };

      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const serializedForm = utils.serializeFormToObject(thisProduct.dom.form);
      const productParams = {};
      for (let param in thisProduct.data.params) {
        const selectedParams = serializedForm[param];
        productParams[param] = {};
        productParams[param].label = param.charAt(0).toUpperCase() + param.slice(1);
        const paramToCheck = thisProduct.data.params[param];
        if (serializedForm.length !== 0) {
          productParams[param].options = {};
        }
        for (let option in paramToCheck.options) {
          if (selectedParams.includes(option)) {
            productParams[param].options[option] = paramToCheck.options[option].label;
          }
        }
      }
      return productParams;
    }

    prepareCartElement() {
      const thisProduct = this;
      const generatedHTML = templates.cartProduct(thisProduct.prepareCartProduct());
      const cartElement = utils.createDOMFromHTML(generatedHTML);
      app.cart.addProduct(cartElement, thisProduct.prepareCartProduct());
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      if (!thisWidget.input.value) {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      } else {
        thisWidget.setValue(thisWidget.input.value);
      }
      thisWidget.initWidgetControls();
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    }

    initWidgetControls() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkIncrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value + 1);
      });
      thisWidget.linkDecrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value - 1);
      });
    }

    announce() {
      const thisWidget = this;

      const evt = new CustomEvent('update', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(evt);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value, 10);
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;

      if (thisWidget.value !== newValue && !isNaN(newValue) && minValue <= newValue && newValue <= maxValue) {
        thisWidget.value = newValue;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce(); 
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.getElements(element);
      thisCart.initCartActions();
      thisCart.products = [];
    }
    
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {
        wrapper: element,
        toggleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
        totalNumber: element.querySelector(select.cart.totalNumber),
        totalPrices: element.querySelectorAll(select.cart.totalPrice),
        subtotalPrice: element.querySelector(select.cart.subtotalPrice),
        deliveryFee: element.querySelector(select.cart.deliveryFee),
      };
      
    }

    initCartActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('update', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(evt){
        thisCart.remove(evt.detail.cartProduct);
      });
    }

    addProduct(element, productData) {
      const thisCart = this;
      thisCart.products.push(new CartProduct(element, productData));
      thisCart.dom.productList.appendChild(element);
      thisCart.update();
    }

    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalItems = 0;
      let subtotalPrice = 0;
      for (let product of thisCart.products) {
        product.updateCartProductPrice();
        subtotalPrice += product.price * product.amount;
        totalItems += product.amount;
      }
      let totalPrice = subtotalPrice + deliveryFee;
      thisCart.totalPrice = totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalItems;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      if (totalItems !== 0) {
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        for (let price of thisCart.dom.totalPrices) {
          price.innerHTML = totalPrice;
        }
      } else {
        thisCart.dom.deliveryFee.innerHTML = 0;
        for (let price of thisCart.dom.totalPrices) {
          price.innerHTML = 0;
        }
      }
    }

    remove(productToRemove) {
      const thisCart = this;
      const productToRemoveID = thisCart.products.indexOf(productToRemove);
      const productToRemoveDOM = thisCart.dom.productList.children[productToRemoveID];
      productToRemoveDOM.remove();
      thisCart.products.splice(productToRemoveID, 1);
      thisCart.update();
    }
  }

  class CartProduct {
    constructor(element, productData) {
      const thisCartProduct = this;
      for (let data in productData) {
        thisCartProduct[data] = productData[data];
      }
      thisCartProduct.getElements(element);
      thisCartProduct.initCartWidget();
      thisCartProduct.initActions();
      thisCartProduct.updateCartProductPrice();
    }

    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {
        amountWidget: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
      thisCartProduct.dom.wrapper = element;
    }

    initCartWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    }

    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.remove.addEventListener('click', function(evt){
        evt.preventDefault();
        thisCartProduct.remove();
      });
      thisCartProduct.dom.edit.addEventListener('click', function(evt){
        evt.preventDefault();
      });
    }

    updateCartProductPrice() {
      const thisCartProduct = this;
      thisCartProduct.amount = thisCartProduct.amountWidget.value; 
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price * thisCartProduct.amount;
    }

    remove() {
      const thisCartProduct = this;
      const evt = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(evt);
    }
  }

  const app = {
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initMenu: function () {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
