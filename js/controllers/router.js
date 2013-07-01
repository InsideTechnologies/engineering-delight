/*global define, window */

define( [], function () {
	
	'use strict';

	var hashPattern = /#\/([0-9]+)/;

	return function ( app ) {

		var route;

		app.state.set( 'slideNum', 0 );

		route = function () {
			var match;

			if ( match = hashPattern.exec( window.location.hash ) ) {
				app.state.set( 'slideNum', +( match[1] ) );
			}
		};

		window.addEventListener( 'hashchange', route );

		// initialise
		route();

		app.state.observe( 'slideNum', function ( slideNum ) {
			if ( !isNaN( slideNum ) ) {
				window.location.hash = '/' + slideNum;
			}
		});
	};

});