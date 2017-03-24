/* Html5 canvas drawing OOP lib
Creator: A. K. M. Rezaul Karim<titosust@gmail.com>
Version: 1.0.43
param: dom, can be a DOMElement or nothing(document.body)
            will be reffered as $parent DOMElement.
            If there isn't any $canvas element in $parent append one
            this $canvas will be used as drawing board. 
            Then you just add as many Drawable Object and call my
            add=function(drObject) to add in canvas.
            rem=function(drObject) to delete from canvas.
            clear=function() to clean canvas.
            draw=function() to show items in canvas, draw once
            animate=function(interval) to show items in canvas, draw infinte times per 1000ms,1000/60 is default and false is to stop.
            


*/


function Canvas(dom) {

	var parent = dom,
		canvas = false;


	if (typeof dom === 'string') {
		parent = document.querySelector(dom);
		if (!parent) parent = document.body;
	}
	var canvas = false;
	if (parent instanceof HTMLCanvasElement) {
		canvas = parent;
	} else {
		//do we have?
		canvas = parent.querySelector('canvas');
		if (!canvas) {
			//we append
			canvas = document.createElement('canvas');

			var ppl = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
				ppr = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
				ppt = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
				ppb = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom')),
				width = parent.clientWidth - ppl - ppr,
				height = parent.clientHeight - ppt - ppb;

			parent.appendChild(canvas);
			canvas.width = width;
			canvas.height = height;
		}
	}

	this.bounds = canvas.getBoundingClientRect();
	this.x = 0;
	this.y = 0;
	this.width = canvas.width;
	this.height = canvas.height;
	this._timer = false;
	this._mosueDown = false;
	this._mosueDown = false;

	this._ctx = canvas.getContext("2d");
	this._elemDr = [];

	this.add = function(dr) {
		if (dr instanceof Drawable) {
			this._elemDr.push(dr);
		}
		return this;
	}
	this.rem = function(drawable) {
		if (drawable instanceof Drawable && this._elemDr.length) {
			for (var i = this._elemDr.length - 1; i >= 0; i--) {
				if (this._elemDr[i] == drawable) {
					this._elemDr.splice(i, 1);
					return true;
				}
			}
		}
		return false;
	}
	this.draw = function() {

		var elems = this._elemDr;
		if (arguments.length > 0 && arguments[0] instanceof Array) {
			elems = arguments[0];
		}

		if (elems.length) {
			this._ctx.clearRect(0, 0, this.width, this.height);
			for (var i = 0, ln = elems.length; i < ln; i++) {
				if (elems[i] instanceof Drawable) {
					elems[i].draw(this._ctx);
				}
			}
		}
	};
	this.drawPoint = function(x, y, size, color, gradient) {
		var ctx = this._ctx;
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.arc(x, y, size, 0, 2 * Math.PI, true);
		ctx.fill();
		ctx.restore();

		if (gradient != undefined) {
			var reflection = size / 4;

			ctx.save();
			ctx.translate(x, y);
			var radgrad = ctx.createRadialGradient(-reflection, -reflection, reflection, 0, 0, size);

			radgrad.addColorStop(0, '#FFFFFF');
			radgrad.addColorStop(gradient, color);
			radgrad.addColorStop(1, 'rgba(1,159,98,0)');

			ctx.fillStyle = radgrad;
			ctx.fillRect(-size, -size, size * 2, size * 2);
			ctx.restore();

		}

	};
	this.clear = function() {
		this._elemDr = [];
		this._elemDr.length = 0;
		this._ctx.clearRect(0, 0, this.width, this.height);
	}

	this.animate = function(interval) {
		interval = undefined == interval ? 1000 / 60 : interval;
		clearInterval(this._timer);
		if (interval) {
			this._timer = setInterval(this.draw.bind(this), interval);
		}
	}

	this._onDrag = function(e) {
		if (this._mosueDown) {
			var dx = this._mosueDown.x - e.clientX,
				dy = this._mosueDown.y - e.clientY;
			for (var i in this._elemDr) {
				var r = this._elemDr[i];
				r.position(r.x - dx, r.y - dy);
			}
			if (this.onDrag && typeof this.onDrag == 'function') {
				this.onDrag(dx, dy);
			}
			this.draw();
			this._mosueDown = {
				x: e.clientX,
				y: e.clientY
			};

		}
	};
	canvas.addEventListener("mousedown", function(e) {
		this._mosueDown = {
			x: e.clientX,
			y: e.clientY
		};
	}.bind(this), false);
	canvas.addEventListener("mouseup", function() {
		this._mosueDown = false;
	}.bind(this), false);
	canvas.addEventListener("mousemove", this._onDrag.bind(this), false);


	this.onZoom = function() {};
	canvas.addEventListener("mousewheel", function(event) {
		event.preventDefault();
		var mousex = event.clientX - canvas.offsetLeft;
		var mousey = event.clientY - canvas.offsetTop;
		var zoom = event.wheelDelta / 120;
		this.onZoom.call(this, zoom);
	}.bind(this), true);
}

