
/*
  Catch the Banana
  - Player controls a basket at the bottom with left/right arrows (or touch)
  - Bananas fall from top; catch to score. Avoid rotten apples? (kept simple)
  - 30 second rounds. Slightly more advanced than minimal example but still lightweight.
*/
(function(){
  const canvas = document.getElementById('gameCanvas');
  if(!canvas) return; // only on play.html
  const ctx = canvas.getContext('2d');

  let W = canvas.width, H = canvas.height;
  let deviceRatio = window.devicePixelRatio || 1;
  function resizeCanvas(){
    const cssW = canvas.clientWidth || W;
    const cssH = canvas.clientHeight || H;
    canvas.width = cssW * deviceRatio;
    canvas.height = cssH * deviceRatio;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(deviceRatio,0,0,deviceRatio,0,0);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // game state
  const state = {
    running: false,
    score: 0,
    time: 30,
    objects: [], // falling items
    basket: {x: W/2 - 40, y: H - 60, w: 80, h: 40, speed: 6}
  };

  // create item types (banana good, rock bad)
  function spawnItem(){
    const size = rand(20,36);
    const x = rand(size, (canvas.clientWidth||W) - size);
    const type = Math.random() < 0.82 ? 'banana' : 'rock'; // mostly bananas
    state.objects.push({x, y: -size, size, speed: rand(1.6,3.4), type});
  }

  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  // input
  const keys = {left:false,right:false};
  window.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') keys.left=true; if(e.key==='ArrowRight') keys.right=true; });
  window.addEventListener('keyup', e=>{ if(e.key==='ArrowLeft') keys.left=false; if(e.key==='ArrowRight') keys.right=false; });

  // touch controls: simple left/right zones
  canvas.addEventListener('touchstart', function(e){
    const t = e.touches[0]; const rect = canvas.getBoundingClientRect();
    const x = t.clientX - rect.left;
    if(x < rect.width/2) keys.left = true; else keys.right = true;
  }, {passive:true});
  canvas.addEventListener('touchend', function(){ keys.left = keys.right = false; }, {passive:true});

  // game loop
  let spawnTimer = 0, last = performance.now();
  function loop(now){
    const dt = (now - last) / 1000; last = now;
    update(dt);
    render();
    if(state.running) requestAnimationFrame(loop);
  }

  function startGame(){
    // reset
    state.running = true; state.score = 0; state.time = 30; state.objects = [];
    document.getElementById('gameScore').textContent = state.score;
    document.getElementById('gameTime').textContent = state.time;
    // initial spawn burst
    for(let i=0;i<4;i++) spawnItem();
    last = performance.now();
    spawnTimer = 0;
    requestAnimationFrame(loop);
    timerInterval = setInterval(()=>{
      state.time -= 1;
      document.getElementById('gameTime').textContent = state.time;
      if(state.time <= 0){ endGame(false); }
    },1000);
  }

  function endGame(won){
    state.running = false;
    clearInterval(timerInterval);
    // show result modal (simple)
    setTimeout(()=>{
      alert(won ? `You caught ${state.score} bananas! Still not a website.` : `Time's up! You caught ${state.score} bananas. Still not a website.`);
    },100);
  }

  function update(dt){
    const width = canvas.clientWidth || W, height = canvas.clientHeight || H;
    // move basket
    if(keys.left) state.basket.x -= state.basket.speed;
    if(keys.right) state.basket.x += state.basket.speed;
    // clamp
    state.basket.x = Math.max(0, Math.min(state.basket.x, width - state.basket.w));

    // spawn periodically
    spawnTimer += dt;
    if(spawnTimer > 0.6){ spawnTimer = 0; spawnItem(); if(Math.random()<0.2) spawnItem(); }

    // update objects
    for(let i = state.objects.length -1; i>=0; i--){
      const o = state.objects[i];
      o.y += o.speed * (1 + state.score*0.02); // slightly accelerate with score
      // collision with basket
      if(o.y + o.size >= state.basket.y && o.x + o.size > state.basket.x && o.x < state.basket.x + state.basket.w){
        if(o.type === 'banana'){
          state.score += 1;
          document.getElementById('gameScore').textContent = state.score;
        } else {
          // rock: penalty
          state.score = Math.max(0, state.score - 2);
          document.getElementById('gameScore').textContent = state.score;
        }
        state.objects.splice(i,1);
        continue;
      }
      // off screen
      if(o.y > height + 50) state.objects.splice(i,1);
    }

    // win condition
    if(state.score >= 25){ endGame(true); }

    // update basket y to match canvas height (in case of resize)
    state.basket.y = (canvas.clientHeight || H) - 60;
  }

  function render(){
    const cw = canvas.clientWidth || W, ch = canvas.clientHeight || H;
    ctx.clearRect(0,0,cw,ch);
    // background grid subtle
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0,0,cw,ch);

    // draw objects
    state.objects.forEach(o=>{
      if(o.type === 'banana'){
        // yellow rounded rectangle (simple banana icon)
        ctx.fillStyle = '#F8B500';
        roundRect(ctx, o.x, o.y, o.size, o.size*0.6, 8, true, false);
        // small curve detail
        ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x + o.size*0.2, o.y + o.size*0.2); ctx.quadraticCurveTo(o.x + o.size*0.5, o.y + o.size*0.05, o.x + o.size*0.8, o.y + o.size*0.2); ctx.stroke();
      } else {
        // rock (bad)
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath(); ctx.arc(o.x + o.size/2, o.y + o.size/2, o.size/2, 0, Math.PI*2); ctx.fill();
      }
    });

    // draw basket
    ctx.fillStyle = '#E6EEF6';
    roundRect(ctx, state.basket.x, state.basket.y, state.basket.w, state.basket.h, 8, true, false);
    // basket hole
    ctx.fillStyle = '#081225'; ctx.fillRect(state.basket.x + 6, state.basket.y + 8, state.basket.w - 12, state.basket.h - 12);
  }

  function roundRect(ctx,x,y,w,h,r,fill,stroke){
    if(typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    if(fill) ctx.fill();
    if(stroke) ctx.stroke();
  }

  // helpers for randomness
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  // controls for start/reset
  document.getElementById('startGame').addEventListener('click', function(){
    if(state.running) return;
    startGame();
  });
  document.getElementById('resetGame').addEventListener('click', function(){
    state.objects = [];
    state.score = 0;
    state.time = 30;
    state.running = false;
    document.getElementById('gameScore').textContent = 0;
    document.getElementById('gameTime').textContent = 30;
    clearInterval(timerInterval);
    ctx.clearRect(0,0,canvas.width,canvas.height);
  });

  let timerInterval = null;

})();