/*!
 * ripple.js v1.1
 *
 * Copyright 2014 Yuki Ishikawa (@hoto17296)
 * Released under the MIT license
 * http://hoto.me/
 */

(function($){
  var self;
  var $canvas;
  var settings = {
    refreshRate : 50,
    rainfall    : 50,
    pace        : 100,
    ripple: {
      min       : 10,
      max       : 200,
      thickness : 4,
      velocity  : 10
    }
  };
  var $d = $(document);
  var pos = { x: 0, y: 0 };
  var rainfallInterval;
  var resizeInterval;

  $.fn.ripple = function(options){
    self = this;
    settings = $.extend(settings, options);

    init();

    setInterval(refresh, settings.refreshRate);

    $(window).resize(resize);
    $d.click(function(e){ new Ripple(e) });
    $d.mousemove(step);
    $d.bind('touchstart', function(e){
      new Ripple(e.originalEvent.touches[0]);
    });
    $d.bind('touchmove', function(e){
      step(e.originalEvent.touches[0]);
    });
  };

  function init(){
    if ($canvas) { $canvas.remove(); }
    $canvas = $('<canvas/>')
      .attr({ width: $d.width(), height: $d.height() })
      .css({ position: 'fixed', top: 0, left: 0, 'z-index': -1 })
      .prependTo(self);

    if (rainfallInterval) { clearInterval(rainfallInterval) }
    var frequency = $canvas.width() * $canvas.height() * settings.rainfall;
    rainfallInterval = setInterval(rainfall, 0xffffffff / frequency);
  };

  function refresh(){
    $canvas[0].getContext('2d').clearRect(0, 0, $canvas.width(), $canvas.height());
    ripples = $.grep(ripples, function(e){ return e; });
    $.each(ripples, function(i, ripple){
      if (!ripple.draw()) { ripples[i] = undefined; }
    });
  };

  function rainfall(){
    var r = settings.ripple.max;
    new Ripple({
      clientX: Math.floor( Math.random() * ( $canvas.width() + r * 2 ) - r ),
      clientY: Math.floor( Math.random() * ( $canvas.height() + r ) - r / 2 )
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
    if (resizeInterval) { clearTimeout(resizeInterval) }
    resizeInterval = setTimeout(init, 200);
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
    var ctx = $canvas[0].getContext('2d');
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

  CanvasRenderingContext2D.prototype.ellipse = function(args){
    var x = args.x, w = args.width / 2;
    var y = args.y, h = args.height / 2;
    this.beginPath();
    this.bezierCurveTo(x,   y-h, x+w, y-h, x+w, y);
    this.bezierCurveTo(x+w, y,   x+w, y+h, x,   y+h);
    this.bezierCurveTo(x,   y+h, x-w, y+h, x-w, y);
    this.bezierCurveTo(x-w, y,   x-w, y-h, x,   y-h);
  };

})(jQuery);
