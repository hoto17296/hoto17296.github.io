/*!
 * ripple.js
 *
 * Copyright (c) 2014 Yuki Ishikawa (@hoto17296).
 * http://hoto.me/
 */

(function($){
  var self;
  var canvas;
  var settings = {
    class       : 'background',
    refreshRate : 50,
    rainfall    : 75, // 0-100
    pace        : 100,
    ripple: {
      min       : 10,
      max       : 200,
      thickness : 4,
      velocity  : 10
    }
  };
  var pos = { x: 0, y: 0 };
  var timer = false;
 
  $.fn.ripple = function(options){
    self = this;
    settings = $.extend(settings, options);
    canvas = initCanvas(self);
    setInterval(refresh, settings.refreshRate);

    $(window).resize(resize);

    setInterval(rainfall, 1000 - settings.rainfall * 10);

    $(document).click(function(e){ new Ripple(e) });
    $(document).mousemove(step);
    $(document).bind('touchstart', function(e){
      new Ripple(e.originalEvent.touches[0]);
    });
    $(document).bind('touchmove', function(e){
      step(e.originalEvent.touches[0]);
    });
  };

  function initCanvas(){
    $('.' + settings.class, self).remove();
    return $('<canvas/>').attr({
      width:  $(document).width(),
      height: $(document).height()
    }).addClass(settings.class).prependTo(self);
  };

  function refresh(){
    canvas[0].getContext('2d').clearRect(0, 0, canvas.width(), canvas.height());
    ripples = $.grep(ripples, function(e){ return e; });
    $.each(ripples, function(i, ripple){
      if (!ripple.draw()) { ripples[i] = undefined; }
    });
  };

  function rainfall(){
    new Ripple({
      clientX: Math.floor( Math.random() * canvas.width() ),
      clientY: Math.floor( Math.random() * canvas.height() )
    });
  };

  function step(e){
    var diff = Math.pow(pos.x-e.clientX,2) + Math.pow(pos.y-e.clientY,2);
    if (Math.pow(settings.pace,2) < diff) {
      pos = { x: e.clientX, y: e.clientY };
      new Ripple(e);
    }
  };

  function resize(){
    if (timer !== false) { clearTimeout(timer) }
    timer = setTimeout(function() { canvas = initCanvas(self) }, 200);
  };

  var ripples = [];
  
  var Ripple = function(e){
    this.x = e.clientX;
    this.y = e.clientY;
    this.r = settings.ripple.min;
    ripples.push(this);
  };

  Ripple.prototype.draw = function(){
    var alpha = 1 - this.r / settings.ripple.max;
    var ctx = canvas[0].getContext('2d');
    ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.lineWidth = settings.ripple.thickness;
    ctx.ellipse({
      x: this.x, width: this.r * 2,
      y: this.y, height: this.r
    });
    ctx.stroke();
    this.r += settings.ripple.velocity;
    return this.r < settings.ripple.max;
  };
  
  CanvasRenderingContext2D.prototype.ellipse = function(arg){
    var cnt = arg || 0;
    var x = (cnt.x) ? cnt.x : 0;
    var y = (cnt.y) ? cnt.y : 0;
    var width = (cnt.width) ? cnt.width : 0;
    var height = (cnt.height) ? cnt.height : 0; 
    var radW = width/2;
    var radH = height/2;
    this.beginPath();
    this.bezierCurveTo(x, y - radH, x + radW , y - radH, x + radW, y);
    this.bezierCurveTo(x + radW, y, x + radW, y + radH, x, y + radH);
    this.bezierCurveTo(x, y + radH, x - radW, y + radH, x - radW, y);
    this.bezierCurveTo(x - radW, y, x - radW, y - radH, x, y - radH);
  };

})(jQuery);
