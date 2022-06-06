// 設置畫布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let heart = document.getElementById("heart");
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let 短邊;
if (width>height){
  短邊 = height;
}
else{
  短邊 = width;
}

let 計時器 = 0;
let fails = 0;
let alive = 15;
let deathX;
let deathY;
let deathC;
let hp = 4;
let backgroundHue = 255;
let after42 = 0
let hardMode = 0;
let i = 0;
let j = 0;
let k = 0;
let l = 0;
let n = 0;
let 血量 = [1,1,1,1,0];
let 補血道具重生計時 = 0;
let 補血道具x;
let 補血道具y;
let 炸彈爆炸特效定位與計時 = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

//k = 碰撞檢測隨機起始點（已棄用）：為了避免晚出生的球，在碰撞檢測方面的優先度一率會覆蓋早出生的球。實驗證明效果不好，會使得球大量重疊時容易在原地打轉。



/*if (confirm("是否直接進入第二關？")) {
  hardMode = 1;
*/


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

  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 短邊/5 , 0, 2 * Math.PI);
  ctx.shadowColor = `hsla(30,100%,100%,1)`;
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowBlur = 20;
  ctx.lineWidth = 1;
  ctx.strokeStyle = `hsla(0,100%,100%,${0.5*(Math.abs(計時器%140-70))/70+0.1})`;
  ctx.stroke();
};


// 生成隨機數的函數

