class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
    }
    thisWidget.announce(); 
    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) {
    return parseInt(value, 10);
  }

  isValid (value) {
    return !isNaN(value); 
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    const evt = new CustomEvent('update', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(evt);
  }
}

export default BaseWidget;