var Drawable = function() {

	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.label = false;
	this.fontName = "Verdana";
	this.fontColor = "#ffffff";
	this.fontSize = 14;

	this.width = function(w) {
		if (undefined == w) {
			return this.w;
		} else {
			this.w = w;
		}
		return this;
	}
	this.height = function(h) {
		if (undefined == h) {
			return this.h;
		} else {
			this.h = h;
		}
		return this;
	}
	this.size = function() {
		if (0 == arguments.length) {
			return {
				w: this.w,
				h: this.h
			};
		} else {
			var w = arguments[0],
				h = arguments.length > 1 ? arguments[1] : arguments[0];
			this.w = w;
			this.h = h;
		}
		return this;
	}
	this.position = function() {
		if (arguments.length) {
			this.x = arguments[0] || 0;
			this.y = arguments.length > 1 ? arguments[1] || 0 : 0;
			return this;
		} else {
			return new Point(this.x, this.y);
		}
	}
	this.vision = function(x, y) {
		var m = {
			x: x,
			y: y
		};

		var vector = function vector(p1, p2) {
			return {
				x: (p2.x - p1.x),
				y: (p2.y - p1.y)
			};
		};
		var dot = function(u, v) {
			return u.x * v.x + u.y * v.y;
		};
		var r = {
			A: {
				x: this.x,
				y: this.y
			},
			B: {
				x: this.x + this.w,
				y: this.y
			},
			C: {
				x: this.x + this.w,
				y: this.y + this.h
			},
			D: {
				x: this.x,
				y: this.y + this.h
			}
		};

		var AB = vector(r.A, r.B);
		var AM = vector(r.A, m);
		var BC = vector(r.B, r.C);
		var BM = vector(r.B, m);
		var dotABAM = dot(AB, AM);
		var dotABAB = dot(AB, AB);
		var dotBCBM = dot(BC, BM);
		var dotBCBC = dot(BC, BC);
		return 0 <= dotABAM && dotABAM <= dotABAB && 0 <= dotBCBM && dotBCBM <= dotBCBC;

	}
}
Drawable.prototype.draw = function(ctx) {
	if (this.label) {
		ctx.textBaseline = "top";
		ctx.font = this.fontSize + 'px ' + this.fontName;
		ctx.fillStyle = this.fontColor;
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		var lines = [].concat(this.label),
			eh = ctx.measureText('M').width,
			x = this.x + this.w / 2,
			y = this.y + eh / 2,
			th = (lines.length * eh);

		y += this.h / 2 - th / 2;
		//i only accept arr.
		for (var i = 0, ln = lines.length; i < ln; i++) {
			ctx.fillText(lines[i], x, y);
			y += eh;
		}
	}

}

function Point(x, y) {
	this.x = x;
	this.y = y;
	this.hitTest = function(point1, point2) {
		var dxc = this.x - point1.x,
			dyc = this.y - point1.y,
			dxl = point2.x - point1.x,
			dyl = point2.y - point1.y,
			cross = dxc * dyl - dyc * dxl;
		if (cross != 0) return false;
		if (Math.abs(dxl) >= Math.abs(dyl))
			return dxl > 0 ? point1.x <= this.x && this.x <= point2.x : point2.x <= this.x && this.x <= point1.x;
		else
			return dyl > 0 ? point1.y <= this.y && this.y <= point2.y : point2.y <= this.y && this.y <= point1.y;
	}
}

function Cirle() {
	Drawable.call(this);

	this.fillStyle = '';
	this.strokeStyle = "#443";
	this.lineWidth = 1;
	this.radius = 0;

	this.draw = function(ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = this.fillStyle;
		ctx.strokeStyle = this.strokeStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		if (this.fillStyle) {
			ctx.fill();
		}

		ctx.stroke();
		ctx.restore();
	}

}
Cirle.prototype = Object.create(Drawable.prototype);
Cirle.prototype.constructor = Cirle;

function Line(lineWidth) {
	Drawable.call(this);

	this.fillStyle = "#f0f0f0";
	this.lineWidth = lineWidth || 1;
	this.draw = function(ctx) {
		ctx.save();
		Drawable.prototype.draw.call(this, ctx);
		ctx.beginPath();
		ctx.fillStyle = this.fillStyle;
		ctx.lineWidth = this.lineWidth;
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.w, this.h);
		ctx.stroke();
		ctx.restore();
	}

}
Line.prototype = Object.create(Drawable.prototype);
Line.prototype.constructor = Line;

function Rectangle() {
	Drawable.call(this);

	this.fillStyle = "#f0f0f0";

	this.draw = function(ctx) {
		ctx.save();
		Drawable.prototype.draw.call(this, ctx);
		ctx.fillStyle = this.fillStyle;
		ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.restore();
	}
}

Rectangle.prototype = Object.create(Drawable.prototype);
Rectangle.prototype.constructor = Rectangle;



function Layout(mw, mh) {
	this.maxWidth = mw;
	this.maxHeight = mh;
	this.padding = 10;
	this.margin = {
		x: 0,
		y: 0
	};
	this._drawables = [];
	this.add = function(drawable) {
		if (drawable instanceof Drawable) {
			this._drawables.push(drawable);
		} else {
			console.log(drawable, 'is not a drawable')
		}
	}
	this.flowLeft = function() {
		var x = this.padding,
			y = this.padding;
		for (var idx in this._drawables) {
			var item = this._drawables[idx];
			if (item instanceof Drawable) {

				item.position(x, y);
				x += item.width() + this.padding;

				if (x + item.width() >= this.maxWidth) {
					y += item.height() + this.padding;
					x = this.padding;
				}

			}
		}
	}
	this.table = function(colCount) {
		var aw = this.maxWidth - (colCount + 1) * this.padding,
			w = Math.floor(aw / colCount),
			x = this.margin.x,
			y = this.margin.y;

		for (var i = 0, ln = this._drawables.length; i < ln; i++) {
			var item = this._drawables[i];
			if (item instanceof Drawable) {
				h = item.height() == 0 ? this.maxHeight - 2 * this.padding : item.height();
				item.position(x + this.padding, y + this.padding).size(w, h);
				x += w + this.padding;
				if ((i + 1) % colCount == 0) {
					y += h + this.padding;
					x = 0;
				}

			}
		}

	}
	this.clear = function() {
		this._drawables = [];
	}
}