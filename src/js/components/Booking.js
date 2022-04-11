import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.wrapper = element;
    thisBooking.renderPage();
    thisBooking.getElements();
    thisBooking.initWidgets();
  }

  getElements() {
    const thisBooking = this;
    thisBooking.dom = {
      peopleAmount: thisBooking.wrapper.querySelector(select.booking.peopleAmount),
      hoursAmount: thisBooking.wrapper.querySelector(select.booking.hoursAmount),
    };
  }

  renderPage() {
    const thisBooking = this;
    const bookingHTML = templates.bookingWidget(thisBooking);
    const bookingDOM = utils.createDOMFromHTML(bookingHTML);
    thisBooking.wrapper.appendChild(bookingDOM);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;