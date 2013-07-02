var state, geometry, centroids, deferreds;

deferreds = {
	geometry: $.ajax( 'geometry.json' ).done( function ( data ) {
		geometry = data;
	}),
	centroids: $.ajax( 'centroids.json' ).done( function ( data ) {
		centroids = data;
	}),
	dom: new $.Deferred()
};

$( deferreds.dom.resolve );


// draw countries
deferreds.countriesDrawn = new $.Deferred();

$.when( deferreds.geometry, deferreds.centroids, deferreds.dom ).done( function () {
	var geometryGroup, id;


	// see which centroids need setting, and which need removing
	for ( id in centroids ) {
		if ( !geometry[ id ] ) {
			delete centroids[ id ];
		}
	}

	for ( id in geometry ) {
		if ( !centroids[ id ] ) {
			console.log( 'Geometry but no centroid for %s', id );
		}
	}

	geometryGroup = document.getElementById( 'geometry' );

	for ( id in geometry ) {
		svg.create( 'path', {
			d: geometry[ id ],
			'data-id': id,
			'class': ( !centroids[ id ] ? 'missing-centroid' : '' )
		}, geometryGroup );
	}

	deferreds.countriesDrawn.resolve();
});



$.when( deferreds.countriesDrawn ).done( function () {

	var svg, geometryGroup, circle, orderedIds, index, key, countries, countryById, i, country, id, simplify;

	simplify = function ( centroids ) {
		var simplified, centroid, id;

		simplified = {};

		for ( id in centroids ) {
			centroid = centroids[ id ];

			simplified[ id ] = {
				x: +( centroid.x ).toFixed( 1 ),
				y: +( centroid.y ).toFixed( 1 )
			};
		}

		return simplified;
	};


	state = new Statesman({ centroids: centroids });

	state.compute( 'centroid', {
		triggers: [ 'id', 'centroids' ],
		fn: function ( id, centroids ) {
			if ( id ) {
				return centroids[ id ];
			}

			return null;
		}
	});

	svg = document.querySelector( 'svg' );
	geometryGroup = document.getElementById( 'geometry' );
	circle = document.getElementById( 'centroid' );

	countries = document.querySelectorAll( 'path' );
	countryById = {};
	i = countries.length;

	while ( i-- ) {
		country = countries[i];
		id = country.getAttribute( 'data-id' );

		countryById[ id ] = countries[i];

		if ( !centroids[ id ] ) {
			bBox = country.getBBox();

			centroids[ id ] = {
				x: bBox.x + ( bBox.width / 2 ),
				y: bBox.y + ( bBox.height / 2 )
			};
		}
	}



	orderedIds = [];
	for ( key in centroids ) {
		orderedIds[ orderedIds.length ] = key;
	}
	index = 0;


	svg.addEventListener( 'click', function ( event ) {
		var target, id;

		target = event.target;
		id = target.getAttribute( 'data-id' );

		state.set( 'id', id );
	});

	state.observe( 'id', function ( id, oldId ) {
		if ( oldId ) {
			countryById[ oldId ].classList.remove( 'selected' );
		}

		if ( id ) {
			index = orderedIds.indexOf( id );
			countryById[ id ].classList.add( 'selected' );
			countryById[ id ].classList.remove( 'missing-centroid' );

			countryById[ id ].parentNode.appendChild( countryById[ id] );
		}
	});

	state.observe( 'centroid', function ( centroid ) {
		if ( !centroid ) {
			console.warn( 'No centroid for %s', state.get( 'id' ) );

			circle.style.display = 'none';
		}

		else {
			circle.style.display = 'block';

			circle.setAttribute( 'cx', centroid.x );
			circle.setAttribute( 'cy', centroid.y );
		}
	});


	window.addEventListener( 'keydown', function ( event ) {
		var d, id, centroid;

		if ( event.which === 32 ) {
			event.preventDefault();
			console.log( JSON.stringify( simplify( state.get( 'centroids' ) ) ) );
			return;
		}

		id = state.get( 'id' );

		if ( !id ) {
			return;
		}

		centroid = state.get( 'centroids' )[ id ];

		if ( !centroid ) {
			console.log( 'No centroid for ' + id );
			return;
		}

		d = ( event.shiftKey ? 10 : 1 );

		switch ( event.which ) {
			case 78:
				event.preventDefault();

				if ( event.shift ) {
					index = ( index ? index - 1 : orderedIds.length - 1 );
				} else {
					index = ( index < orderedIds.length - 1 ) ? index + 1 : 0;
				}

				state.set( 'id', orderedIds[ index ] );
				break;

			case 39:
				event.preventDefault();
				centroid.x += d;
				break;

			case 37:
				event.preventDefault();
				centroid.x -= d;
				break;

			case 38:
				event.preventDefault();
				centroid.y -= d;
				break;

			case 40:
				event.preventDefault();
				centroid.y += d;
				break;
		}

		state.set( 'centroids.' + id, centroid );
	});

	circle.setAttribute( 'cy', -1000 );

});