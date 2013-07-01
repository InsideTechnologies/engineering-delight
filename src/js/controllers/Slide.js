/*global define, Promise */

define( [ 'Ractive' ], function ( Ractive ) {
	
	'use strict';

	var Slide = function ( data, el ) {
		var stages, fn, i;

		this.html = data.slide;
		this.css = data.styles;
		this.data = data.data;

		stages = data.stages;

		this.el = el;

		if ( stages !== undefined ) {
			if ( !isNaN( +stages ) ) {
				this.numStages = stages;
			}

			else {
				try {
					fn = eval( '(' + stages + ')' );
					this.stages = fn( this );
					this.numStages = this.stages.length;
				} catch ( err ) {
					console.error( err );
				}
			}
		}

		else {
			this.numStages = 0;
		}
		
		// unwrap stages
		if ( this.stages ) {
			i = this.numStages;
			while ( i-- ) {
				if ( typeof this.stages[i] === 'function' ) {
					this.stages[i] = this.stages[i]( this );
				}
			}
		}
	};

	Slide.prototype = {
		enter: function ( backwards ) {
			var i, len;

			document.getElementById( 'SlideStyle' ).innerHTML = this.css || '';

			this.ractive = new Ractive({
				el: this.el,
				template: this.html,
				data: this.data
			});

			if ( backwards ) {
				if ( this.stages ) {
					len = this.stages.length;
					for ( i=0; i<len; i+=1 ) {
						if ( this.stages[i] && this.stages[i].redo ) {
							this.stages[i].redo( this.ractive, this );
						}

						else if ( this.stages[i] && this.stages[i].do ) {
							this.stages[i].do( this.ractive, this );
						}
					}
				}

				this.ractive.set( 'stage', this.numStages - 1 );
				this.currentStage = this.numStages - 1;
			}

			else {
				if ( this.stages && this.stages[0] ) {
					this.stages[0].do( this.ractive, this );
				}

				this.ractive.set( 'stage', 0 );
				this.currentStage = 0;
			}
		},

		exit: function () {
			var self = this;

			return new Promise( function ( resolver ) {
				console.log( 'tearing down' );
				self.ractive.teardown( function () {
					console.log( 'teardown complete' );
					resolver.resolve();
				});
			});
		},

		next: function () {
			if ( this.currentStage < ( this.numStages - 1 ) ) {
				this.currentStage += 1;

				if ( this.stages && this.stages[ this.currentStage ] ) {
					this.stages[ this.currentStage ].do( this.ractive, this );
				}

				this.ractive.set( 'stage', this.currentStage );

				return true;
			}

			return false;
		},

		prev: function () {
			if ( this.currentStage > 0 ) {
				if ( this.stages && this.stages[ this.currentStage ] ) {
					this.stages[ this.currentStage ].undo( this.ractive, this );
				}

				this.currentStage -= 1;

				this.ractive.set( 'stage', this.currentStage );

				return true;
			}

			return false;
		}
	};

	return Slide;

});