function random(min,max) {
  const num = Math.floor(Math.random() * ((max - min) + 1)) + min;
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
  this.hue = random(230, 280);
  this.hueD = random(0, 1);
  this.saturation = random(40, 100);
  this.lightness = randomND(50, 80);
  this.被炸特效 = 0;
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

   function 血條損一滴血(第n滴血){
     document.getElementById(`l${第n滴血}`).style.backgroundColor = `hsla(0,100%,0%,${(-血量[第n滴血-1])/100})`;
     document.getElementById(`l${第n滴血}`).style.boxShadow = `0px 0px 5px hsla(0,100%,0%,${(-血量[第n滴血-1])/100})`;
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


// 敵球具象特效


  Ball.prototype.敵球具象特效 = function(){
  ctx.beginPath();
  ctx.fillStyle = `hsla(0,0%,0%,${(166-this.baby)/50})`;
  ctx.arc(this.x, this.y, this.size+(this.baby-150)*3, 0, 2 * Math.PI);
  ctx.shadowColor = `hsla(0,0%,0%,${(170-this.baby)/50})`;
  ctx.shadowOffsetY = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowBlur = 15;
  ctx.fill();
  
  }
  

  Ball.prototype.敵球具象特效42 = function(){
    ctx.beginPath();
    ctx.fillStyle = `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${(170-this.baby)/20})`;
    ctx.arc(this.x, this.y, this.size+(this.baby-150)*3, 0, 2 * Math.PI);
    ctx.shadowColor = `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${(170-this.baby)/20})`;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowBlur = 15;
    ctx.fill();
    
    }


// 彩球繪製函數#2

Ball.prototype.draw42 = function() {
  if(this.baby>150 && this.baby <= 170){
    this.敵球具象特效42();
  }
  ctx.beginPath();
  ctx.fillStyle = `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${this.baby/500})`;
  //ctx.strokeStyle = `hsla(${this.hue},${this.saturation}%,90%,${this.baby/1000})`;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.shadowColor = `hsla(${this.hue},${this.saturation}%,10%,1)`;
  ctx.shadowOffsetY = 10;
  ctx.shadowOffsetX = 10;
  ctx.shadowBlur = 10;
  ctx.fill();
  //ctx.stroke();
};

// 彩球繪製函數#1

var radgrad;

Ball.prototype.draw = function() {

  if(this.baby>150 && this.baby < 200){
    this.敵球具象特效();
  }

  ctx.beginPath();
  if(this.baby<=150){
    ctx.fillStyle = `hsla(0,0%,${(150-this.baby)/3}%,${this.baby/500})`;
  }
  else{
    ctx.fillStyle = `hsla(0,0%,0%,${this.baby/300})`;
  }
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.shadowColor = `hsla(${this.hue},100%,80%,0.5)`;
  ctx.shadowOffsetY = 10;
  ctx.shadowOffsetX = 10;
  ctx.shadowBlur = 40;
  ctx.fill();

  ctx.shadowColor = `hsla(${this.hue},100%,100%,0)`;

  radgrad = ctx.createRadialGradient(this.x-this.size/5, this.y-this.size/5, 0, this.x, this.y, this.size);
  radgrad.addColorStop(0, `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${this.baby/10000})`);
  radgrad.addColorStop(0.5, `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${this.baby/1000})`);
  radgrad.addColorStop(0.95, `hsla(${this.hue},${this.saturation}%,${this.lightness}%,${this.baby/500})`);
  radgrad.addColorStop(1, `hsla(${this.hue},${this.saturation}%,${this.lightness}%,0)`);

  ctx.fillStyle = radgrad;
  ctx.fillRect(0,0,width,height);

  if(this.被炸特效>0){
    ctx.shadowColor = `hsla(0,100%,100%,0)`;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = `hsla(0,100%,100%,${this.被炸特效/15})`;
    ctx.fill();
    this.被炸特效--;
  }

}

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
      if(補血道具重生計時 == 0){
        補血道具重生計時 = 1;
      }
      血量[hp-1] = 0;
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
  
  for(j = i; j < balls.length; j++) { 
    this.單組碰撞處理();
  }
  return 1;
};



Ball.prototype.單組碰撞處理 = function () {

  if(this !== balls[j]) {
    const dx = this.x - balls[j].x;
    const dy = this.y - balls[j].y;
    const xx = (dx>0) ? 1 : -1 ;
    const yy = (dy>0) ? 1 : -1 ;
    const ratio = (dx * dx)/(dy * dy)
    const distance = Math.sqrt(dx * dx + dy * dy);

    
    
    if (distance < this.size + balls[j].size) {
      if(hardMode){
        
        this.velX = xx*Math.sqrt(this.speed*this.speed/(1+1/(ratio*ratio)));
        this.velY = yy*Math.sqrt(this.speed*this.speed/(ratio*ratio+1));
        balls[j].velX = -xx*Math.sqrt(balls[j].speed*balls[j].speed/(1+1/(ratio*ratio)));
        balls[j].velY = -yy*Math.sqrt(balls[j].speed*balls[j].speed/(ratio*ratio+1));
      }


      //變色計算

      
      if(balls.length>=42){
      
        this.hue += 1;
        balls[j].hue += 1;
        if(this.hue >= 360){
          this.hue = 0;
        }
        if(balls[j].hue >= 360){
          balls[j].hue = 0;
        }
      }
      else{
        this.基本變色();
        balls[j].基本變色();
      }

      
      this.size += this.d*0.8;
      if(this.size>height/8){
        this.size += this.d*(this.size-height/8)/20;
      }
      balls[j].size += balls[j].d;
      
    }
  }
}


Ball.prototype.基本變色 = function() {
  if(this.hueD==0){
    this.hue+=0.5;
    if(this.hue>=280){
      this.hueD++;
    }
  }
  else{
    this.hue-=0.5;
    if(this.hue<=230){
      this.hueD--;
    }
  }
}


// 用來反轉size增減方向的函數

Ball.prototype.球大小變化方向反轉判斷 = function() {
  if (this.size > width/8 + balls.length/2 || this.size > height/8 + balls.length/2){
    this.d = -(this.velX*this.velX+this.velY*this.velY)/50;
  }
  if (this.size < width/100 || this.size < height/100){
    this.d = (this.velX*this.velX+this.velY*this.velY)/50;
  }
};


//炸彈攻擊函數

function 炸彈攻擊() {
  if (hp>1){
    炸彈爆炸特效定位與計時[hp-2][0]=mouse.x;
    炸彈爆炸特效定位與計時[hp-2][1]=mouse.y;
    炸彈爆炸特效定位與計時[hp-2][2]=30;
    炸彈爆炸特效定位與計時[hp-2][3]=1;
    if(補血道具重生計時==0){
      補血道具重生計時=1;
    }
    hp--;
    血量[hp]=0;
    //依序檢測所有敵球，範圍內的敵球大小全部縮小
    for (l=0; l<balls.length; l++){
      if (Math.sqrt((mouse.x-balls[l].x)*(mouse.x-balls[l].x)+(mouse.y-balls[l].y)*(mouse.y-balls[l].y))<短邊/5+balls[l].size){
        if (balls[l].size > width/100 || balls[l].size > height/100){
          balls[l].size/=5;
          if (balls[l].size < 短邊/100){
            balls[l].size = 短邊/100;
          }
        }
        balls[l].被炸特效=15;
      }
    }
  }
}


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
  
  //初始化各種設置

  if(count==0){
    補血道具重生計時 = 1;
    hp = 4;
    alive = 15;
    balls = [];
    計時器 = 0;
    血量 = [1,1,1,1,0];
    document.querySelector("body").addEventListener("click",炸彈攻擊);
    document.getElementById("w42").style.textShadow = '0 0 4px hsla(0,100%,100%,0)'
    for(let k = 1;k<6;k++){
      document.getElementById(`l${k}`).style.backgroundColor = "hsla(0,100%,100%,0.6)";
      document.getElementById(`l${k}`).style.boxShadow = "0px 0px 5px hsla(260,100%,100%,0.8)";
    }
    document.querySelector("body").removeEventListener("click",loop);
  }
  

  //計時器+1;

  計時器++;


  //新敵球出生

  if((hardMode==0&&balls.length<=42)||hardMode==1||1){
    
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

    //繪製背景
  
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

    //繪製血條
    for(let m=0;m<5;m++){
      if(血量[m]<=0 && 血量[m]>-100){
        血條損一滴血(m+1);
        血量[m]--;
      }
    }

    //繪製鼠標

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

    //依序繪製與計算每顆球

    for(i=0, k=random(0, balls.length-1); i<balls.length; i++) {
      balls[i].babies();
      balls[i].球大小變化方向反轉判斷();
      if(balls.length<42){
        balls[i].draw();
      }
      else{
        balls[i].draw42();
      }
      balls[i].update();

      //當hp==0時跳過所有碰撞檢測

      if(balls[i].collisionDetect()==0){
        break;
      }
      if(k<balls.length-1){
        k++;
      }
      else{
        k=0;
      }
    }

    //補血道具

    if(補血道具重生計時>0){

      if(補血道具重生計時>850 && 補血道具重生計時<860){
        
        for(n=0; n<50; n++){
          補血道具x = random(10,width-10);
          補血道具y = random(10,height-10);
          if (Math.sqrt((mouse.x-補血道具x)*(mouse.x-補血道具x)+(mouse.y-補血道具y)*(mouse.y-補血道具y))>短邊/1.8){
            break;
          }
        }
        if(n==50){
          補血道具重生計時=500;
        }
        else{
          補血道具重生計時=870;
        }

      }

      補血道具重生計時+=3;

      if(補血道具重生計時>960 && 補血道具重生計時<=1000){
        
        ctx.beginPath();
        ctx.fillStyle = `hsla(0,100%,100%,${(補血道具重生計時-960)/45})`;
        ctx.shadowColor = 'white';
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;
        ctx.arc(補血道具x, 補血道具y, (1018-補血道具重生計時), 0, 2 * Math.PI);
        ctx.fill();

      }


      if(補血道具重生計時>1000){
        補血道具重生計時=-1;

        //初始化補血道具位子

        
      }
    }
    if(補血道具重生計時==-1){

      //繪製補血道具

      ctx.beginPath();
      ctx.fillStyle = `hsla(0,100%,100%,${0.3*Math.abs(計時器%100-50)/50+0.5})`;
      ctx.arc(補血道具x, 補血道具y, 18, 0, 2 * Math.PI);
      ctx.shadowColor = `hsla(30,100%,60%,1)`;
      ctx.shadowOffsetY = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowBlur = 50;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(補血道具x, 補血道具y, 18+(計時器%100*2) , 0, 2 * Math.PI);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsla(0,100%,100%,${(50-計時器%100)/100})`;
      ctx.stroke();

      heart.style.top = `${補血道具y-10}px`;
      heart.style.left = `${補血道具x-7.5}px`;
      heart.style.display = 'block';

      //檢測鼠標與補血道具碰撞與否

      if (Math.sqrt((mouse.x-補血道具x)*(mouse.x-補血道具x)+(mouse.y-補血道具y)*(mouse.y-補血道具y))<23){
        heart.style.display = 'none';
        hp++;
        if(hp<5){
          補血道具重生計時=1;
        }
        else{
          補血道具重生計時=0;
        }
        血量[hp-1]=1;
        document.getElementById(`l${hp}`).style.backgroundColor = "hsla(0,100%,100%,0.6)";
        document.getElementById(`l${hp}`).style.boxShadow = "0px 0px 5px hsla(260,100%,100%,0.8)";
      }
    }

    //繪製炸彈爆炸特效
    for(let p=0; p<4; p++){
      if(炸彈爆炸特效定位與計時[p][3]==1){
        
        
        ctx.beginPath();
        ctx.fillStyle = `hsla(0,100%,100%,${炸彈爆炸特效定位與計時[p][2]/30})`;
        ctx.arc(炸彈爆炸特效定位與計時[p][0], 炸彈爆炸特效定位與計時[p][1], 短邊/5, 0, 2 * Math.PI);
        ctx.shadowColor = `hsla(30,100%,60%,1)`;
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowBlur = 50;
        ctx.fill();


        炸彈爆炸特效定位與計時[p][2]--;
        if(炸彈爆炸特效定位與計時[p][2]==0){
          炸彈爆炸特效定位與計時[p][3]=0;
        }
      }
    }

    


    if(hp>0){
      if(count<6200){
        count++;
      }
      if((balls.length<43&&hardMode==0)||hardMode==1||1){
        document.querySelector(".number").textContent = `${balls.length}`;
      }
      document.querySelector(".number").style.color= `hsla(0,100%,100%,${(count/150+1)/200})`;
      document.querySelector(".number").style.textShadow =`0 0 0.04em hsla(0,100%,100%,${(count/150+1)/200})`;
      document.querySelector(".number").style.fontSize = `${(count/150+10)}vw`;
    
      requestAnimationFrame(loop);
    }
    else{
      fails = 50;
      遊戲結束();
    }
  }
  else{
    fails = 50;
    遊戲結束();
  }
}

//調整視窗大小時，改變畫布大小，同時防止鼠標出界

window.onresize = function() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  if(mouse.x > width){
    mouse.x = width;
  }
  if(mouse.y > height){
    mouse.y = height;
  }
}

loop();

// 結束函數

function 遊戲結束() {
  document.querySelector("body").removeEventListener("click",炸彈攻擊);
  heart.style.display = 'none';
  ctx.fillStyle = `hsla(0,0%,0%,0.1)`;
  ctx.shadowColor = `hsla(250,100%,0%,0.02)`;
  ctx.fillRect(0,0,width,height);
  if(hp<1){
    血條損一滴血(1);
    血量[0]-=2;
  }
  alive--;
  alive--;
  if(fails>0){
    fails--;
    requestAnimationFrame(遊戲結束);
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
    count = 0;
    document.querySelector("body").addEventListener("click",loop);
  }
};