import {select, templates} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(wrapper, images) {
    const thisHome = this;
    thisHome.wrapper = wrapper;
    thisHome.images = images;
    thisHome.render();
    thisHome.getElements();
    thisHome.animateButtons();
    thisHome.initActions();
    thisHome.initCarousel();
  }

  render() {
    const thisHome = this;
    const homeHTML = templates.homepage(thisHome.images);
    const homeDOM = utils.createDOMFromHTML(homeHTML);
    thisHome.wrapper.appendChild(homeDOM);
  }

  getElements() {
    const thisHome = this;
    thisHome.dom = {
      imageButtons: thisHome.wrapper.querySelectorAll(select.home.nav.imageButtons),
      carouselWrapper: thisHome.wrapper.querySelector(select.home.carouselWrapper),
    };
  }

  initActions() {
    const thisHome = this;
    for (let button of thisHome.dom.imageButtons) {
      button.addEventListener('click', function() {
        const pageID = button.getAttribute('pageID');
        thisHome.changePages(pageID);
      });
    }
  }

  initCarousel() {
    const thisHome = this;
    // eslint-disable-next-line no-undef
    thisHome.carouselWidget = new Flickity(thisHome.dom.carouselWrapper, {
      wrapAround: true,
      autoPlay: true,
      pauseAutoPlayOnHover: false,
      prevNextButtons: false,
    });
  }

  changePages(pageID) {
    const thisHome = this;
    const evt = new CustomEvent('changePage', {
      bubbles: true,
      detail: {
        pageToDisplay: pageID,
      },
    });
    thisHome.wrapper.dispatchEvent(evt);
  }

  animateButtons() {
    const thisHome = this;
    for (let button of thisHome.dom.imageButtons) {
      button.addEventListener('mouseover', function() {
        button.firstElementChild.classList.add('animate');
        button.firstElementChild.classList.remove('animate-out');
      });
    }
    for (let button of thisHome.dom.imageButtons) {
      button.addEventListener('mouseout', function() {
        button.firstElementChild.classList.remove('animate');
        button.firstElementChild.classList.add('animate-out');
      });
    }
  }
}

export default Home;