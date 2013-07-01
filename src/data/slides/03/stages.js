function () {

	return [

		// stage 1
		null,

		// stage 2
		null,

		null,

		// stage 3
		function () {
			return {
				do: function ( ractive ) {
					ractive.animate({
						'dataviz.cx': 600,
						'interactives.cx': 1000
					}, { easing: 'easeOut' });
				},
				redo: function ( ractive ) {
					ractive.set({
						'dataviz.cx': 600,
						'interactives.cx': 1000
					});
				},
				undo: function ( ractive ) {
					ractive.animate({
						'dataviz.cx': 400,
						'interactives.cx': 1200
					}, { easing: 'easeOut' });
				}
			};
		}
	];
}