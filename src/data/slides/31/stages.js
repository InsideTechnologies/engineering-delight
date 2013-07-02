function () {

	var viewBox, state, Statesman;

	Statesman = require( 'Statesman' );

	state = new Statesman({
		A: { x: 300, y: 400 },
		B: { x: 700, y: 400 },
		Q: { x: 500, y: 100 },

		exaggeration: 50,

		t: 0
	});

	state.compute({
		'tAQ.x': '${A.x} + ( ${t} * ( ${Q.x} - ${A.x} ) )',
		'tAQ.y': '${A.y} + ( ${t} * ( ${Q.y} - ${A.y} ) )',

		'tQB.x': '${Q.x} + ( ${t} * ( ${B.x} - ${Q.x} ) )',
		'tQB.y': '${Q.y} + ( ${t} * ( ${B.y} - ${Q.y} ) )',

		'Z.x'  : '${tAQ.x} + ( ${t} * ( ${tQB.x} - ${tAQ.x} ) )',
		'Z.y'  : '${tAQ.y} + ( ${t} * ( ${tQB.y} - ${tAQ.y} ) )',

		direction: {
			dependsOn: [ 'tAQ', 'tQB' ],
			get: function ( tAQ, tQB ) {
				var dx, dy, magnitude, x, y;

				dx = tQB.x - tAQ.x;
				dy = tQB.y - tAQ.y;

				magnitude = Math.sqrt( ( dx * dx ) + ( dy * dy ) );

				x = dx / magnitude;
				y = dy / magnitude;

				return {
					x: x,
					y: y
				};
			}
		},

		'normal.x': '-${direction.y}',
		'normal.y': ' ${direction.x}',

		'arrowhead.center.x': '${Z.x} - ( ${arrowhead.size} * ${direction.x} )',
		'arrowhead.center.y': '${Z.y} - ( ${arrowhead.size} * ${direction.y} )',

		'arrowhead.po.x': '${arrowhead.center.x} + ( ${arrowhead.size} * -${normal.x} )',
		'arrowhead.po.y': '${arrowhead.center.y} + ( ${arrowhead.size} * -${normal.y} )',
		'arrowhead.so.x': '${arrowhead.center.x} + ( ${arrowhead.size} * ${normal.x} )',
		'arrowhead.so.y': '${arrowhead.center.y} + ( ${arrowhead.size} * ${normal.y} )',

		'arrowhead.pi.x': '${arrowhead.center.x} + ( 0.5 * ${arrowhead.size} * -${normal.x} )',
		'arrowhead.pi.y': '${arrowhead.center.y} + ( 0.5 * ${arrowhead.size} * -${normal.y} )',
		'arrowhead.si.x': '${arrowhead.center.x} + ( 0.5 * ${arrowhead.size} * ${normal.x} )',
		'arrowhead.si.y': '${arrowhead.center.y} + ( 0.5 * ${arrowhead.size} * ${normal.y} )',



		
		// midpoint
		midpoint_t: '${t} / 2',

		'midpoint_tAQ.x': '${A.x} + ( ${midpoint_t} * ( ${Q.x} - ${A.x} ) )',
		'midpoint_tAQ.y': '${A.y} + ( ${midpoint_t} * ( ${Q.y} - ${A.y} ) )',

		'midpoint_tQB.x': '${Q.x} + ( ${midpoint_t} * ( ${B.x} - ${Q.x} ) )',
		'midpoint_tQB.y': '${Q.y} + ( ${midpoint_t} * ( ${B.y} - ${Q.y} ) )',

		'midpoint_Z.x'  : '${midpoint_tAQ.x} + ( ${midpoint_t} * ( ${midpoint_tQB.x} - ${midpoint_tAQ.x} ) )',
		'midpoint_Z.y'  : '${midpoint_tAQ.y} + ( ${midpoint_t} * ( ${midpoint_tQB.y} - ${midpoint_tAQ.y} ) )',

		midpoint_direction: {
			dependsOn: [ 'midpoint_tAQ', 'midpoint_tQB' ],
			get: function ( midpoint_tAQ, midpoint_tQB ) {
				var dx, dy, magnitude, x, y;

				dx = midpoint_tQB.x - midpoint_tAQ.x;
				dy = midpoint_tQB.y - midpoint_tAQ.y;

				magnitude = Math.sqrt( ( dx * dx ) + ( dy * dy ) );

				x = dx / magnitude;
				y = dy / magnitude;

				return {
					x: x,
					y: y
				};
			}
		},

		'midpoint_normal.x': '-${midpoint_direction.y}',
		'midpoint_normal.y': ' ${midpoint_direction.x}',

		'approximation_midpoint_port.x': '${midpoint_Z.x} - ( 0.5 * ${arrowhead.size} * ${midpoint_normal.x} )',
		'approximation_midpoint_port.y': '${midpoint_Z.y} - ( 0.5 * ${arrowhead.size} * ${midpoint_normal.y} )',
		'approximation_midpoint_starboard.x': '${midpoint_Z.x} + ( 0.5 * ${arrowhead.size} * ${midpoint_normal.x} )',
		'approximation_midpoint_starboard.y': '${midpoint_Z.y} + ( 0.5 * ${arrowhead.size} * ${midpoint_normal.y} )',

		'midpoint_port.x': '${tAQ.x} - ( 0.5 * ${arrowhead.size} * ${midpoint_normal.x} )',
		'midpoint_port.y': '${tAQ.y} - ( 0.5 * ${arrowhead.size} * ${midpoint_normal.y} )',
		'midpoint_starboard.x': '${tAQ.x} + ( 0.5 * ${arrowhead.size} * ${midpoint_normal.x} )',
		'midpoint_starboard.y': '${tAQ.y} + ( 0.5 * ${arrowhead.size} * ${midpoint_normal.y} )',

		'arrowhead.size': '${varyThickness} ? ( ${t} * ${thickness} ) : ${thickness}'
	});

	return [

		// stage 0
		function () {
			return {
				do: function ( ractive ) {
					viewBox = new ViewBox( ractive.nodes.svg );

					ractive.debug = true;

					ractive.set( state.get() );
					ractive.set({
						showNodes: true,
						showLabels: true,
						showGuideVectors: true,
						showGuideCurve: true,
						showIntermediateCurve: true,

						t: 0,
						thickness: 30
					});

					ractive.on( 'drag', function ( event, point ) {
						var move, cancel;

						move = function ( event ) {
							var changes, svgCoords = viewBox.getCoordsFromClient( event.clientX, event.clientY );

							changes = {};
							changes[ point + '.x' ] = svgCoords.x;
							changes[ point + '.y' ] = svgCoords.y;

							state.set( changes );
						};

						cancel = function () {
							window.removeEventListener( 'mousemove', move );
							window.removeEventListener( 'mouseup', cancel );
						}

						window.addEventListener( 'mousemove', move );
						window.addEventListener( 'mouseup', cancel );
					});

					state.on( 'change', function ( changeHash ) {
						ractive.set( changeHash );
					});

					ractive.observe({
						t: function ( t ) {
							state.set( 't', t );
						},
						thickness: function ( t ) {
							state.set( 'thickness', t );
						},
						varyThickness: function ( vary ) {
							state.set( 'varyThickness', vary );
						}
					});
				},
				undo: function () {
					// noop
				}
			}
		},

		// stage 1 - animate t
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate( 't', 1, {
						duration: 2000,
						easing: 'easeInOut',
						complete: function () {
							ractive.animate( 't', 0, {
								duration: 2000,
								easing: 'easeInOut'
							});
						}
					});
				},
				redo: function () {
					// noop
				},
				undo: function () {
					// noop
				}
			}
		},

		// stage 2 - show intermediate points
		function () {
			return {
				do: function ( ractive ) {
					ractive.set({
						showIntermediatePoints: true,
						showIntermediateVectors: true
					});

					ractive.animate( 't', 0.25 );
				},
				redo: function ( ractive ) {
					ractive.set({
						showIntermediatePoints: true,
						showIntermediateVectors: true,
						t: 0.25
					});
				},
				undo: function () {
					// noop
				}
			}
		},

		// stage 3 - show trajectory
		function () {
			return {
				do: function ( ractive ) {
					ractive.set( 'showTrajectory', true );
				},
				undo: function ( ractive ) {
					ractive.set( 'showTrajectory', false );
				}
			}
		},

		// stage 4 - show trajectory hint
		function () {
			return {
				do: function ( ractive ) {
					ractive.set( 'showTrajectoryHint', true );

					ractive.animate( 't', 0.25 );
				},
				redo: function ( ractive ) {
					ractive.set({
						showTrajectoryHint: true,
						t: 0.25
					});
				},
				undo: function ( ractive ) {
					ractive.set( 'showTrajectoryHint', false );
				}
			}
		},

		// stage 5 - hide trajectory hint, show arrowhead base and crossbars
		function () {
			return {
				do: function ( ractive ) {
					ractive.set({
						showTrajectoryHint: false,
						showArrowheadBase: true,
						showCrossbars: true
					});
				},
				undo: function ( ractive ) {
					ractive.set({
						showTrajectoryHint: true,
						showArrowheadBase: false,
						showCrossbars: false
					});
				}
			}
		},

		// stage 6 - show approximation
		function () {
			return {
				do: function ( ractive ) {
					ractive.set({
						showNodes: true,
						showLabels: false,
						showGuideVectors: false,
						showGuideCurve: false,
						showIntermediatePoints: false,
						showIntermediateVectors: false,
						showIntermediateCurve: false,
						showTrajectory: false,
						showTrajectoryHint: false,
						showArrowheadBase: false,
						showCrossbars: false,
						showApproximationOutline: false,
						showApproximation: false,
						showResultOutline: false,
						showResult: false
					}, function () {
						ractive.animate({
							A: { x: 200, y: 350 },
							B: { x: 800, y: 300 },
							Q: { x: 500, y: 200 }
						}, {
							duration: 800,
							easing: 'easeInOut',
							complete: function () {
								state.set({
									A: { x: 200, y: 350 },
									B: { x: 800, y: 300 },
									Q: { x: 500, y: 200 },
									t: 0.75
								});

								ractive.set( 'showApproximation', true );
							}
						})
					})

					
				},
				redo: function ( ractive ) {
					ractive.set({
						showNodes: true,
						showLabels: false,
						showGuideVectors: false,
						showGuideCurve: false,
						showIntermediatePoints: false,
						showIntermediateVectors: false,
						showIntermediateCurve: false,
						showTrajectory: false,
						showTrajectoryHint: false,
						showArrowheadBase: false,
						showCrossbars: false,
						showApproximationOutline: false,
						showApproximation: true,
						showResultOutline: false,
						showResult: false
					});

					state.set({
						A: { x: 200, y: 350 },
						B: { x: 800, y: 300 },
						Q: { x: 500, y: 200 },
						t: 0.75
					});
				},
				undo: function ( ractive ) {
					ractive.set({
						showNodes: true,
						showLabels: true,
						showGuideVectors: true,
						showGuideCurve: true,
						showIntermediatePoints: true,
						showIntermediateVectors: true,
						showIntermediateCurve: true,
						showTrajectory: true,
						showTrajectoryHint: false,
						showArrowheadBase: true,
						showCrossbars: true,
						showApproximationOutline: false,
						showApproximation: false,
						showResultOutline: false,
						showResult: false
					});

					state.set({
						A: { x: 200, y: 350 },
						B: { x: 800, y: 300 },
						Q: { x: 500, y: 200 },
						t: 0.75
					});
				}
			}
		}
	];
}