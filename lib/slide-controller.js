/* globals module, document, Reveal */

var addListeners = function (addDown, addRight) {
	addDown.addEventListener('click', slidesController.addSlideDown, 'false');
	addRight.addEventListener('click', slidesController.addSlideRight, 'false');
};

module.exports = {
	addListeners: addListeners
};

var slidesController = {
  slidesParent: document.querySelector('.slides'),
  addSlideDown: function() {
    // to add a slide down we must add a section
    // inside the current slide.
    // We select it and the section inside
    var currentSlide = slidesController.presentSlide();
    var children = currentSlide.querySelector('section');
    if (!children) {
      var parentSlide = slidesController.newSection();
      var slide1 = slidesController.newSlide('', true);
      var slide2 = slidesController.newSlide();
      console.log(slide1.innerHTML);
      console.log(slide2.innerHTML);
      parentSlide.appendChild(slide1);
      parentSlide.appendChild(slide2);
      currentSlide.parentNode.replaceChild(parentSlide, currentSlide);
      Reveal.toggleOverview(); // FIXME
      Reveal.toggleOverview();
      Reveal.down();
    } else {
      var slide = slidesController.newSlide();
      currentSlide.appendChild(slide);
      Reveal.toggleOverview();
      Reveal.toggleOverview();
      Reveal.down();
    }
  },
  addSlideRight: function() {
    var slide = slidesController.newSlide();
    slidesController.slidesParent.appendChild(slide);
    Reveal.right();
  },
  presentSlide: function() {
    return document.querySelector('.present');
  },
  newSlide: function(content, clone) { // the new slide is a clone of the current one
    var slide = document.querySelector('.present').cloneNode(true);
    if (clone) {
      return slide;
    } else {
      var content = slide.querySelector('.kreator-slide-content');
      content.innerHTML = '';
      return slide;
    }
  },
  newSection: function(content) {
    var slide = document.createElement('section');
    slide.innerHTML = content || '';
    return slide;
  }
};
