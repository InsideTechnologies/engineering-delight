function () {

	var home, targets, newTargets, thickTargets, viewBox;

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

	thickTargets = {
		'targets.0.w': 3,
		'targets.1.w': 7,
		'targets.2.w': 1,
		'targets.3.w': 6,
		'targets.4.w': 9
	};

	return [

		function () {
			return {
				do: function ( ractive ) {
					viewBox = window.viewBox = new ViewBox( ractive.nodes.svg );

					ractive.set({
						home: home,
						targets: targets,
						outward: true
					});

					ractive.on( 'drag', function ( event ) {
						var move, cancel, keypath;

						keypath = event.keypath || 'home';

						console.log( 'keypath', keypath );

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
				}
			}
		},

		// stage 1 - show crap chart
		function () {
			return {
				do: function ( ractive ) {
					targets.push.apply( targets, newTargets );
				}
			}
		},

		// stage 1 - show crap chart
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate( thickTargets );
				}
			}
		}
	];
}