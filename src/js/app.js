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

		controller( app );
	});


	window.app = app; // useful for debugging!

	return app;

});