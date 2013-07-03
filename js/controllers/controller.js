/*global define */

define( [ './router', './Slide' ], function ( router, Slide ) {
	
	'use strict';

	var createNewSlide, LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW, loadImages;

	LEFT_ARROW = 37;
	UP_ARROW = 38;
	RIGHT_ARROW = 39;
	DOWN_ARROW = 40;

	loadImages = function ( images ) {
		var i = images.length;
		while ( i-- ) {
			new Image().src = images[i];
		}
	};
	
	createNewSlide = function ( app, slideData, slideNum, backOne ) {
		var slide, data;

		data = slideData[ slideNum ];

		if ( data ) {
			slide = new Slide( data, app.el );
			slide.enter( backOne );

			app.currentSlide = slide;

			// load images up front
			if ( data.images ) {
				loadImages( data.images );
			}
		}

		// preload images for next slide
		if ( slideData[ slideNum + 1 ] && slideData[ slideNum + 1 ].images ) {
			loadImages( slideData[ slideNum + 1 ].images );
		}
	};

	return function ( app ) {

		var slideData, keydownHandler, prevSlide, nextSlide;

		slideData = app.data.slides;

		app.state.observe( 'slideNum', function ( slideNum, prev ) {
			var backOne = ( prev - slideNum === 1 );

			if ( app.currentSlide ) {
				app.currentSlide.exit().then( function () {
					createNewSlide( app, slideData, slideNum, backOne );
				});
			} else {
				createNewSlide( app, slideData, slideNum, backOne );
			}
		});

		nextSlide = function () {
			var slideNum = app.state.get( 'slideNum' );

			if ( slideData[ slideNum + 1 ] ) {
				app.state.add( 'slideNum' );
			}
		};

		prevSlide = function () {
			var slideNum = app.state.get( 'slideNum' );

			if ( slideData[ slideNum - 1 ] ) {
				app.state.subtract( 'slideNum' );
			}
		};


		// handle arrow key events
		keydownHandler = function ( event ) {
			if ( event.which === DOWN_ARROW || event.which === RIGHT_ARROW ) {
				event.preventDefault();
				app.currentSlide.next() || nextSlide();
			}

			else if ( event.which === UP_ARROW || event.which === LEFT_ARROW ) {
				event.preventDefault();
				app.currentSlide.prev() || prevSlide();
			}
		}
		window.addEventListener( 'keydown', keydownHandler );

		router( app );
	};

});