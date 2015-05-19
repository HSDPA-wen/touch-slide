/**
 * Created by liuwentao on 2015/5/14.
 */

var events = ['touchstart','touchmove','touchend'];
if (window.navigator.msPointerEnabled) events = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
if (window.navigator.pointerEnabled) events = ['pointerdown', 'pointermove', 'pointerup'];
var touchEvents = {
    touchStart : events[0],
    touchMove : events[1],
    touchEnd : events[2]
}

var touchSlide =function(option) {
    this.option = option;
    this.init(option);
}

touchSlide.DEFAULTS = {
    boxId:"",
    direction:"horizontal", // horizontal | vertical
    width:"100%",
    height:"32%",
    allScreen:false,
    autoSlide:true,
    showNum:1,
    time:4,
    callback:function(i){}
}

touchSlide.prototype.init = function(option){
    this.option = this.extend(option , touchSlide.DEFAULTS);
    this.slideMove = 0;
    this.timer = null;
    this.dom = 0;

    var slideBox = document.querySelector(this.option.boxId);
    var slideUl =slideBox.getElementsByTagName("ul")[0];
    var slideLi = slideUl.querySelectorAll("ul li");
    var pointBox = slideBox.getElementsByTagName("ol")[0];

    this.afterBox = document.createElement("div");
    this.afterBox.className = "after-box";
    slideBox.appendChild(this.afterBox);

    if(this.option.showNum < 1 || this.option.showNum > slideLi.length){
        this.option.showNum = 1;
    }

    this.index = this.option.showNum-1;

    this.setParameters(slideBox , slideUl ,slideLi,pointBox);
    this.resize(slideBox,slideUl);
}
/* extend */
touchSlide.prototype.extend = function _extend(options , defaultsOptions) {
    for (var name in defaultsOptions) {
        if (defaultsOptions.hasOwnProperty(name)) {
            //当前属性是否为对象,如果为对象，则进行递归
            if ((defaultsOptions[name] instanceof Object) && (options[name] instanceof Object)) {
                _extend(defaultsOptions[name], options[name]);
            }
            //检测该属性是否存在
            if (options.hasOwnProperty(name)) {
                continue;
            } else {
                options[name] = defaultsOptions[name];
            }
        }
    }
    return options;
};
/*判断图片是否加载完成*/
touchSlide .prototype.imgLoad=function(slideLi ,i ,slideUl, pointBox){
    var arrImg = slideLi[i].querySelector("a img").getAttribute("data-src");
    var _this=this;
    var img = new Image();
    img.onload = function () {
        console.log(arrImg)
        slideLi[i].querySelector("a img").src = arrImg;
        if(_this.option.showNum == i){

        }
    }
    img.src = arrImg;
}

/*1.0s后加载其他帧图片*/
touchSlide.prototype.loadAntherImg=function(slideLi ,slideUl, pointBox){
    var _this=this;
    setTimeout(function(){
        for(var i=0;i<slideLi.length;i++){
            if(i != _this.option.showNum ){
                _this.imgLoad(slideLi,i);
            }
        }
    },1000);
}

/*初始化设置*/
touchSlide.prototype.setParameters = function(slideBox , slideUl , slideLi ,pointBox){
    //宽度、高度的初始化
    this.setBoxSize(slideBox);
    if(slideLi.length > 1) {
        //li的初始化
        var copySlideFirst = slideLi[0].cloneNode(true);
        var copySlideLast = slideLi[slideLi.length-1].cloneNode(true);
        slideUl.insertBefore(copySlideLast,slideLi[0]);
        slideUl.appendChild(copySlideFirst);
        slideLi = slideUl.querySelectorAll("ul li");
        //显示帧初始化
        pointBox.querySelectorAll("li")[this.index].className = "cur";
        for(var i =0 ; i<slideLi.length ; i++ ){
            this.cssChange(slideLi[i],this.slideMove* (i-1));
        }
        if(this.option.showNum != 1){
            this.cssChange(slideUl,parseInt(-this.slideMove*(this.index)));
            this.dom  = parseInt(-this.slideMove*this.index);
        }
        //加载显示帧以及前后各一帧图片
        this.imgLoad(slideLi ,this.index+1,slideUl, pointBox);
        this.touchShow(slideUl, pointBox);
        if(this.option.autoSlide) this.timeAuto(slideUl, pointBox);
        //加载其他帧图片
        this.loadAntherImg(slideLi);
    }else{
        this.imgLoad(slideLi ,this.index , slideUl, pointBox);
        slideBox.removeChild(pointBox);
    }
}
/*设置轮播大小*/
touchSlide.prototype.setBoxSize = function(slideBox){
    slideBox.style.width = this.option.width;
    this.afterBox.style.paddingTop = this.option.height;
    switch(this.option.direction){
        case "horizontal":
            this.slideMove = (this.option.width.indexOf("%") > 0) ? (document.documentElement.clientWidth * parseInt(this.option.width) / 100 ) :(parseInt(this.option.width));
            break;
        case "vertical":
            this.slideMove = (this.option.width.indexOf("%") > 0)?(document.documentElement.clientWidth * parseInt(this.option.width) * parseInt(this.option.height)/10000):(parseInt(this.option.width) * parseInt(this.option.height)/100);
            break;
        default : break;
    }
    if(this.option.allScreen){
        slideBox.style.width="100%";
        slideBox.style.height="100%";
        if(this.option.direction == "horizontal"){
            this.slideMove = document.documentElement.clientWidth ;
        }else if(this.option.direction == "vertical"){
            this.slideMove = document.documentElement.clientHeight ;
        }
     }
    this.slideMove = parseInt(this.slideMove);
}

