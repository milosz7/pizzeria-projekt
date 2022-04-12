import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.value = thisWidget.correctValue;
    thisWidget.initWidgetControls();
  }

  getElements() {
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
  }

  initWidgetControls() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function() {
      thisWidget.setValue(thisWidget.value + 1);
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function() {
      thisWidget.setValue(thisWidget.value - 1);
    });
  }

  isValid (value) {
    const minValue = settings.amountWidget.defaultMin;
    const maxValue = settings.amountWidget.defaultMax;
    return minValue <= value && value <= maxValue && !isNaN(value); 
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
}

export default AmountWidget;