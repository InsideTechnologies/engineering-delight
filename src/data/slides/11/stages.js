function () {

	var aspectRatio = 16 / 9;

	return [

		// stage 0 - setup
		function () {
			return {
				do: function ( ractive ) {
					var resizeHandler;

					resizeHandler = function () {
						var clientWidth, clientHeight, d, horizontalPadding, verticalPadding;

						console.log( ractive.nodes.video_container );

						clientWidth = ractive.nodes.video_container.clientWidth;
						clientHeight = ractive.nodes.video_container.clientHeight;

						if ( ( clientWidth / clientHeight ) > aspectRatio ) {
							// need vertical bars
							horizontalPadding = 0;

							d = clientWidth - ( clientHeight * aspectRatio );
							verticalPadding = d / 2;
						} else {
							// need horizontal bars
							verticalPadding = 0;
							
							d = clientHeight - ( clientWidth / aspectRatio );
							horizontalPadding = d / 2;
						}

						ractive.nodes.video_container.style.padding = horizontalPadding + 'px ' + verticalPadding + 'px';
					};

					window.addEventListener( 'resize', resizeHandler );
					ractive.on( 'teardown', function () {
						window.removeEventListener( 'resize', resizeHandler );
					});

					resizeHandler();
				},
				undo: function ( ractive ) {

				}
			}
		},

		// stage 1 - show facebook video
		null
	];
}