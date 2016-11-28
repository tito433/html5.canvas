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


function Canvas(dom){

    var parent=dom, canvas=false;


    if(typeof dom === 'string'){
        parent = document.querySelector(dom);
        if(!parent)  parent=document.body;
    }

    if(parent instanceof HTMLCanvasElement){
        this.canvas=parent;
    }else{
        //we append
        var ppl=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-left')),
            ppr=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-right')),
            ppt=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-top')),
            ppb=parseInt(window.getComputedStyle(parent, null).getPropertyValue('padding-bottom'));
            width=parent.clientWidth-ppl-ppr,
            height=parent.clientHeight-ppt-ppb

        canvas=parent.appendChild(document.createElement('canvas'));
        canvas.width=width;
        canvas.height=height;
    }

    this.bounds=canvas.getBoundingClientRect();
    this.width=canvas.width;
    this.height=canvas.height;
    this._timer=false;
    

    this._ctx=canvas.getContext("2d");
    this._elemDr=[];

    this.add=function(dr) {
        if(dr instanceof Drawable){
            this._elemDr.push(dr);
        }
        return this;
    }
    this.rem=function (drawable) {
        if(drawable instanceof Drawable && this._elemDr.length){
            for (var i = this._elemDr.length - 1; i >= 0; i--) {
                if(this._elemDr[i]==drawable){
                    this._elemDr.splice(i,1);
                    return true;
                }
            }
        }
        return false;
    }
    this.draw=function(){
        this._ctx.clearRect(0,0,this.width,this.height);
        if(this._elemDr.length){
            for (var i =0,ln=this._elemDr.length; i<ln; i++) {
                this._elemDr[i].draw(this._ctx);
            }
        }
    };
    this.clear=function(){
        this._elemDr=[];
        this._elemDr.length=0;
        this._ctx.clearRect(0,0,this.width,this.height);
    }

    this.animate=function(interval){
        interval=undefined==interval?1000/60:interval;
        clearInterval(this._timer);
        if(interval){
            this._timer=setInterval(this.draw.bind(this),interval);
        }
    }

    //mouse events
    this._onClick=function(evt){
        var x=evt.clientX - this.bounds.left,
            y=evt.clientY - this.bounds.top;
        for(var idx in this._elemDr){
            var dr=this._elemDr[idx];

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
    this.size=function(){
        if(0==arguments.length){
            return {w:this.w,h:this.h};
        }else{
            var w=arguments[0], h=arguments.length>1?arguments[1]:arguments[0];
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
Drawable.prototype.draw=function(ctx){
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
        //i only accept arr.
        for (var i=0,ln=lines.length;i<ln;i++) {
            ctx.fillText(lines[i], x, y);
            y+=eh;
        }
    }

}
function Line(){
    Drawable.call(this);

    this.fillStyle="#f0f0f0";
    
    this.draw=function(ctx){
        ctx.save();
        Drawable.prototype.draw.call(this,ctx);
        ctx.beginPath();
        ctx.fillStyle=this.fillStyle;
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.w,this.h);
        ctx.stroke();
        ctx.restore();
    }

}
Line.prototype = Object.create(Drawable.prototype);
Line.prototype.constructor = Line;

function Rectangle(){
    Drawable.call(this);

    this.fillStyle="#f0f0f0";
    
    this.draw=function(ctx){
        ctx.save();
        Drawable.prototype.draw.call(this,ctx);
        ctx.fillStyle=this.fillStyle;
        ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.restore();
    }
}

Rectangle.prototype = Object.create(Drawable.prototype);
Rectangle.prototype.constructor = Rectangle;





function Layout(mw,mh){
    this.maxWidth=mw;
    this.maxHeight=mh;
    this.padding=10;

    this.flowLeft=function(drawables){
        var x=1,y=1;

        for(var idx in drawables){
            var item=drawables[idx];
            if(item instanceof Drawable){

                item.position(x,y);
                x+=item.width()+this.padding;
                
                if(x+item.width()>=this.maxWidth){
                    y+=item.height()+this.padding;
                    x=1;
                }
                
            }
        }
    }
}
