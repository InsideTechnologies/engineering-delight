function () {

	var home, targets, newTargets, thinTargets, thickTargets, viewBox;

	home = {
		x: 450,
		y: 300
	};

	targets = [
		{ id: 'B', x: 700, y: 100, w: 2, prime: true }
	];

	newTargets = [
		{ id: 'C', x: 100, y: 150, w: 2 },
		{ id: 'D', x: 400, y: 400, w: 2 },
		{ id: 'E', x: 800, y: 350, w: 2 },
		{ id: 'F', x: 200, y: 250, w: 2 }
	];

	thinTargets = {
		'targets.0.w': 2,
		'targets.1.w': 2,
		'targets.2.w': 2,
		'targets.3.w': 2,
		'targets.4.w': 2
	};

	thickTargets = {
		'targets.0.w': 3.5,
		'targets.1.w': 7,
		'targets.2.w': 1,
		'targets.3.w': 6,
		'targets.4.w': 9
	};

	return [

		// stage 0 - setup
		function () {
			return {
				do: function ( ractive ) {
					viewBox = new ViewBox( ractive.nodes.svg );

					ractive.set({
						home: home,
						targets: targets,
						outward: true,
						m: 0,
						showHints: true
					});

					ractive.on( 'drag', function ( event ) {
						var move, cancel, keypath;

						keypath = event.keypath || 'home';

						move = function ( event ) {
							var svgCoords = viewBox.getCoordsFromClient( event.clientX, event.clientY );

							ractive.set( keypath + '.x', svgCoords.x );
							ractive.set( keypath + '.y', svgCoords.y );
						};

						cancel = function () {
							window.removeEventListener( 'mousemove', move );
							window.removeEventListener( 'mouseup', cancel );
						}

						window.addEventListener( 'mousemove', move );
						window.addEventListener( 'mouseup', cancel );
					});
				},
				undo: function () {
					// noop
				}
			}
		},

		// stage 1 - show additional targets
		function () {
			return {
				do: function ( ractive ) {
					targets.push.apply( targets, newTargets );
				},
				undo: function ( ractive ) {
					targets.splice( 1 );
				}
			}
		},

		// stage 2 - show variable width lines
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate( thickTargets );
				},
				redo: function ( ractive ) {
					ractive.set( thickTargets );
				},
				undo: function ( ractive ) {
					ractive.animate( thinTargets );
				}
			}
		},

		// stage 3 - show Watkins quote
		null,

		// stage 4 - show curves
		null,

		// stage 5 - show arrowheads
		null,

		// stage 6 - show moved arrowheads
		null,

		// stage 7 - show moved arrowheads with hidden target circles
		null,

		// stage 8 - show inward arrowheads
		null
	];
}