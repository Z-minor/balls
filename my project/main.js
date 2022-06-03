// 設置畫布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let fails = 0;
let alive = 15;
let deathX;
let deathY;
let deathC;
let hp = 5;
let backgroundHue = 255;
let after42 = 0
let hardMode = 0;

// 滑鼠位子監聽+繪製鼠標小球

let mouse = {
    x : 0,
    y : 0,
}

window.addEventListener('mousemove',(event) => {
  mouse.x = event.pageX;
  mouse.y = event.pageY;
})

function drawMe() {
  ctx.beginPath();
  ctx.fillStyle = 'hsla(0,100%,100%,0.8)';
  ctx.shadowColor = 'white';
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;
  ctx.arc(mouse.x, mouse.y, 5 , 0, 2 * Math.PI);
  ctx.fill();
};


// 生成隨機數的函數

function random(min,max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
}

// 生成常態分佈隨機數的函數

function randomND(min,max){
  var sum = 0;
  for(var k = 0; k < 20; k++){
    sum += Math.floor(Math.random() * 2);
  }
  sum *= (max-min)/20;
  sum += min;
  return sum;
}


// 定義 Ball 構造器

function Ball(x, y, velX, velY, size) {
  this.x = x;
  this.xr = 0; 
  this.y = y;
  this.yr = 0;
  this.velX = velX;
  this.velY = velY;
  this.speed = Math.sqrt(velX*velX+velY*velY);
  this.hue = random(0, 360);
  this.saturation = random(40, 101);
  this.size = size;
  this.d = (this.velX*this.velX+this.velY*this.velY)/40*Math.random()+0.5;
  this.baby = 0;
}

// 寶寶無害期
  Ball.prototype.babies = function() {
    if(this.baby<200){
      this.baby++;
    }
  }
  
// 受傷後自身消散效果
  
  function disappear(){
  ctx.beginPath();
  ctx.fillStyle = `hsla(${deathC},100%,95%,${((alive)/33)-2})`;
  ctx.shadowColor = 'white';
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;
  ctx.arc(deathX, deathY, (110-alive)*7, 0, 2 * Math.PI);
  ctx.fill();
  }

// 受傷後生命量條變黑動畫

   function injuried(){
     document.getElementById(`l${hp+1}`).style.backgroundColor = `hsla(0,100%,0%,${(100-alive)/100})`;
     document.getElementById(`l${hp+1}`).style.boxShadow = `0px 0px 5px hsla(250,100%,0%,${(100-alive)/100})`;
   };

// 重生效果
  

  function appear(){
  ctx.beginPath();
  ctx.fillStyle = `hsla(0,100%,100%,${(1-(alive)/15)})`;
  ctx.shadowColor = 'white';
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;
  ctx.arc(mouse.x, mouse.y, (alive+4), 0, 2 * Math.PI);
  ctx.fill();
  };
  



// 定義彩球繪製函數

Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = `hsla(${this.hue},${this.saturation}%,50%,${this.baby/500})`;
  //ctx.strokeStyle = `hsla(${this.hue},${this.saturation}%,90%,${this.baby/1000})`;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.shadowColor = `hsla(${this.hue},${this.saturation}%,10%,1)`;
  ctx.shadowOffsetY = 10;
  ctx.shadowOffsetX = 10;
  ctx.shadowBlur = 10;
  ctx.fill();
  //ctx.stroke();
};

// 定義彩球位移兼邊界回彈函數

