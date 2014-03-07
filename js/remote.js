(function(){
    'use strict';

    var peer = new Peer({key: 'im289css0byphkt9'});

    peer.on('open', function(id) {
        alert(id);
    });

    peer.on('connection', function(conn) {

        $('.js-handler--forward').addEventListener('click', function() {
            conn.send('right');
        }, false);

        $('.js-handler--back').addEventListener('click', function() {
            conn.send('left');
        }, false);

        conn.on('open', function() {
            // Receive messages
            conn.on('data', function(data) {
                $('#title').innerHTML = data.title,
                $('#slide').innerHTML = 'slide ' + data.slide;
            });

            // Send messages
            conn.send('Hello!');
        });
    });

    function $(sel) {
        return document.querySelector(sel);
    }
})();
