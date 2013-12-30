(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
slide = require('./slide-controller')

module.exports = function kreator () {

	// Full list of configuration options available here:
	// https://github.com/hakimel/reveal.js#configuration
	Reveal.initialize({
		controls: true,
		progress: true,
		history: true,
		center: true,

		theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
		transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

		// Parallax scrolling
		// parallaxBackgroundImage: 'https://s3.amazonaws.com/hakim-static/reveal-js/reveal-parallax-1.jpg',
		// parallaxBackgroundSize: '2100px 900px',

		// Optional libraries used to extend on reveal.js
		dependencies: [
			{ src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
			{ src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
			{ src: 'plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
			{ src: 'plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
		]
	});

	slide.addListeners()

}
},{"./slide-controller":3}],2:[function(require,module,exports){
var kreator = require('./kreator.js')

kreator()
},{"./kreator.js":1}],3:[function(require,module,exports){
var addListeners = function () {
	// js-handler--add-slide-down
	// js-handler--add-slide-right
	var slideDown = document.querySelector('.js-handler--add-slide-down')
	var slideRight = document.querySelector('.js-handler--add-slide-right')

	slideDown.addEventListener('click', addSlideDown, 'false')
	slideRight.addEventListener('click', addSlideRight, 'false')
}

function addSlideDown () {
	console.log('addSlideDown')
}

function addSlideRight () {
	console.log('addSlideRight')
}

module.exports = {
	addListeners: addListeners
}
},{}]},{},[2])