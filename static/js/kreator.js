slide = require('./slide-controller');
menu = require('./menu-controller');

module.exports = function kreator () {

	// Full list of configuration options available here:
	// https://github.com/hakimel/reveal.js#configuration
	Reveal.initialize({
    controls: true,
		progress: true,
		history: true,
    center: false,

		theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
		transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

		// Optional libraries used to extend on reveal.js
		dependencies: [
			{ src: 'js/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'js/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'js/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
			{ src: 'js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
			{ src: 'js/notes.js', async: true, condition: function() { return !!document.body.classList; } }
		]
	});

	slide.addListeners(document.querySelector('.js-handler--add-slide-down'),
                    document.querySelector('.js-handler--add-slide-right'));

  menu.addListeners({
    upload: document.querySelector('.js-handler--upload'),
    heading: document.querySelector('.js-handler--headings'),
    color: document.querySelector('.js-handler--color'),
    styleButtons: document.querySelectorAll('.js-handler--style-button'),
    alignment: document.querySelector('.js-handler--alignment')
  });

};
