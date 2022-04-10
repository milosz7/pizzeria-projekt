import {settings, select} from '../settings.js';

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

export default AmountWidget;