seconds = document.querySelector('.time--seconds');
minutes = document.querySelector('.time--minutes');
setInterval(function() {
    var t = parseInt(seconds.innerHTML, 10);
    var m = parseInt(minutes.innerHTML, 10);
    t++;
    if (t >= 60) {
    	m++;
    	minutes.innerHTML = digitPadding(m);
    	t = 0;
    }
    seconds.innerHTML = digitPadding(t);
}, 1000);

function digitPadding(n) {
	return n < 10 ? '0' + n : n;
}