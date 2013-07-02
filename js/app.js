/*global define, window, document */

define([ 'domReady', 'Statesman', 'data', 'controllers/controller' ], function ( domReady, Statesman, data, controller ) {

	'use strict';
	
	var app;

	app = {
		data: data,
		state: new Statesman()
	};

	domReady( function () {
		app.el = document.getElementById( 'container' );

		if ( /chrome/i.test( navigator.userAgent ) ) {
			controller( app );
		} else {
			app.el.innerHTML = "<p class='browser-warning'>This presentation requires browser features that only currently exist in <a href='http://google.com/chrome'>Chrome</a>. Sorry.</p>";
		}
	});


	window.app = app; // useful for debugging!

	return app;

});