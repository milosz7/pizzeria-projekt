import {select, templates, settings, classNames, delays} from '../settings.js';
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
    thisBooking.getData();
    thisBooking.initValidation();
  }

  getElements() {
    const thisBooking = this;
    thisBooking.dom = {
      peopleAmount: thisBooking.wrapper.querySelector(select.booking.peopleAmount),
      hoursAmount: thisBooking.wrapper.querySelector(select.booking.hoursAmount),
      datePicker: thisBooking.wrapper.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: thisBooking.wrapper.querySelector(select.widgets.hourPicker.wrapper),
      tables: thisBooking.wrapper.querySelectorAll(select.booking.tables),
      hourOutput: thisBooking.wrapper.querySelector(select.widgets.hourPicker.output),
      dataInput: thisBooking.wrapper.querySelector(select.widgets.datePicker.input),
      hourInput: thisBooking.wrapper.querySelector(select.widgets.hourPicker.input),
      phoneInput: thisBooking.wrapper.querySelector(select.booking.form.phone),
      addressInput: thisBooking.wrapper.querySelector(select.booking.form.address),
      buttonSubmit: thisBooking.wrapper.querySelector(select.booking.form.submitButton),
      starters: thisBooking.wrapper.querySelectorAll(select.booking.form.starters),
    };
  }

  getData() {
    const thisBooking = this;

    const startDate = `${settings.db.dateStartParamKey}=${utils.dateToStr(thisBooking.datePickerWidget.minDate)}`;
    const endDate = `${settings.db.dateEndParamKey}=${utils.dateToStr(utils.addDays(thisBooking.datePickerWidget.minDate, settings.datePicker.maxDaysInFuture))}`;

    const linkPartials = {
      bookings: [
        startDate, endDate
      ],
      eventsCurrent: [
        `${settings.db.notRepeatParam}`, startDate, endDate
      ],
      eventsRepeat: [
        `${settings.db.repeatParam}`, endDate
      ],
    };

    const urls = {
      bookings: `${settings.db.url}/${settings.db.bookings}?${linkPartials.bookings.join('&')}`,
      eventsCurrent: `${settings.db.url}/${settings.db.events}?${linkPartials.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${settings.db.events}?${linkPartials.eventsRepeat.join('&')}`,
    };

    thisBooking.data = {};

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(rawResponses => {
        for (let response of rawResponses) {
          if (!response.ok) {
            throw new Error(`${response.statusText} (${response.status})`);
          }
        }
        const bookingsRaw = rawResponses[0];
        const eventsCurrentRaw = rawResponses[1];
        const eventsRepeatRaw = rawResponses[2];
        return Promise.all([
          bookingsRaw.json(),
          eventsCurrentRaw.json(),
          eventsRepeatRaw.json()
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      })
      .catch(function(error) {
        utils.displayError(error);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let data of bookings) {
      thisBooking.prepareBooked(data.date, data.hour, data.duration, data.table);
    }
    for (let data of eventsCurrent) {
      thisBooking.prepareBooked(data.date, data.hour, data.duration, data.table);
    }
    for (let data of eventsRepeat) {
      if (data.repeat === 'daily') {
        const minDate = thisBooking.datePickerWidget.minDate;
        const maxDate = thisBooking.datePickerWidget.maxDate;
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          const dataDate = utils.dateToStr(loopDate);
          thisBooking.prepareBooked(dataDate, data.hour, data.duration, data.table);
        }
      }
      
    }
    thisBooking.updateDOM();
  }

  prepareBooked(date, hour, duration, table) {
    const thisBooking = this;
    const reservationStart = utils.hourToNumber(hour);
    const reservationEnd = reservationStart + duration;
    const bookedPeriods = (reservationEnd - reservationStart) / 0.5;
    if (!thisBooking.booked.hasOwnProperty([date])) {
      thisBooking.booked[date] = {};
      for (let i = 0; i < bookedPeriods; i++) {
        const hourToCheck = reservationStart + 0.5 * i;
        const tableID = [table];
        utils.createPropIfUndefined(thisBooking.booked[date], hourToCheck, tableID);
      }
    } else {
      for (let i = 0; i < bookedPeriods; i++) {
        const hourToCheck = reservationStart + 0.5 * i;
        if (thisBooking.booked[date].hasOwnProperty(hourToCheck)) {
          const tableID = table;
          thisBooking.booked[date][hourToCheck].push(tableID);
        } else {
          const tableID = [table];
          utils.createPropIfUndefined(thisBooking.booked[date], hourToCheck, tableID);
        }
      }
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.tableBooked = false;
    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tableBooked);
      table.classList.remove(classNames.booking.selected);
    }
    const chosenDate = thisBooking.datePickerWidget.dom.input.value;
    thisBooking.updateSlider(chosenDate);
    const reservationStart = utils.hourToNumber(thisBooking.dom.hourOutput.innerHTML);
    const reservationEnd = reservationStart + parseInt(thisBooking.hoursAmountWidget.dom.input.value, 10);
    for (let table of thisBooking.dom.tables) {
      const tableID = parseInt(table.getAttribute(settings.booking.tableIdAttribute), 10);
      const reservationData = thisBooking.booked[chosenDate];
      for (let hours in reservationData) {
        if ((reservationData[hours]).includes(tableID) && parseFloat(hours) >= reservationStart && parseFloat(hours) < reservationEnd) {
          table.classList.add(classNames.booking.tableBooked);
        }
      }
    }
    if(reservationEnd > settings.hours.close || reservationEnd < settings.hours.open) {
      for (let table of thisBooking.dom.tables) {
        table.classList.add(classNames.booking.tableBooked);
      }
    }
  }

  updateSlider(date) {
    const thisBooking = this;
    const sliderElem = thisBooking.wrapper.querySelector(select.widgets.hourPicker.sliderElem);
    const hourRange = settings.hours.close - settings.hours.open;
    let sliderStyle = '';
    for (let i = settings.hours.open; i <= settings.hours.close; i += 0.5) {
      const hourToCheck = thisBooking.booked[date][i];
      const numberOfTables = settings.booking.numberOfTables;
      const rangeStart = Math.round((i - hourRange) / hourRange * 100);
      const rangeEnd = Math.round((i + 0.5 - hourRange) / hourRange * 100);
      if (hourToCheck && hourToCheck.length < numberOfTables - 1 || hourToCheck === undefined) {
        if (rangeEnd < settings.hours.maxPercentage) {
          sliderStyle += `green ${rangeStart}% ${rangeEnd}%, `;
        } else if (rangeEnd === settings.hours.maxPercentage) {
          sliderStyle += `green ${rangeStart}%`;
        }
      } else if (hourToCheck && hourToCheck.length < numberOfTables) {
        if (rangeEnd < settings.hours.maxPercentage) {
          sliderStyle += `yellow ${rangeStart}% ${rangeEnd}%, `;
        } else if (rangeEnd === settings.hours.maxPercentage) {
          sliderStyle += `yellow ${rangeStart}%`;
        }
      } else if (hourToCheck && hourToCheck.length === numberOfTables) {
        if (rangeEnd < settings.hours.maxPercentage) {
          sliderStyle += `red ${rangeStart}% ${rangeEnd}%, `;
        } else if (rangeEnd === settings.hours.maxPercentage) {
          sliderStyle += `red ${rangeStart}%`;
        }
      }
    }
    sliderElem.style.background = 'linear-gradient(90deg, ' + sliderStyle + ')';
  }

  chooseTable(tableElement) {
    const thisBooking = this;
    if (tableElement.classList.contains(classNames.booking.selected)) {
      tableElement.classList.toggle(classNames.booking.selected);
      thisBooking.selectedTable = false;
    } 
    else if (!tableElement.classList.contains(classNames.booking.tableBooked)) {
      for (let table of thisBooking.dom.tables) {
        table.classList.toggle(classNames.booking.selected, table === tableElement);
      }
      thisBooking.selectedTable = parseInt(tableElement.getAttribute(settings.booking.tableIdAttribute), 10);
    } else {
      utils.displayError('Table is unavailable.');
    }
    thisBooking.validateBooking();
  }

  validateBooking() {
    const thisBooking = this;
    thisBooking.dom.phoneInput.classList.toggle(classNames.booking.error, !thisBooking.dom.phoneInput.value.match(/^\d{9}$/));
    thisBooking.dom.addressInput.classList.toggle(classNames.booking.error, thisBooking.dom.addressInput.value.length < 5);
    if (!thisBooking.dom.phoneInput.value.match(/^\d{9}$/)  ||
       (thisBooking.selectedTable === false) || 
       (thisBooking.dom.addressInput.value.length < 5)) {
      thisBooking.dom.buttonSubmit.disabled = true;
    } else {
      thisBooking.dom.buttonSubmit.disabled = false;
    }
  }

  initValidation() {
    const thisBooking = this;
    thisBooking.dom.phoneInput.addEventListener('change', function() {
      thisBooking.validateBooking();
    });
    thisBooking.dom.addressInput.addEventListener('change', function() {
      thisBooking.validateBooking();
    });
    thisBooking.validateBooking();
  }

  sendBooking() {
    const thisBooking = this;
    const payload = {
      date: thisBooking.dom.dataInput.value,
      hour: thisBooking.dom.hourOutput.innerHTML,
      table: thisBooking.selectedTable,
      duration: parseInt(thisBooking.hoursAmountWidget.dom.input.value, 10),
      ppl: parseInt(thisBooking.peopleAmountWidget.dom.input.value, 10),
      starters: [],
      phone: thisBooking.dom.phoneInput.value,
      address: thisBooking.dom.addressInput.value,
    };
    
    for (let input of thisBooking.dom.starters) {
      if (input.checked) {
        payload.starters.push(input.value);
      }
    }

    const url = `${settings.db.url}/${settings.db.bookings}`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(utils.handleErrors)
      .then(function() {
        const bookingConfirmation = 'Table succesfully booked!';
        utils.displaySuccess(bookingConfirmation);
        thisBooking.getData();
      })
      .catch(function(error) {
        utils.displayError(error);
      }); 
  }

  renderPage() {
    const thisBooking = this;
    const bookingHTML = templates.bookingWidget(thisBooking);
    const bookingDOM = utils.createDOMFromHTML(bookingHTML);
    thisBooking.wrapper.appendChild(bookingDOM);
    thisBooking.wrapper.addEventListener('click', function(e) {
      if (e.target.closest(select.booking.tables)) {
        e.preventDefault();
        thisBooking.chooseTable(e.target.closest(select.booking.tables));
      }
    });
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.wrapper.addEventListener('update', function() {
      setTimeout(function() {
        thisBooking.updateDOM();
        thisBooking.validateBooking();
      }, delays.sliderDelay);
    });
    thisBooking.dom.buttonSubmit.addEventListener('click', function(e) {
      e.preventDefault();
      thisBooking.sendBooking();
    });
  }
}

export default Booking;