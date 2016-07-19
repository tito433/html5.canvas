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
    this._fps=1000/30;
    
    var parent=undefined!=dom && this.isDom(dom)?parent:document.body;
    var canvas=parent.getElementsByTagName ('canvas');
    canvas=canvas[0]||parent.appendChild(document.createElement('canvas'));

    this.size=parent.getBoundingClientRect();
    canvas.width=this.width=parent.clientWidth;
    canvas.height=this.height=parent.clientHeight;

    this._ctx=canvas.getContext("2d");
    this._drawables=[];

    this.addDrawable=function(dr) {
        if(dr instanceof Drawable){
            this._drawables.push(dr);
        }
    }
    this._CanvasDraw=function(){
        if(this._drawables.length){
            this._ctx.clearRect(0,0,this.width,this.height);
            for (var i = this._drawables.length - 1; i >= 0; i--) {
                this._drawables[i].draw(this._ctx);
            }
        }
    };

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

    setInterval(this._CanvasDraw.bind(this),this._fps);
}


function Drawable() {
        
        this.x = 0;
        this.y = 0;
        this.w=0;
        this.h=0;
        this.r=0;
        this.font="18px Verdana";
        this.color="#FFE68C";//+Math.floor(Math.random()*16777215).toString(16);
        this.draw=function(ctx){
            console.log('Drawable draw not implemented.');
        }
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
        this.radius=function(r){
            if(undefined==r){
                return this.r;
            }else{
                this.r=r;
                return this;
            }
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
                 
}