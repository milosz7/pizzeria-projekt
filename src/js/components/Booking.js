import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
      datePicker: thisBooking.wrapper.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: thisBooking.wrapper.querySelector(select.widgets.hourPicker.wrapper),
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
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;