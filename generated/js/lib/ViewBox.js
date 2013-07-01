// ViewBox v0.1.0
// Copyright (2013) Rich Harris
// Released under the MIT License

// https://github.com/Rich-Harris/ViewBox

/*global window, SVGSVGElement */

;(function ( global ) {

'use strict';var ViewBox, animation, parseViewBox, extend, easingFunctions;



ViewBox = function ( svg, x, y, width, height, options ) {

	var self = this;

	if ( !( svg instanceof SVGSVGElement ) ) {
		throw new Error( 'First argument must be an svg element' );
	}

	this.svg = svg;

	if ( arguments.length === 1 ) {
		this.getViewBoxFromSvg();
	}

	else if ( arguments.length === 2 && typeof x === 'object' ) {
		this.getViewBoxFromSvg();
		this.set( x );
	}

	else {
		this.set({
			x: x,
			y: y,
			width: width,
			height: height
		});

		if ( options ) {
			this.set( options );
		}
	}


	// register as dirty whenever user resizes or scrolls (manually invoke using
	// the viewBox.dirty() method)
	this.dirty = function () {
		if ( !self._dirty ) {
			window.removeEventListener( 'resize', self.dirty );
			window.removeEventListener( 'scroll', self.dirty );

			self._dirty = true;
		}
	};

	this.dirty();
};

ViewBox.prototype = {
	getViewBoxFromSvg: function () {
		var viewBoxAttr, width, height, boundingClientRect;

		viewBoxAttr = this.svg.getAttribute( 'viewBox' );
		if ( viewBoxAttr ) {
			this.set( parseViewBox( viewBoxAttr ) );
		}

		else {
			width = this.svg.getAttribute( 'width' );
			height = this.svg.getAttribute( 'height' );

			if ( !width && !height ) {
				boundingClientRect = this.svg.getBoundingClientRect;
				width = boundingClientRect.width;
				height = boundingClientRect.height;
			}

			this.set({
				x: 0,
				y: 0,
				width: width || 100,
				height: height || 100
			});
		}
	},

	set: function ( x, y, width, height, options ) {
		var corrected;

		if ( typeof x === 'object' ) {
			extend( this, x );
		} else {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;

			extend( this, options );
		}

		corrected = this.correct( this.x, this.y, this.width, this.height );
		extend( this, corrected );

		this.svg.setAttribute( 'viewBox', this.toString() );
	},

	animate: function ( x, y, width, height, options ) {
		if ( typeof x === 'object' ) {
			options = y;

			width = ( x.width !== undefined ? x.width : this.width );
			height = ( x.height !== undefined ? x.height : this.height );
			y = ( x.y !== undefined ? x.y : this.y );
			x = ( x.x !== undefined ? x.x : this.x );
		}

		options = options || {};

		if ( this.animation ) {
			this.animation.stop();
		}

		this.animation = animation( this, x, y, width, height, options );
	},

	clean: function () {
		if ( this._dirty ) {
			window.addEventListener( 'resize', this.dirty );
			window.addEventListener( 'scroll', this.dirty );

			this._dirty = false;
		}
	},

	correct: function ( x, y, width, height ) {

		console.group( 'correcting', x, y, width, height );

		// ensure we are within x bounds, first by panning, then
		// (if that fails) by zooming
		if ( this.left !== undefined && x < this.left ) {
			x = this.left;
		}

		if ( this.right !== undefined && ( x + width ) > this.right ) {
			x = this.right - width;

			if ( this.left !== undefined && x < this.left ) {
				width = this.right - this.left;
			}
		}

		// ditto with y bounds
		if ( this.top !== undefined && y < this.top ) {
			console.log( 'enforcing top' );
			y = this.top;
		}

		if ( this.bottom !== undefined && ( y + height ) > this.bottom ) {
			console.log( 'enforcing bottom' );
			y = this.bottom - height;

			if ( this.top !== undefined && y < this.top ) {
				height = this.bottom - this.top;
			}
		}

		console.groupEnd();

		return {
			x: x,
			y: y,
			width: width,
			height: height
		};
	},

	getClientBox: function () {
		// get a box representing this view box in terms of client coords
		var svgAspectRatio, viewBoxAspectRatio, clientBox, svgBBox;

		if ( this._dirty ) {
			svgBBox = this.svg.getBoundingClientRect();

			svgAspectRatio = svgBBox.width / svgBBox.height;
			viewBoxAspectRatio = this.width / this.height;

			clientBox = {};

			if ( svgAspectRatio > viewBoxAspectRatio ) {
				clientBox.width = svgBBox.height * viewBoxAspectRatio;
				clientBox.height = svgBBox.height;

				clientBox.x = svgBBox.left + ( svgBBox.width - clientBox.width ) / 2;
				clientBox.y = svgBBox.top;
			} else {
				clientBox.width = svgBBox.width;
				clientBox.height = svgBBox.width / viewBoxAspectRatio;

				clientBox.x = svgBBox.left;
				clientBox.y = svgBBox.top + ( svgBBox.height - clientBox.height ) / 2;
			}

			this.clientBox = clientBox;

			this.clean();
		}

		return this.clientBox;
	},

	getCoordsFromClient: function ( x, y ) {
		var relativeX, relativeY, svgX, svgY, viewBox;

		if ( typeof x === 'object' ) {
			y = x.y;
			x = x.x;
		}

		viewBox = this.viewBox;

		this.clientBox = this.getClientBox();

		// get position relative to clientBox
		relativeX = ( x - this.clientBox.x ) / this.clientBox.width;
		relativeY = ( y - this.clientBox.y ) / this.clientBox.height;

		svgX = this.x + ( relativeX * this.width );
		svgY = this.y + ( relativeY * this.height );

		return {
			x: svgX,
			y: svgY
		};
	},

	pan: function ( dx, dy, animate ) {
		var zoom, newX, newY, corrected;

		if ( typeof dx === 'object' ) {
			animate = dx.animate;
			dy = dx.dy;
			dx = dx.dx;
		}

		zoom = this.getZoom();

		newX = this.x -( dx / zoom );
		newY = this.y -( dy / zoom );

		corrected = this.correct( newX, newY, this.width, this.height );

		if ( animate ) {
			this.animate( corrected, animate );
		} else {
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		}
	},

	zoom: function ( clientX, clientY, factor, animate ) {
		var coords, newX, newY, newWidth, newHeight, x1_to_cx, y1_to_cy, corrected;

		if ( typeof clientX === 'object' ) {
			factor = clientX.factor;
			animate = clientX.animate;
			clientY = clientX.y;
			clientX = clientX.x;
		}

		if ( isNaN( clientX ) || isNaN( clientY ) || isNaN( factor ) ) {
			throw new Error( 'Bad arguments: ' + Array.prototype.slice.call( arguments ).join( ', ' ) );
		}

		coords = this.getCoordsFromClient( clientX, clientY );

		if ( this.maxZoom !== undefined ) {
			factor = Math.min( factor, this.maxZoom / this.getZoom() );
		}

		newWidth = this.width / factor;
		newHeight = this.height / factor;

		x1_to_cx = coords.x - this.x;
		y1_to_cy = coords.y - this.y;

		newX = coords.x - ( x1_to_cx / factor );
		newY = coords.y - ( y1_to_cy / factor );

		corrected = this.correct( newX, newY, newWidth, newHeight );

		if ( animate ) {
			this.animate( corrected, animate );
		} else {
			extend( this, corrected );
			this.svg.setAttribute( 'viewBox', this.toString() );
		}
	},

	getZoom: function () {
		return this.svg.getScreenCTM().a;
	},

	toString: function () {
		return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
	}
};



// helpers
animation = function ( viewBox, x, y, width, height, options ) {
	var animation, fx, fy, fw, fh, dx, dy, dw, dh, startTime, duration, running, easing, loop;

	animation = {};

	fx = viewBox.x;
	fy = viewBox.y;
	fw = viewBox.width;
	fh = viewBox.height;

	dx = x - fx;
	dy = y - fy;
	dw = width - fw;
	dh = height - fh;

	duration = ( options.duration !== undefined ? options.duration : 400 );
	if ( options.easing ) {
		if ( typeof options.easing === 'function' ) {
			easing = options.easing;
		} else {
			easing = easingFunctions[ options.easing ];
		}
	}

	if ( !easing ) {
		easing = function ( t ) { return t; };
	}

	loop = function () {
		var timeNow, elapsed, t;

		if ( !running ) {
			return;
		}

		timeNow = Date.now();
		elapsed = timeNow - startTime;

		if ( elapsed > duration ) {
			viewBox.x = x;
			viewBox.y = y;
			viewBox.width = width;
			viewBox.height = height;

			viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );

			if ( options.complete ) {
				options.complete();
			}

			return;
		}

		t = easing( elapsed / duration );

		viewBox.x = fx + ( t * dx );
		viewBox.y = fy + ( t * dy );
		viewBox.width = fw + ( t * dw );
		viewBox.height = fh + ( t * dh );

		if ( options.step ) {
			options.step( t );
		}

		viewBox.svg.setAttribute( 'viewBox', viewBox.toString() );

		global.requestAnimationFrame( loop );
	};

	animation.stop = function () {
		running = false;
	};

	running = true;
	startTime = Date.now();

	loop();

	return animation;
};

parseViewBox = function ( str ) {
	var split = str.split( ' ' );

	return {
		x: +split[0],
		y: +split[1],
		width: +split[2],
		height: +split[3]
	};
};

extend = function ( obj1, obj2 ) {
	var key;

	if ( !obj2 ) {
		return;
	}

	for ( key in obj2 ) {
		if ( obj2.hasOwnProperty( key ) ) {
			obj1[ key ] = obj2[ key ];
		}
	}
};

// https://gist.github.com/paulirish/1579671
(function( vendors, lastTime, window ) {
	
	var x;

	for ( x = 0; x < vendors.length && !global.requestAnimationFrame; ++x ) {
		global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
		global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if ( !global.requestAnimationFrame ) {
		global.requestAnimationFrame = function(callback) {
			var currTime, timeToCall, id;
			
			currTime = Date.now();
			timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
			id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
			
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if ( !global.cancelAnimationFrame ) {
		global.cancelAnimationFrame = function( id ) {
			global.clearTimeout( id );
		};
	}
}( ['ms', 'moz', 'webkit', 'o'], 0, global ));


// --------------------------------------------------
// easing.js v0.5.4
// Generic set of easing functions with AMD support
// https://github.com/danro/easing-js
// This code may be freely distributed under the MIT license
// http://danro.mit-license.org/
// --------------------------------------------------
// All functions adapted from Thomas Fuchs & Jeremy Kahn
// Easing Equations (c) 2003 Robert Penner, BSD license
// https://raw.github.com/danro/easing-js/master/LICENSE
// --------------------------------------------------
easingFunctions = {
	easeInQuad: function(pos) {
		return Math.pow(pos, 2);
	},

	easeOutQuad: function(pos) {
		return -(Math.pow((pos-1), 2) -1);
	},

	easeInOutQuad: function(pos) {
		if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
		return -0.5 * ((pos-=2)*pos - 2);
	},

	easeInCubic: function(pos) {
		return Math.pow(pos, 3);
	},

	easeOutCubic: function(pos) {
		return (Math.pow((pos-1), 3) +1);
	},

	easeInOutCubic: function(pos) {
		if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
		return 0.5 * (Math.pow((pos-2),3) + 2);
	},

	easeInQuart: function(pos) {
		return Math.pow(pos, 4);
	},

	easeOutQuart: function(pos) {
		return -(Math.pow((pos-1), 4) -1);
	},

	easeInOutQuart: function(pos) {
		if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
		return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
	},

	easeInQuint: function(pos) {
		return Math.pow(pos, 5);
	},

	easeOutQuint: function(pos) {
		return (Math.pow((pos-1), 5) +1);
	},

	easeInOutQuint: function(pos) {
		if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
		return 0.5 * (Math.pow((pos-2),5) + 2);
	},

	easeInSine: function(pos) {
		return -Math.cos(pos * (Math.PI/2)) + 1;
	},

	easeOutSine: function(pos) {
		return Math.sin(pos * (Math.PI/2));
	},

	easeInOutSine: function(pos) {
		return (-0.5 * (Math.cos(Math.PI*pos) -1));
	},

	easeInExpo: function(pos) {
		return (pos===0) ? 0 : Math.pow(2, 10 * (pos - 1));
	},

	easeOutExpo: function(pos) {
		return (pos===1) ? 1 : -Math.pow(2, -10 * pos) + 1;
	},

	easeInOutExpo: function(pos) {
		if(pos===0) return 0;
		if(pos===1) return 1;
		if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
		return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
	},

	easeInCirc: function(pos) {
		return -(Math.sqrt(1 - (pos*pos)) - 1);
	},

	easeOutCirc: function(pos) {
		return Math.sqrt(1 - Math.pow((pos-1), 2));
	},

	easeInOutCirc: function(pos) {
		if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
		return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
	},

	easeOutBounce: function(pos) {
		if ((pos) < (1/2.75)) {
			return (7.5625*pos*pos);
		} else if (pos < (2/2.75)) {
			return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
		} else if (pos < (2.5/2.75)) {
			return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
		} else {
			return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
		}
	},

	easeInBack: function(pos) {
		var s = 1.70158;
		return (pos)*pos*((s+1)*pos - s);
	},

	easeOutBack: function(pos) {
		var s = 1.70158;
		return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
	},

	easeInOutBack: function(pos) {
		var s = 1.70158;
		if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
		return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
	},

	elastic: function(pos) {
		return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
	},

	swingFromTo: function(pos) {
		var s = 1.70158;
		return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
		0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
	},

	swingFrom: function(pos) {
		var s = 1.70158;
		return pos*pos*((s+1)*pos - s);
	},

	swingTo: function(pos) {
		var s = 1.70158;
		return (pos-=1)*pos*((s+1)*pos + s) + 1;
	},

	bounce: function(pos) {
		if (pos < (1/2.75)) {
			return (7.5625*pos*pos);
		} else if (pos < (2/2.75)) {
			return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
		} else if (pos < (2.5/2.75)) {
			return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
		} else {
			return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
		}
	},

	bouncePast: function(pos) {
		if (pos < (1/2.75)) {
			return (7.5625*pos*pos);
		} else if (pos < (2/2.75)) {
			return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
		} else if (pos < (2.5/2.75)) {
			return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
		} else {
			return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
		}
	},

	easeFromTo: function(pos) {
		if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
		return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
	},

	easeFrom: function(pos) {
		return Math.pow(pos,4);
	},

	easeTo: function(pos) {
		return Math.pow(pos,0.25);
	}
};

if ( typeof global.module !== "undefined" && global.module.exports ) { global.module.exports = ViewBox; }
else if ( typeof global.define !== "undefined" && global.define.amd ) { global.define( function () { return ViewBox; }); }
else { global.ViewBox = ViewBox; }

}( this ));