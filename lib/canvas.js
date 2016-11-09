/* Html5 canvas drawing OOP lib
Creator: A. K. M. Rezaul Karim<titosust@gmail.com>

param: dom, can be a DOMElement or nothing(document.body)
            will be reffered as $parent DOMElement.
            If there isn't any $canvas element in $parent append one
            this $canvas will be used as drawing board. 
            Then you just add as many Drawable Object and call my
            function addDrawable=function(drObject) to show in canvas.

*/


function Canvas(dom){

    //following function copied from: 
    // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    this.isDom=function(obj) {
      try {
        //Using W3 DOM2 (works for FF, Opera and Chrom)
        return obj instanceof HTMLElement;
      }
      catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have. (works on IE7)
        return (typeof obj==="object") &&
          (obj.nodeType===1) && (typeof obj.style === "object") &&
          (typeof obj.ownerDocument ==="object");
      }
    };
    
    var parent=undefined!=dom && this.isDom(dom)?dom:document.body,
        ppl=window.getComputedStyle(parent, null).getPropertyValue('padding-left'),
        ppr=window.getComputedStyle(parent, null).getPropertyValue('padding-right'),
        ppt=window.getComputedStyle(parent, null).getPropertyValue('padding-top'),
        ppb=window.getComputedStyle(parent, null).getPropertyValue('padding-bottom');
        width=parent.clientWidth-ppl-ppr,
        height=parent.clientHeight-ppt-ppb;

    var canvas=parent.getElementsByTagName ('canvas');
    if(canvas.length==0){
        canvas=parent.appendChild(document.createElement('canvas'));
        canvas.width=width;
        canvas.height=height;
    }else{
        canvas=canvas[0];
    }
    
    this.bounds=canvas.getBoundingClientRect();
    this.width=height;
    this.height=height;

    

    this._ctx=canvas.getContext("2d");
    this.drawables=[];

    this.addDrawable=function(dr) {
        if(dr instanceof Drawable){
            this.drawables.push(dr);
        }
    }
    this.delDrawable=function (drawable) {
        if(drawable instanceof Drawable && this.drawables.length){
            for (var i = this.drawables.length - 1; i >= 0; i--) {
                if(this.drawables[i]==drawable){
                    this.drawables.splice(i,1);
                    return true;
                }
            }
        }
        return false;
    }
    this.draw=function(){
        if(this.drawables.length){
            this._ctx.clearRect(0,0,this.width,this.height);
            for (var i =0,ln=this.drawables.length; i<ln; i++) {
                this.drawables[i].draw(this._ctx);
            }
        }
    };
    this.clear=function(){
        this.drawables=[];
        this._ctx.clearRect(0,0,this.width,this.height);
    }
    this._onClick=function(evt){
        var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top;
        for(var idx in this.drawables){
            var dr=this.drawables[idx];

            if(dr.vision(x,y) && typeof dr.onClick==='function'){
                dr.onClick(x,y);
                dr.draw(this._ctx);
            }
        }
    }
    canvas.addEventListener("mouseup", this._onClick.bind(this), false);
    canvas.addEventListener("touchend", this._onClick.bind(this), false);

}


var Drawable=function() {
        
        this.x = 0;
        this.y = 0;
        this.w=0;
        this.h=0;
        this.label=false;
        this.fontName="Verdana";
        this.fontColor="#ffffff";
        this.fontSize=14;

        this.width=function(w){
            if(undefined==w){
                return this.w;
            }else{
                this.w=w;
            }
            return this;
        }
        this.height=function(h){
            if(undefined==h){
                return this.h;
            }else{
                this.h=h;
            }
            return this;
        }
        this.size=function(w,h){
            if(undefined==w){
                return {w:this.w,h:this.h};
            }else if(w && h){
                this.w=w;
                this.h=h;
            }
            return this;
        }
        this.position=function(x,y){
            if(undefined==x){
                return {x:this.x,y:this.y};
            }else if(undefined!=x && undefined!=y){
                this.x=x;
                this.y=y;
            }
            return this;
        }
        this.vision=function(x,y){
             var m = {x: x, y: y};

            var vector=function vector(p1, p2) {
                return {x: (p2.x - p1.x), y: (p2.y - p1.y)};
            };
            var dot=function(u, v) {
                return u.x * v.x + u.y * v.y; 
            };
            var r = {A: {x: this.x, y: this.y},
                     B: {x: this.x+this.w, y: this.y},
                     C: {x: this.x+this.w, y: this.y+this.h},
                     D: {x: this.x, y: this.y+this.h}
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
Drawable.draw=function(ctx){
    if(this.label){
        ctx.textBaseline="top";
        ctx.font=this.fontSize+'px '+this.fontName;
        ctx.fillStyle=this.fontColor;
        ctx.textBaseline="middle";
        ctx.textAlign="center";  
        var lines=[].concat(this.label),
                eh=ctx.measureText('M').width,
                x=this.x+this.w/2,y=this.y+eh/2,
                th=(lines.length*eh);

        y+=this.h/2-th/2;

        for (var index in lines) {
            ctx.fillText(lines[index], x, y);
            y+=eh;
        }
    }

}
function Rectangle(){
    Drawable.call(this);

    this.fillStyle="#f0f0f0";
    
    this.draw=function(ctx){
        ctx.save();
        ctx.fillStyle=this.fillStyle;
        ctx.fillRect(this.x,this.y,this.w,this.h);
        Drawable.draw.call(this,ctx);
        ctx.restore();
    }
}

Rectangle.prototype = Object.create(Drawable.prototype);
Rectangle.prototype.constructor = Rectangle;





function Layout(mw,mh){
    this.maxWidth=mw;
    this.maxHeight=mh;
    this.colCount=7;

    this.padding=10;

    this.flowLeft=function(drawables){
        var size=Math.min(this.maxWidth,this.maxHeight),
            w=size/this.colCount,h=w,x=0,y=0,
            eh=h* Math.ceil(drawables.length/this.colCount);
        
        while(eh && eh>size){
            w--;h--;
            if(w*(this.colCount+1)<size){
                this.colCount++;
            }
            eh=h*Math.ceil(drawables.length/this.colCount);
        }
        for(var idx in drawables){
            var item=drawables[idx];
            if(item instanceof Drawable){
                item.size(w-this.padding,h-this.padding).position(x,y);
                x+=w;
                if(x>this.maxWidth||x+w>this.maxWidth){
                  x=0;y+=h;
                }
            }
        }
    }
}
