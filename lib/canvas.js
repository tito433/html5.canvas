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
    
    var parent=undefined!=dom && this.isDom(dom)?dom:document.body;
    var canvas=parent.getElementsByTagName ('canvas');
    if(canvas.length==0){
        canvas=parent.appendChild(document.createElement('canvas'));
        canvas.width=parent.clientWidth;
        canvas.height=parent.clientHeight;
    }else{
        canvas=canvas[0];
    }
    this.width=canvas.width;
    this.height=canvas.height;
    

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
}


function Drawable() {
        
        this.x = 0;
        this.y = 0;
        this.w=0;
        this.h=0;
        this.r=0;
        this.label=false;

        this.fontName="Verdana";
        this.fontSize=14;
        this.color=Math.floor(Math.random()*16777215).toString(16);
        
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
        this._centerLabel=function(ctx){
            var lines=this.label,
                eh=ctx.measureText('M').width,
                height=eh*(lines.length+1);

            
                var lx = 0,ly =  this.y+(this.h - height)/2;

                for (var index in lines) {
                    var curW=ctx.measureText(lines[index]).width;
                    lx = this.x + Math.abs(this.w-curW)/2;
                    ctx.fillText(lines[index], lx, ly);
                    ly+=eh;
                }
            
          }         
}
Drawable.prototype.draw=function(ctx){
    ctx.textBaseline="top";
    ctx.font=this.fontSize+'px '+this.fontName;
    ctx.fillStyle=this.color;
    if(this.label){
        this._centerLabel(ctx);
    }
}

function Layout(w,h){
    this.width=w;
    this.height=h;
    this.colCount=7;
    this.padding=10;

    this.position=function(drawables){
        var size=Math.min(this.width,this.height),
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
                if(x>this.width||x+w>this.width){
                  x=0;y+=h;
                }
            }
        }
    }
}