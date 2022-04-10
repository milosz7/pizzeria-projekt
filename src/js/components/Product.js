import {templates, select, classNames, settings} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
      amountWidgetInput: thisProduct.element.querySelector(select.widgets.amount.input)
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
      thisProduct.setDefault();
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

  setDefault() {
    const thisProduct = this;
    for (let param in thisProduct.data.params) {
      const paramToCheck = thisProduct.data.params[param];
      for (let option in paramToCheck.options) {
        const currentInput = thisProduct.element.querySelector(`[value="${option}"]`);
        if (paramToCheck.options[option].hasOwnProperty('default')) {
          currentInput.checked = true;
        } else {
          currentInput.checked = false;
        }
      }
    }
    thisProduct.amountWidget.value = settings.amountWidget.defaultValue;
    thisProduct.dom.amountWidgetInput.value = 1;
    thisProduct.processOrder();
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
    const productToAdd = thisProduct.prepareCartProduct();
    const generatedHTML = templates.cartProduct(productToAdd);
    const cartElement = utils.createDOMFromHTML(generatedHTML);
    const evt = new CustomEvent('addCartProduct', {
      bubbles: true,
      detail: {
        element: cartElement,
        productData: productToAdd,
      },
    });
    thisProduct.element.dispatchEvent(evt);
  }
}

export default Product;