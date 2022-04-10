import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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

  prepareData() {
    const thisCartProduct = this;
    const orderSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      name: thisCartProduct.name,
      priceSingle: thisCartProduct.price,
      finalPrice: thisCartProduct.price * thisCartProduct.amount,
      params: thisCartProduct.params,
    };
    return orderSummary;
  }
}

export default CartProduct;