Ball.prototype.update = function() {
  if((this.x + this.size - 50) >= width && this.velX > 0) {
    this.velX = -(this.velX);
  }
  
  if((this.x - this.size + 50) <= 0 && this.velX < 0) {
    this.velX = -(this.velX);
  }

  if((this.y + this.size - 50) >= height && this.velY > 0) {
    this.velY = -(this.velY);
  }

  if((this.y - this.size + 50) <= 0 && this.velY < 0) {
    this.velY = -(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;
};

// 定義碰撞檢測函數

Ball.prototype.collisionDetect = function() {
  
  
  //球與鼠標間的碰撞
  
  if(this.baby > 150 && alive ==1){
    if(Math.sqrt((mouse.x-this.x)*(mouse.x-this.x)+(mouse.y-this.y)*(mouse.y-this.y))<5+this.size){
      this.size /=3;
      alive = 100;
      deathX = mouse.x;
      deathY = mouse.y;
      deathC = this.hue;
      if(hp>0){
        //document.getElementById(`l${hp}`).style.backgroundColor = "black";
        //document.getElementById(`l${hp}`).style.boxShadow = "0px 0px 5px hsla(250,100%,0%,0.8)";
        hp--;
      }
      if(hp==0){
        return 0;
      }
    }
  }  
     
  //球與球間的碰撞
  
  for(let j = 0; j < balls.length; j++) { 
    if(this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const xx = (dx>0) ? 1 : -1 ;
      const yy = (dy>0) ? 1 : -1 ;
      const ratio = (dx * dx)/(dy * dy)
      const distance = Math.sqrt(dx * dx + dy * dy);

      
      
      if (distance < this.size + balls[j].size) {
        if(hardMode*(1||this.hue>352||this.hue<9||balls[j].hue>352||balls[j].hue<9)){
          
          //更新兩球的.velX與.velY
          
          
          this.velX = xx*Math.sqrt(this.speed*this.speed/(1+1/(ratio*ratio)));
          this.velY = yy*Math.sqrt(this.speed*this.speed/(ratio*ratio+1));
          balls[j].velX = -xx*Math.sqrt(balls[j].speed*balls[j].speed/(1+1/(ratio*ratio)));
          balls[j].velY = -yy*Math.sqrt(balls[j].speed*balls[j].speed/(ratio*ratio+1));
        }
        
        this.hue += 1;
        balls[j].hue += 1;
        if(this.hue >= 360){
          this.hue = 0;
        }
        if(balls[j].hue >= 360){
          balls[j].hue = 0;
        }
        this.size += this.d*0.8;
        if(this.size>height/8){
          this.size += this.d*(this.size-height/8)/20;
        }
        balls[j].size += balls[j].d;
        
      }
    }
  }
  return 1;
};

// 用來反轉size增減方向的函數

Ball.prototype.r = function() {
  if (this.size > width/8 + balls.length/2 || this.size > height/8 + balls.length/2){
    this.d = -(this.velX*this.velX+this.velY*this.velY)/50*Math.random();
  }
  if (this.size < width/100 || this.size < height/100){
    this.d = (this.velX*this.velX+this.velY*this.velY)/50*Math.random();
  }
};

// 定義一個數組，定時生成並保存所有的新球

let balls = [];
let count = 0;

function createballs() {
  if((balls.length < (count)/8-Math.pow((balls.length),1.5) && balls.length < 42) || balls.length >= 42 ) {
    let size = random(10,height/2-count/150);
    if(balls.length>=42){
      size += balls.length*3;
    }
    let ball = new Ball(
    
      random(0 + size, width - size),
      random(0 + size, height - size),
      randomND(-5-balls.length/7,5+balls.length/7),
      randomND(-5-balls.length/7,5+balls.length/7),
      size
    );
    balls.push(ball);
  }
}

// 定義一個循環來不停地播放

function loop() {
  
  if(count==0){
    document.getElementById("w42").style.textShadow = '0 0 4px hsla(0,100%,100%,0)'
    for(let k = 1;k<6;k++){
      document.getElementById(`l${k}`).style.backgroundColor = "hsla(0,100%,100%,0.6)";
      document.getElementById(`l${k}`).style.boxShadow = "0px 0px 5px hsla(260,100%,100%,0.8)";
    }
    document.querySelector("body").removeEventListener("click",loop);
  }
  
  
  if((hardMode==0&&balls.length<=42)||hardMode==1){
    

  
    if(balls.length<42){
      createballs();
    }
    else{
      after42++;
      if(after42>120){
        after42=85;
        createballs();
      }
    }
  
    if(balls.length < 42){
      ctx.fillStyle = `hsla(255,40%,${10+balls.length}%,1)`;
      ctx.fillRect(0,0,width,height);
    }
    else{
      ctx.fillStyle = `hsla(${backgroundHue},60%,50%,1)`;
      ctx.fillRect(0,0,width,height);
      backgroundHue += 2;
      if(backgroundHue >= 360){
        backgroundHue = 0;
      }
    }
  
    if(alive>20){
      injuried();
    }
    if(alive>15){
      disappear();
      alive--;
    }
    if(alive<16 && alive>1){
      appear();
      alive--;
    }
    if(mouse.x!=0 && mouse.y!=0 && alive==1){
      drawMe();
    }
    for(let i = 0; i < balls.length; i++) {
      balls[i].babies();
      balls[i].r();
      balls[i].draw();
      balls[i].update();
      if(balls[i].collisionDetect()==0){
        break;
      }
    }
    if(hp>0){
      if(count<6200){
        count++;
      }
      if((balls.length<43&&hardMode==0)||hardMode==1){
        document.querySelector(".number").textContent = `${balls.length}`;
      }
      document.querySelector(".number").style.color= `hsla(0,100%,100%,${(count/150+1)/200})`;
      document.querySelector(".number").style.textShadow =`0 0 0.04em hsla(0,100%,100%,${(count/150+1)/200})`;
      document.querySelector(".number").style.fontSize = `${(count/150+10)}vw`;
    
      requestAnimationFrame(loop);
    }
    else{
      fails = 50;
      fail();
    }
  }
  else{
    fails = 50;
    fail();
  }
}

loop();

// 結束函數
function fail() {
  ctx.fillStyle = `hsla(0,0%,0%,0.1)`;
  ctx.fillRect(0,0,width,height);
  if(hp<1){
    injuried();
  }
  alive--;
  alive--;
  if(fails>0){
    fails--;
    requestAnimationFrame(fail);
  }
  else{
    if(balls.length >= 42&&hardMode==0){
      document.getElementById("w42").textContent = "《 you got 42! 已解鎖擁擠模式：更難，更緊 張。》";
      hardMode = 1;
    }
    else if(balls.length >= 42&&hardMode==1){
      document.getElementById("w42").textContent = "《 you got 42! 》";
    }
    else{
      document.getElementById("w42").textContent = "《 where's 42? 》"
    }
    document.getElementById("w42").style.textShadow = '0 0 4px hsla(0,100%,100%,0.5)';
    hp = 5;
    count = 0;
    alive = 15;
    balls = [];
    document.querySelector("body").addEventListener("click",loop);
  }
};