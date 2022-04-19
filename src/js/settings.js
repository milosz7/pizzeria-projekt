export const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
    homepage: '#template-homepage',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
    pages: '#pages',
    booking: '.booking-wrapper',
    home: '#home',
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
    datePicker: {
      wrapper: '.date-picker',
      input: 'input[name="date"]'
    },
    hourPicker: {
      wrapper: '.hour-picker',
      input: 'input[type="range"]',
      output: '.output',
      sliderElem: '.rangeSlider',
    },
  },
  booking: {
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    tables: '.floor-plan .table',
    form: {
      phone: '[name="phone"]',
      address: '[name="address"]',
      submitButton: '[type="submit"]',
      starters: '[name="starter"]',
    },
  },
  home: {
    nav: {
      imageButtons: '.btn-image'
    },
    carouselWrapper: '.main-carousel',
  },
  nav: {
    links: '.main-nav a',
  },
  cart: {
    heightDiv: '.cart-height',
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formInputs: 'input',
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
  messageBox: {
    wrapper: '.message-box',
    text: '.error-text',
    closingButton: '.close-error'
  }
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
    scrollable: 'scrollable',
    error: 'error',
    processing: 'processing',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    selected: 'selected',
    error: 'error'
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  },
  error: {
    active: 'active',
    danger: 'danger',
  },
  confirmation: {
    active: 'active',
    success: 'success',
  },

};

export const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  cart: {
    defaultDeliveryFee: 20,
    phoneLengthMin: 9,
    addressLengthMin: 5,
  },
  db: {
    url: '//' + window.location.hostname + (window.location.hostname=='localhost' ? ':3131' : ''),
    products: 'products',
    orders: 'orders',
    events: 'events',
    bookings: 'bookings',
    gallery: 'gallery',
    dateStartParamKey: 'date_gte',
    dateEndParamKey: 'date_lte',
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false',
  },
  hours: {
    open: 12,
    close: 24,
    maxPercentage: 100,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  booking: {
    tableIdAttribute: 'data-table',
    numberOfTables: 3,
  },
};

export const delays = {
  messageMaxDisplay: 1500,
  sliderDelay: 200,
  cartAnimationDelay: 500,
  cartExpandTime: 250,
};

export const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
  homepage: Handlebars.compile(document.querySelector(select.templateOf.homepage).innerHTML),
};