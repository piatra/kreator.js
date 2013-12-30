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