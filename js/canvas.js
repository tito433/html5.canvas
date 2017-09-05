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

	this._animate = false;

	if (typeof dom === 'string') {
		parent = document.querySelector(dom);
	}

	if (parent instanceof HTMLCanvasElement) {
		canvas = parent;
	} else if (!parent) {
		parent = document.body;
	}

	canvas = canvas || parent.getElementsByTagName('CANVAS');

	if (!canvas.length) {
		canvas = document.createElement('canvas');
		parent.appendChild(canvas);
		var ppl = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
			ppr = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
			ppt = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
			ppb = parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));

		canvas.width = parent.clientWidth - ppl - ppr;
		canvas.height = parent.clientHeight - ppt - ppb;
	} else {
		canvas = canvas[0];
	}

	this.width = canvas.width;
	this.height = canvas.height;
	this.bounds = canvas.getBoundingClientRect();
	this.x = 0;
	this.y = 0;
	this._timer = false;
	this._mosueDown = false;
	this._mosueDown = false;


	this._ctx = canvas.getContext("2d");
	this._elemDr = [];

	this.add = function(dr) {
		if (dr) {
			if (typeof dr.draw === "function") {
				dr.draw(this._ctx);
			}
		}
		return this;
	}

	this.draw = function(drawable) {
		if (drawable && drawable instanceof Drawable) {
			drawable.draw(this._ctx);
		}
	};

	this.clear = function() {
		this._ctx.clearRect(0, 0, this.width, this.height);
	}

	this.onZoom = function() {};
	canvas.addEventListener("mousewheel", function(event) {
		var delta = 0;
		if (!event) /* For IE. */
			event = window.event;
		if (event.wheelDelta) { /* IE/Opera. */
			delta = event.wheelDelta / 120;
		} else if (event.detail) { /** Mozilla case. */
			/** In Mozilla, sign of delta is different than in IE.
			 * Also, delta is multiple of 3.
			 */
			delta = -event.detail / 3;
		}
		/** If delta is nonzero, handle it.
		 * Basically, delta is now positive if wheel was scrolled up,
		 * and negative, if wheel was scrolled down.
		 */
		if (delta)
			this.onZoom.call(this, delta);
		/** Prevent default actions caused by mouse wheel.
		 * That might be ugly, but we handle scrolls somehow
		 * anyway, so don't bother here..
		 */
		if (event.preventDefault)
			event.preventDefault();
		event.returnValue = false;


	}.bind(this), false);

	// setInterval(this.draw.bind(this), 1000);
	this.saveAsPng = function() {
		window.open(canvas.toDataURL("image/png"), '_blank');
	}
}

function Drawable() {

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
	this.draw = function(ctx) {
		ctx.save();
		ctx.font = "20px Georgia";
		ctx.textAlign = "center";
		ctx.fillStyle = 'red';
		ctx.fillText(this.getName() + ' draw function not overriden!', this.x, this.y);
		ctx.restore();

	}
}
Drawable.prototype.drawLabel = function(ctx, lables, aling) {
	aling = aling || "center";
	var fy = ctx.measureText("0").width,
		pad = "center" === aling ? this.width() / 2 : 0;
	ctx.textAlign = aling;
	ctx.textBaseline = "middle";
	lables = lables instanceof Array ? lables : [lables];
	var y = (this.h - (lables.length * fy)) / 2;
	for (var i = 0, ln = lables.length; i < ln; i++) {
		ctx.save();
		ctx.fillText(lables[i], this.x + pad, this.y + y, this.w);
		y += fy;
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



function Layout(typeName) {
	this.typeName = typeName;
	this.maxWidth = 0;
	this.maxHeight = 0;
	this.padding = 10;
	this._table_config = {
		col: 4,
		row: 1
	};
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
		this.typeName = 'flowLeft';
	}
	this.type_fn_flowLeft = function() {
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
	this.table = function(col, row) {
		this.typeName = 'table';
		this._table_config = {
			col: col,
			row: row
		};
	}
	this.type_fn_table = function() {
		var aw = this.maxWidth - (this._table_config.col + 1) * this.padding,
			w = Math.floor(aw / this._table_config.col),
			x = this.margin.x,
			y = this.margin.y,
			dh = Math.min(w, (this.maxHeight - 2 * this.padding) / this._table_config.row);

		for (var i = 0, ln = this._drawables.length; i < ln; i++) {
			var item = this._drawables[i];
			h = item.height() == 0 ? dh : item.height();
			item.position(x + this.padding, y + this.padding).size(w, h);
			x += w + this.padding;
			if ((i + 1) % this._table_config.col == 0) {
				y += h + this.padding;
				x = this.margin.x;
			}

		}

	}
	this.clear = function() {
		this._drawables = [];
	}
	this.draw = function(ctx) {
		this.maxWidth = ctx.canvas.clientWidth;
		this.maxHeight = ctx.canvas.clientHeight;
		var fn_name = 'type_fn_' + this.typeName;
		if (typeof this[fn_name] === 'function') this[fn_name]();
		for (var i = 0, ln = this._drawables.length; i < ln; i++) {
			this._drawables[i].draw(ctx);
		}
	}
}

Layout.prototype = Object.create(Drawable.prototype);
Layout.prototype.constructor = Layout;

function Grid(size) {
	Drawable.call(this);
	this._bl_size = size;
	this.draw = function(ctx) {
		// var img = ctx.getImageData();
		ctx.save();
		ctx.translate(0.5, 0.5);
		var w = ctx.canvas.width,
			h = ctx.canvas.height,
			block = h / this._bl_size;

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, w, h);
		ctx.font = '24px serif';
		ctx.textAlign = 'center';
		ctx.fillStyle = '#FFF';
		var si = this.nx;
		// while (i < w) {
		// 	ctx.strokeStyle = (si == 0) ? '#fff' : '#6192A4';
		// 	ctx.lineWidth = (si == 0) ? 3 : 2;
		// 	ctx.beginPath();
		// 	ctx.moveTo(i + 0.5, 0.5);
		// 	ctx.lineTo(i + 0.5, h + 0.5);
		// 	ctx.closePath();
		// 	ctx.stroke();

		// 	if (si % 3 == 0)
		// 		ctx.fillText(si, i, h / 2);
		// 	si++;
		// 	i += block;
		// }

		ctx.strokeStyle = '#6192A4';
		ctx.lineWidth = 2;
		ctx.textBaseline = "middle";
		var ny = Math.round(h / block);
		for (var i = 0; i < ny; i++) {
			ctx.beginPath();
			var y = i * block + 0.5;
			ctx.moveTo(0.5, y);
			ctx.lineTo(w - 0.5, y);
			ctx.stroke();
			ctx.fillText(ny - i, block, y);
		}
		for (var i = 0, nx = Math.round(w / block); i < nx; i++) {
			ctx.beginPath();
			var x = i * block + 0.5;
			ctx.moveTo(x, 0.5);
			ctx.lineTo(x, h);
			ctx.stroke();
			ctx.fillText(i, x, (ny - 1) * block);
		}

		ctx.restore();

	}
}
Grid.prototype = Object.create(Drawable.prototype);
Grid.prototype.constructor = Grid;