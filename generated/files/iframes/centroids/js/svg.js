/*global define, document */
/*jslint white: true */

( function ( global ) {
	
	'use strict';

	var svg, classNameCleaner;

	classNameCleaner = /\s+/g;

	svg = {
		ns: 'http://www.w3.org/2000/svg',

		create: function ( type, attrs, parent ) {
			var el, key;

			el = document.createElementNS( svg.ns, type );

			if ( attrs ) {
				for ( key in attrs ) {
					if ( attrs.hasOwnProperty( key ) ) {
						el.setAttribute( key, attrs[ key ] );
					}
				}
			}

			if ( parent ) {
				parent.appendChild( el );
			}

			return el;
		},

		addClass: function ( el, className ) {
			var classString, classNames;

			if ( el.classList ) {
				el.classList.add( className );
			}

			classString = el.getAttribute( 'class' );

			if ( classString ) {
				classNames = classString.replace( classNameCleaner, ' ' ).split( ' ' );
			} else {
				el.setAttribute( 'class', className );
				return;
			}
			

			if ( classNames.indexOf( className ) === -1 ) {
				el.setAttribute( 'class', classNames.concat( className ).join( ' ' ) );
			}
		},

		removeClass: function ( el, className ) {
			var classString, classNames, index;

			if ( el.classList ) {
				el.classList.remove( className );
			}

			classString = el.getAttribute( 'class' );

			if ( !classString ) {
				return;
			}

			classNames = classString.replace( classNameCleaner, ' ' ).split( ' ' );

			index = classNames.indexOf( className );

			if ( index !== -1 ) {
				classNames.splice( index, 1 );
			}
			
			el.setAttribute( 'class', classNames.join( ' ' ) );
		}
	};

	global.svg = svg;

}( this ));