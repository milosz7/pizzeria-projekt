import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function() {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    let matchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        matchingHash = page.id;
        break;
      }
    }
    app.activatePage(matchingHash);
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageID = link.getAttribute('href').slice(1);
        app.activatePage(pageID);
        window.location.hash = `#/${pageID}`;
      });
      
    }
  },

  activatePage: function(pageID) {
    const thisApp = this;
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageID);
    }
    for (let link of thisApp.navLinks) {
      const linkID = link.getAttribute('href').slice(1);
      link.classList.toggle(classNames.nav.active, linkID === pageID);  
    }
  },

  initData: function () {
    const thisApp = this;
    const url = `${settings.db.url}/${settings.db.products}`;
    thisApp.data = {};
    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      }); 
  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('addCartProduct', function(evt) {
      app.cart.addProduct(evt.detail.element, evt.detail.productData);
    });
  },
  init: function () {
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
  },
};

app.init();

