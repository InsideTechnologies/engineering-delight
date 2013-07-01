function () {

	var ufos = [
		{ state_id: "IA", count: 491,  state_name: "Iowa" },
		{ state_id: "WI", count: 909,  state_name: "Wisconsin" },
		{ state_id: "WA", count: 3348, state_name: "Washington" },
		{ state_id: "MO", count: 1203, state_name: "Missouri" },
		{ state_id: "ND", count: 114,  state_name: "North Dakota" },
		{ state_id: "NV", count: 714,  state_name: "Nevada" },
		{ state_id: "IL", count: 2064, state_name: "Illinois" },
		{ state_id: "MA", count: 909,  state_name: "Massachusetts" },
		{ state_id: "GA", count: 989,  state_name: "Georgia" },
		{ state_id: "FL", count: 2839, state_name: "Florida" },
		{ state_id: "VA", count: 919,  state_name: "Virginia" },
		{ state_id: "NY", count: 2413, state_name: "New York" },
		{ state_id: "MT", count: 348,  state_name: "Montana" },
		{ state_id: "ME", count: 412,  state_name: "Maine" },
		{ state_id: "CA", count: 7595, state_name: "California" },
		{ state_id: "NJ", count: 1128, state_name: "New Jersey" },
		{ state_id: "OR", count: 1413, state_name: "Oregon" },
		{ state_id: "CT", count: 614,  state_name: "Connecticut" },
		{ state_id: "AZ", count: 2098, state_name: "Arizona" },
		{ state_id: "AK", count: 234,  state_name: "Alaska" },
		{ state_id: "MI", count: 1554, state_name: "Michigan" },
		{ state_id: "ID", count: 362,  state_name: "Idaho" },
		{ state_id: "TN", count: 875,  state_name: "Tennessee" },
		{ state_id: "AL", count: 498,  state_name: "Alabama" },
		{ state_id: "OH", count: 1684, state_name: "Ohio" },
		{ state_id: "IN", count: 1052, state_name: "Indiana" },
		{ state_id: "SD", count: 142,  state_name: "South Dakota" },
		{ state_id: "KS", count: 507,  state_name: "Kansas" },
		{ state_id: "NH", count: 353,  state_name: "New Hampshire" },
		{ state_id: "TX", count: 3012, state_name: "Texas" },
		{ state_id: "NC", count: 1220, state_name: "North Carolina" },
		{ state_id: "SC", count: 586,  state_name: "South Carolina" },
		{ state_id: "PA", count: 1800, state_name: "Pennsylvania" },
		{ state_id: "LA", count: 455,  state_name: "Louisiana" },
		{ state_id: "RI", count: 197,  state_name: "Rhode Island" },
		{ state_id: "UT", count: 475,  state_name: "Utah" },
		{ state_id: "CO", count: 1169, state_name: "Colorado" },
		{ state_id: "KY", count: 687,  state_name: "Kentucky" },
		{ state_id: "VT", count: 172,  state_name: "Vermont" },
		{ state_id: "HI", count: 240,  state_name: "Hawaii" },
		{ state_id: "NM", count: 637,  state_name: "New Mexico" },
		{ state_id: "AR", count: 530,  state_name: "Arkansas" },
		{ state_id: "MN", count: 753,  state_name: "Minnesota" },
		{ state_id: "WV", count: 345,  state_name: "West Virginia" },
		{ state_id: "MS", count: 321,  state_name: "Mississippi" },
		{ state_id: "OK", count: 557,  state_name: "Oklahoma" },
		{ state_id: "WY", count: 167,  state_name: "Wyoming" },
		{ state_id: "MD", count: 611,  state_name: "Maryland" },
		{ state_id: "NE", count: 324,  state_name: "Nebraska" },
		{ state_id: "DE", count: 126,  state_name: "Delaware" },
		{ state_id: "DC", count: 93,   state_name: "District of Columbia" }
	];

	ufos.forEach( function ( record, i ) {
		record.pos = record.i = i;
	})

	ufos.sort( function ( a, b ) {
		return b.count - a.count;
	});

	var sorted = ufos.map( function ( record, i ) {
		var newRecord = {
			state_name: record.state_name,
			state_id: record.state_id,
			count: record.count,
			i: record.i,
			pos: i
		};

		return newRecord;
	});

	var linearScale = function ( domain, range ) {
		var d0 = domain[0], r0 = range[0], multiplier = ( range[1] - r0 ) / ( domain[1] - d0 );

		return function ( num ) {
			return r0 + ( multiplier * ( num - d0 ) );
		};
	};

	var getGridLines = function ( num, min, max ) {
		var array = [], i, scale = linearScale([ 0, num - 1 ], [ min, max ]);

		i = num;
		while ( i-- ) {
			array[i] = scale( i );
		}

		return array;
	};

	var width, height, marginX, marginY, x1, x2, y1, y2, minCount, maxCount, xScale, yScale, gridLines;

	width = 1600;
	height = 800;
	marginX = [ 70,  0 ];
	marginY = [ 30, 50 ];

	x1 = marginX[0];
	x2 = width - marginX[1];
	y1 = marginY[0];
	y2 = height - marginY[1];

	minCount = 93;
	maxCount = 7595;

	xScale = linearScale([ 0, ufos.length ], [ x1, x2 ]);
	yScale = linearScale([ minCount, maxCount ], [ y1, y2 ]);

	gridLines = getGridLines( 9, minCount, maxCount );

	return [

		// stage 0 - show crap chart
		function () {
			return {
				do: function ( ractive ) {
					ractive.set({
						x1: x1,
						x2: x2,
						y1: y1,
						y2: y2,
						width: width,
						height: height,
						xScale: xScale,
						yScale: yScale,
						minValue: minCount,
						maxValue: maxCount,
						ufos: ufos,
						gridLines: gridLines,
						barMargin: 0,
						threshold: 8000,

						r: 0,
						g: 0,
						b: 0,

						badLabels: true
					});
				}
			}
		},

		// stage 1 - fix labels
		null,

		// stage 2 - sane grid lines and minimum/maximum
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate({
						minValue: 0,
						maxValue: 8000,
						gridLines: getGridLines( 9, 0, 8000 )
					}, {
						duration: 1000,
						easing: 'easeOut'
					});
				},
				redo: function ( ractive ) {
					ractive.set({
						minValue: 0,
						maxValue: 8000,
						gridLines: getGridLines( 9, 0, 8000 )
					});
				},
				undo: function ( ractive ) {
					ractive.animate({
						minValue: minCount,
						maxValue: maxCount,
						gridLines: gridLines
					}, {
						duration: 1000,
						easing: 'easeOut'
					});
				}
			}
		},

		// stage 3 - sort data
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate({
						ufos: sorted
					}, {
						duration: 1000,
						easing: 'easeOut'
					});
				},
				redo: function ( ractive ) {
					ractive.set( 'ufos', sorted );
				},
				undo: function ( ractive ) {
					ractive.animate({
						ufos: ufos
					}, {
						duration: 400,
						easing: 'easeOut'
					});
				}
			};
		},

		// stage 4 - add bar margins
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate( 'barMargin', 0.1 );
				},
				redo: function ( ractive ) {
					ractive.set( 'barMargin', 0.1 );
				},
				undo: function ( ractive ) {
					ractive.animate( 'barMargin', 0 );
				}
			}
		},

		// stage 5 - make it green
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate({
						r: 125,
						g: 162,
						b: 0
					});
				},
				redo: function ( ractive ) {
					ractive.set({
						r: 125,
						g: 162,
						b: 0
					});
				},
				undo: function ( ractive ) {
					ractive.animate({
						r: 0,
						g: 0,
						b: 0
					});
				}
			}
		},

		// stage 6 - replace grid lines with bar labels
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate( 'maxValue', maxCount );
				},
				redo: function ( ractive ) {
					ractive.set( 'maxValue', maxCount );
				},
				undo: function ( ractive ) {
					ractive.animate( 'maxValue', 8000 );
				}
			}
		},

		// stage 7 - rotate labels, place inside bars
		null,

		// stage 8 - place some labels outside bars
		function () {
			return {
				do: function ( ractive ) {
					ractive.set( 'threshold', 5000 );
				},
				undo: function ( ractive ) {
					ractive.set( 'threshold', 8000 );
				}
			}
		},

		null,

		null
	];
}