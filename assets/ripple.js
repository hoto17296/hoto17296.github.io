/**
 * ripple.js v2.0.0
 *
 * Copyright 2017 Yuki Ishikawa (@hoto17296)
 * Released under the MIT license
 */

class Ripple {
  constructor(elem, opts, w) {
    this.elem = elem;
    this.opts = Object.assign({
      rainfallAmount: 0.8, // 0 - 1
      strideLength: 100,   // px
      resizeDelay: 200,    // msec
    }, opts);
    this.w = w || window;
    this.d = this.w.document;
    this.drops = [];

    this.init();

    // ウィンドウサイズが変わったら初期化
    this.w.addEventListener('resize', () => {
      if ( this.resizeInterval ) this.w.clearTimeout( this.resizeInterval );
      this.resizeInterval = this.w.setTimeout(this.init.bind(this), this.opts.resizeDelay);
    });

    // クリック/タップしたら波紋を追加
    this.elem.addEventListener('click', (event) => {
      const pos = new Position( event.clientX, event.clientY );
      this.addDrop(pos);
    });
    this.elem.addEventListener('touchstart', (event) => {
      const pos = new Position( event.clientX, event.clientY );
      this.addDrop(pos);
    });

    // カーソル/指を動かしたら波紋を追加
    this.elem.addEventListener('mousemove', (event) => {
      const pos = new Position( event.clientX, event.clientY );
      this.stride(pos);
    });
    this.elem.addEventListener('touchmove', (event) => {
      const pos = new Position( event.touches[0].clientX, event.touches[0].clientY );
      this.stride(pos);
    });
  }

  init() {
    if ( this.canvas ) this.canvas.remove();
    this.canvas = this.d.createElement('canvas');
    this.canvas.setAttribute('width', this.elem.clientWidth);
    this.canvas.setAttribute('height', this.elem.clientHeight);
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.bottom = 0;
    this.canvas.style.zIndex = 0;
    this.elem.appendChild( this.canvas );

    if ( this.animationRequestId ) this.w.cancelAnimationFrame( this.animationRequestId );
    this.render();
  }

  render() {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.drops = this.drops.filter((drop) => drop.draw());
    this.rainfall();
    this.animationRequestId = this.w.requestAnimationFrame( this.render.bind(this) );
  }

  addDrop(pos) {
    this.drops.push( new Drop(this.canvas, pos, this.opts.drop) );
  }

  stride(pos) {
    if ( ! this.recentStridePos ) this.recentStridePos = new Position();
    if ( this.opts.strideLength < this.recentStridePos.diff(pos) ) {
      this.recentStridePos = pos;
      this.addDrop(pos);
    }
  }

  rainfall() {
    const area = this.canvas.clientWidth * this.canvas.clientHeight;
    const freq = Math.pow(10, this.opts.rainfallAmount * 2 - 8);
    if ( Math.random() > area * freq ) return;
    const r = ( this.opts.drop ? this.opts.drop.max : 0 ) || 0;
    const pos = new Position(
      Math.floor( Math.random() * ( this.canvas.clientWidth + r * 2 ) - r ),
      Math.floor( Math.random() * ( this.canvas.clientHeight + r ) - r / 2 )
    );
    this.addDrop(pos);
  }
}

class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  diff(pos) {
    const diffPow = {
      x: Math.pow(this.x - pos.x, 2),
      y: Math.pow(this.y - pos.y, 2),
    };
    return Math.sqrt( diffPow.x + diffPow.y );
  }
}

class Drop {
  constructor(canvas, pos, opts) {
    this.opts = Object.assign({
      min: 10,       // px
      max: 200,      // px
      thickness: 4,  // px
      velocity: 0.5, // 0 - 1
      color: { r: 255, g: 255, b: 255 },
    }, opts);
    this.canvas = canvas;
    this.pos = pos;
    this.r = this.opts.min;
  }

  draw() {
    const alpha = 1 - this.r / this.opts.max;
    const ctx = this.canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(' + [ this.opts.color.r, this.opts.color.g, this.opts.color.b, alpha ].join(',') + ')';
    ctx.lineWidth = this.opts.thickness;
    ctx.ellipse({ pos: this.pos, width: this.r * 2, height: this.r });
    ctx.stroke();
    this.r += this.opts.velocity * 10;
    return this.r < this.opts.max;
  }
}

CanvasRenderingContext2D.prototype.ellipse = function(args) {
  const x = args.pos.x, w = args.width / 2;
  const y = args.pos.y, h = args.height / 2;
  this.beginPath();
  this.bezierCurveTo(x,   y-h, x+w, y-h, x+w, y  );
  this.bezierCurveTo(x+w, y,   x+w, y+h, x,   y+h);
  this.bezierCurveTo(x,   y+h, x-w, y+h, x-w, y  );
  this.bezierCurveTo(x-w, y,   x-w, y-h, x,   y-h);
};
