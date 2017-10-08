    const canvasJoy = document.getElementById("cnvsJoy");
    const ctxJoy = canvasJoy.getContext("2d");
    const rectJoy = canvasJoy.getBoundingClientRect();
    let mdown = false;
    let posJoy = setCenter(rectJoy);
    let vel = setVel();

    canvasJoy.addEventListener("mousedown", inputStart, false);
    canvasJoy.addEventListener("mouseup", inputEnd, false);
    canvasJoy.addEventListener("mouseout", function() { mdown = false; }, false);
    canvasJoy.addEventListener('mousemove', inputMove, false);
    canvasJoy.addEventListener("touchstart", inputStart, false);
    canvasJoy.addEventListener("touchend", inputEnd, false);
    canvasJoy.addEventListener("touchmove", inputMove, false);

    /* first run time set defaults also */
    ctxJoy.lineWidth = 1;
    inputEnd() ;

    function inputStart() {
      mdown = true;
    }
    function inputEnd() {
      moveCenter();
      mdown = false;
      vel.linearX = 0.0;
      vel.linearY = 0.0;
      printPos();
      drawJoyField();
    }
    function inputMove(e) {
      if(mdown) {
        getMousePos(e);
        getVel();
        printPos();
        drawJoyHandle();
      }
    }

    function getVel() {
      /*
        remember x in Browser is y in robot !
        nur Werte im Bereich -50.0 <-> 50.0 (Ziel nur ganze Zahlen)
        Da ros Floats erwartet eben als Komma Zahlen
      */
      if (posJoy.y < rectJoy.height / 2){
        vel.linearX = Math.round(rectJoy.height / 2 - posJoy.y);
      }else {
        vel.linearX = Math.round(0 - posJoy.y / 2);
      }
      if (posJoy.x < rectJoy.width / 2){
        vel.linearY = Math.round(rectJoy.width / 2 - posJoy.x);
      }else {
        vel.linearY = Math.round(0 - posJoy.x /2);
      }
    }
    function getMousePos(evt) {
      posJoy.x =  Math.round(evt.clientX - rectJoy.left);
      posJoy.y = Math.round(evt.clientY - rectJoy.top);
    }

    function setCenter(rectJoy){
      var center = {
        cx: Math.round(rectJoy.right/2),
        cy: Math.round(rectJoy.bottom/2),
        velX: 0.0,
        velY: 0.0
      }
      return center;
    }
    function setVel(){
      var vel = {
          linearX: posJoy.x,
          linearY: posJoy.y,
          linearZ: 0.0,
          angularX: 0.0,
          angularY: 0.0,
          angularZ: 0.0
      };
      return vel;
    }

    function moveCenter(){
      inputMove({ clientX: posJoy.cx, clientY: posJoy.cy});
    }
    function printPos() {
      $("#lblVel").val(" " + vel.linearX + "," + vel.linearY);
      showMoveResult(JSON.stringify(vel));    //here we talk to the robot
    }
    function drawJoyHandle() {
      ctxJoy.clearRect(0, 0, rectJoy.width, rectJoy.height);
      drawJoyField();
    }
    function drawJoyField() {
      ctxJoy.beginPath();
      ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,25,0,2*Math.PI);
      ctxJoy.stroke();
      ctxJoy.beginPath();
      ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,40,0,2*Math.PI);
      ctxJoy.stroke();
      if(mdown === false){
        ctxJoy.beginPath();
        ctxJoy.arc(rectJoy.width/2,rectJoy.height/2,10,0,2*Math.PI);
        ctxJoy.globalAlpha=0.5;
        ctxJoy.fillStyle = 'orange';
        ctxJoy.fill();
        ctxJoy.stroke();
      }else{
        ctxJoy.beginPath();
        ctxJoy.arc(posJoy.x, posJoy.y, 10, 0, 2 * Math.PI, false);
        ctxJoy.globalAlpha=1.0;
        ctxJoy.fillStyle = 'orange';
        ctxJoy.fill();
        ctxJoy.stroke();
      }
}
