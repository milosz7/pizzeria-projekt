/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
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
      thisProduct.accordeonTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    }

    initAccordeon() {
      const thisProduct = this;
      const classActive = classNames.menuProduct.wrapperActive;
      thisProduct.accordeonTrigger.addEventListener('click', function (evt) {
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
      thisProduct.form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      const serializedForm = utils.serializeFormToObject(thisProduct.form);
      let productPrice = thisProduct.data.price;
      for (let param in thisProduct.data.params) {
        const selectedParams = serializedForm[param];
        const paramToCheck = thisProduct.data.params[param];
        for (let option in paramToCheck.options) {
          const optionToCheck = paramToCheck.options[option];
          const productImage = thisProduct.imageWrapper.querySelector(`.${param}-${option}`);
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
        }
      }
      thisProduct.priceElem.innerHTML = productPrice;
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
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