touchSlide.prototype.touchShow = function(slideUl , pointBox){
    var _this = this;
    var start = 0;   //touchStart x/y
    var cur = 0;
    var move = 0;

    slideUl.addEventListener(touchEvents.touchStart,function(e){
        if(_this.option.autoSlide) clearInterval(_this.timer);
        slideUl.style.transition = "all 0s ease 0s";
        slideUl.style.webkitTransition = "all 0s ease 0s";
        if(_this.option.direction == "horizontal"){
            start= e.touches[0].pageX ;
        }else if(_this.option.direction == "vertical"){
            start= e.touches[0].pageY ;
        }
    });
    slideUl.addEventListener(touchEvents.touchMove,function(e){
        // 禁止滑动事件
        e.preventDefault();
        // 手指拖拽DOM时的坐标
        if(_this.option.direction == "horizontal"){
            cur = e.touches[0].pageX ;
        }else if(_this.option.direction == "vertical"){
            cur = e.touches[0].pageY ;
        }
        // 总距离
        move = cur - start;
        _this.cssChange(slideUl,_this.dom+move);
    });

    slideUl.addEventListener(touchEvents.touchEnd,function(){
        if(Math.abs(move) > 50 ){
            _this.dom += move;
            var pointLength = pointBox.querySelectorAll("li").length-1;
            _this.index = (move < 0) ?((_this.index >= pointLength) ? 0 :(_this.index+1) ):((_this.index <= 0) ? pointLength : (_this.index-1));
            if(_this.index==0 &&  move < 0){
                _this.cssChange(slideUl,(_this.slideMove+_this.dom%_this.slideMove));
            }else if(_this.index==pointLength &&  move > 0){
                _this.cssChange(slideUl,(-_this.slideMove*(_this.index+1)+_this.dom%_this.slideMove));
            }
        }
        _this.slideItem(slideUl , pointBox , _this.index ,pointLength );

        if(_this.option.autoSlide)  _this.timeAuto(slideUl,pointBox);
    });
}

touchSlide.prototype.cssChange = function(obj,style){
    var cssValue = "";
    if(this.option.direction == "horizontal"){
        cssValue=style+"px,0,0";

    }else if(this.option.direction == "vertical"){
        cssValue = "0,"+style+"px,0";
    }
    obj.style.transform = "translate3d("+cssValue+")";
    obj.style.webkitTransform ="translate3d("+cssValue+")";
    obj.style.msTransform ="translate3d("+cssValue+")";
}
/*自动轮播/hover上去停止*/
touchSlide.prototype.timeAuto=function(slideUl,pointBox){
    var _this = this;
    this.timer = setInterval(function(){
        var pointLength = pointBox.querySelectorAll("li").length-1;
        if(_this.index ==pointLength){
            _this.index=0;
        }else{
            _this.index++;
        }
        if(_this.index==0){
            slideUl.style.transition = "all 0s ease 0s";
            slideUl.style.webkitTransition = "all 0s ease 0s";
            _this.cssChange(slideUl,_this.slideMove);
        }
        _this.slideItem(slideUl , pointBox , _this.index ,pointLength );
    },this.option.time*1000);
}
//移动单屏动画
touchSlide.prototype.slideItem = function(slideUl , pointBox , liIndex , pointLength){
    var _this = this;
    for(var k=0;k<=pointLength;k++){
        pointBox.querySelectorAll("li")[k].className = "";
    }
    pointBox.querySelectorAll("li")[liIndex].className = "cur";
    setTimeout(function(){
        slideUl.style.transition = "all 0.3s ease 0s";
        slideUl.style.webkitTransition = "all 0.3s ease 0s";
        _this.cssChange(slideUl,-_this.slideMove*liIndex);
    },20);
    this.dom  = -this.slideMove*liIndex;
    if(this.option.callback){
        this.option.callback(liIndex);
    }
}

touchSlide.prototype.resize = function(slideBox , slideUl){
    var _this = this;
    window.addEventListener("resize",function(){
        _this.setBoxSize(slideBox);
        var slideLi = slideUl.querySelectorAll("li");
        for(var i =0 ; i<slideLi.length ; i++ ){
            _this.cssChange(slideLi[i],_this.slideMove* (i-1));
        }
        _this.cssChange(slideUl,-_this.slideMove* _this.index);
        _this.dom  = -_this.slideMove*_this.index;
    });
}

var slide = function(option){
    var options = typeof option == 'object' && option;
    return new touchSlide(options);
}
