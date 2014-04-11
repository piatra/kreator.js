module.exports = function () {

    var tourHandler = document.querySelector('.js-handler--restart-tour');

    tourHandler.addEventListener('click', restartTour, false);

    var tour = new Shepherd.Tour({
        defaults: {
            classes: 'shepherd-theme-arrows',
            scrollTo: false
        }
    });

    tour.addStep('intro', {
        text: 'This is a guided introduction to Kreator.js <br> It will show you how to control and style the content <br> You can cancel if you know what to do or click start <br>',
        buttons: [
            {
                text: 'Cancel',
                action: finishTour
            },
            {
                text: 'Start',
                action: tour.next
            }
        ]
    })

    tour.addStep('example-step', {
        text: 'This is the main control for the content',
        attachTo: '.topmenu',
        buttons: [{
            text: 'Next',
            action: tour.next
        }],
        tetherOptions: {
            attachment: 'bottom center',
            targetAttachment: 'top center'
        }
    });

    tour.addStep('example-step', {
        text: 'Set the text to bold, italic or underlined',
        attachTo: '.js-handler--style-button',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Make a bullet list',
        attachTo: '.js-handler--list-button',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Align left, center or right  ',
        attachTo: '.js-handler--align',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Align left, center or right',
        attachTo: '.js-handler--align',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Set the text color',
        attachTo: '.js-handler--color',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Add slide',
        attachTo: '.js-handler--add-slide-right',
        tetherOptions: {
            attachment: 'top left',
            targetAttachment: 'top right'
        }
    });

    tour.addStep('example-step', {
        text: 'Presentation name',
        attachTo: '.js-handler--presentation-name',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Change the theme',
        attachTo: '.js-handler--theme-selector',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Download when you are all done',
        attachTo: '.js-handler--download',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'That is all. I hope you make a great presentation!',
        buttons: [{
            'text': 'Start writing',
            action: finishTour
        }]
    });

    if (!localStorage.getItem('tour')) tour.start();

    function finishTour() {
        localStorage.setItem('tour', 'complete');
        tour.hide();
    }

    function restartTour() {
        tour.start();
    }
}
