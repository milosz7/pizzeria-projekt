import {select, classNames, settings} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.getElements(element);
    thisCart.initCartActions();
    thisCart.detectErrors();
    thisCart.products = [];
  }
  
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {
      wrapper: element,
      cartHeight: document.querySelector(select.cart.heightDiv),
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      totalNumber: element.querySelector(select.cart.totalNumber),
      totalPrices: element.querySelectorAll(select.cart.totalPrice),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      form: element.querySelector(select.cart.form),
      formInputs: element.querySelectorAll(select.cart.formInputs),
      formSubmit: element.querySelector(select.cart.formSubmit),
      phone: element.querySelector(select.cart.phone),
      address: element.querySelector(select.cart.address),
    };

  }

  toggleScrolling() {
    const thisCart = this;
    const cartHeight = thisCart.dom.cartHeight.getBoundingClientRect().height + 24;
    const windowHeight = window.innerHeight;
    if (windowHeight >= cartHeight) {
      thisCart.dom.wrapper.classList.remove(classNames.cart.scrollable);
    } else if (windowHeight < cartHeight) {
      thisCart.dom.wrapper.classList.add(classNames.cart.scrollable);
    }
  }

  initCartActions() {
    const thisCart = this;
    const cartExpandTime = 250;
    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      setTimeout(function() {
        thisCart.toggleScrolling();
      }, cartExpandTime);
    });
    thisCart.dom.productList.addEventListener('update', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(evt){
      thisCart.remove(evt.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(evt) {
      evt.preventDefault();
      thisCart.sendOrder();
    });
    for (let input of thisCart.dom.formInputs) {
      input.addEventListener('change', function() {
        thisCart.detectErrors();
      });
    }
  }

  addProduct(element, productData) {
    const thisCart = this;
    thisCart.products.push(new CartProduct(element, productData));
    thisCart.dom.productList.appendChild(element);
    thisCart.update();
    thisCart.detectErrors();
    thisCart.visualUpdate();
    thisCart.toggleScrolling();
  }

  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalItems = 0;
    thisCart.subtotalPrice = 0;
    for (let product of thisCart.products) {
      product.updateCartProductPrice();
      thisCart.subtotalPrice += product.price * product.amount;
      thisCart.totalItems += product.amount;
    }
    let totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.totalPrice = totalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalItems;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    if (thisCart.totalItems !== 0) {
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
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
    thisCart.detectErrors();
    thisCart.visualUpdate();
    thisCart.toggleScrolling();
  }

  sendOrder() {
    const thisCart = this;
    const url = `${settings.db.url}/${settings.db.orders}`;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.form.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalItems,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    for (let product of thisCart.products) {
      payload.products.push(product.prepareData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(utils.handleErrors)
      .catch(function(error) {
        console.log(error);
      });
  }

 

  detectErrors() {
    const thisCart = this;
    for (let input of thisCart.dom.formInputs) {
      const inputLimitLocation = input.getAttribute('name') + 'LengthMin';
      const inputMin = settings.cart[inputLimitLocation];
      if (input.value.length < inputMin) {
        input.classList.add(classNames.cart.error);
      } else if (input.value.length >= inputMin) {
        input.classList.remove(classNames.cart.error);
      }
      if (!thisCart.checkInputs() && thisCart.products.length !== 0) {
        thisCart.dom.formSubmit.disabled = false;
      } else {
        thisCart.dom.formSubmit.disabled = true;
      }
    }
  }

  visualUpdate() {
    const thisCart = this;
    thisCart.dom.wrapper.classList.add(classNames.cart.processing);
    setTimeout(function() {
      thisCart.dom.wrapper.classList.remove(classNames.cart.processing);
    }, 500);
  }

  checkInputs() {
    const thisCart = this;
    for (let input of thisCart.dom.formInputs) {
      if (input.classList.contains(classNames.cart.error)) {
        return true;
      }
    }
    return false;
  }
}

export default Cart;