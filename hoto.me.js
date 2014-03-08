$(function(){
  var c = initCanvas();

  setInterval(function(){
    c.clearCanvas();
    ripples = $.grep(ripples, function(e){ return e; });
    $.each(ripples, function(i, ripple){
      if (!ripple.draw()) { ripples[i] = undefined; }
    });
  }, 50);

  var p = { x: 0, y: 0 };
  $(document).click(function(e){ new Ripple(c, e) });
  $(document).mousemove(move);
  $(document).bind('touchstart', function(e){
    new Ripple(c, e.originalEvent.touches[0]);
  });
  $(document).bind('touchmove', function(e){
    move(e.originalEvent.touches[0]);
  });
  function move(e){
    var diff = Math.pow(p.x-e.clientX,2) + Math.pow(p.y-e.clientY,2);
    if (10000 < diff) {
      p = { x: e.clientX, y: e.clientY };
      new Ripple(c, e);
    }
  }

  var timer = false;
  $(window).resize(function(){
    if (timer !== false) { clearTimeout(timer); }
    timer = setTimeout(function() { c = initCanvas() }, 200);
  });
});

function initCanvas(){
  $('.background').remove();
  return $('<canvas/>').attr({
    width:  $(document).width(),
    height: $(document).height()
  }).addClass('background').prependTo('body');
}

var ripples = [];

var Ripple = function(c, e){
  this.c = c;
  this.x = e.clientX;
  this.y = e.clientY;
  this.r = 10;
  this.rmax = 200;
  ripples.push(this);
}

Ripple.prototype = {
  draw: function(){
    var alpha = 1 - this.r / this.rmax;
    this.c.drawEllipse({
      strokeStyle: 'rgba(255,255,255,' + alpha + ')',
      strokeWidth: 4,
      x: this.x,
      y: this.y,
      width: 2 * this.r,
      height: this.r
    });
    this.r += 10;
    return this.r < this.rmax;
  }
};

