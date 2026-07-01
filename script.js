const canvas = document.getElementById("odyssaiCanvas");
const ctx = canvas.getContext("2d");

let W = 0, H = 0, DPR = 1;
let start = performance.now();

function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
resize();
window.addEventListener("resize", resize);

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const smooth = x => x*x*(3-2*x);
const phase = (t,a,b)=>smooth(clamp((t-a)/(b-a),0,1));
const lerp = (a,b,p)=>a+(b-a)*p;

function glowLine(x1,y1,x2,y2,color,w=2,blur=18){
  ctx.save();
  ctx.shadowColor=color;
  ctx.shadowBlur=blur;
  ctx.strokeStyle=color;
  ctx.lineWidth=w;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.restore();
}

function drawBackground(t){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#071126");
  g.addColorStop(.55,"#030918");
  g.addColorStop(1,"#02050e");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  const rg = ctx.createRadialGradient(W*.5,H*.57,0,W*.5,H*.57,Math.min(W,H)*.45);
  rg.addColorStop(0,`rgba(0,170,255,${0.10+0.04*Math.sin(t*2)})`);
  rg.addColorStop(.4,"rgba(20,90,255,.07)");
  rg.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0,0,W,H);
}

function drawHorizon(t){
  const p = phase(t,.0,.6);
  const y = H*.56;
  const len = W*.9*p;
  const x1 = W/2-len/2, x2=W/2+len/2;
  const grad = ctx.createLinearGradient(x1,y,x2,y);
  grad.addColorStop(0,"rgba(0,170,255,0)");
  grad.addColorStop(.5,"rgba(30,210,255,.95)");
  grad.addColorStop(1,"rgba(0,170,255,0)");
  glowLine(x1,y,x2,y,grad,2,22);

  const reflection = phase(t,.6,1.4);
  ctx.save();
  ctx.globalAlpha=.45*reflection;
  for(let i=0;i<18;i++){
    const yy = y + 8 + i*8;
    const half = (18-i)*5*reflection;
    glowLine(W/2-half,yy,W/2+half,yy,"rgba(20,160,255,.55)",1,9);
  }
  ctx.restore();
}

function drawBoat(t){
  const p = phase(t,1.0,2.4);
  const bob = Math.sin(t*5)*4*phase(t,2.3,9);
  const x = lerp(-W*.25, W*.48, p);
  const y = H*.52 + bob;
  const s = Math.min(W,H)/510;

  ctx.save();
  ctx.translate(x,y);
  ctx.scale(s,s);
  ctx.shadowColor="#2ac8ff";
  ctx.shadowBlur=18;
  ctx.globalAlpha=p;

  // hull
  ctx.fillStyle="#071b3e";
  ctx.strokeStyle="#bfe8ff";
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.moveTo(-88,42);
  ctx.quadraticCurveTo(-24,83,92,44);
  ctx.quadraticCurveTo(35,105,-112,60);
  ctx.quadraticCurveTo(-102,52,-88,42);
  ctx.fill(); ctx.stroke();

  // blue keel light
  ctx.strokeStyle="#0fa7ff"; ctx.lineWidth=7; ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(-97,66);
  ctx.quadraticCurveTo(-5,105,102,51);
  ctx.stroke();

  // mast
  ctx.strokeStyle="#eaf7ff"; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(-8,34); ctx.lineTo(-8,-102); ctx.stroke();

  // sail
  let sailGrad = ctx.createLinearGradient(-65,-100,65,40);
  sailGrad.addColorStop(0,"#ffffff");
  sailGrad.addColorStop(1,"#8fbfff");
  ctx.fillStyle=sailGrad;
  ctx.beginPath();
  ctx.moveTo(-8,-98);
  ctx.bezierCurveTo(48,-62,67,-15,66,31);
  ctx.bezierCurveTo(20,22,-30,23,-70,39);
  ctx.bezierCurveTo(-48,-15,-31,-65,-8,-98);
  ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.65)"; ctx.lineWidth=2;
  ctx.stroke();

  // small flag
  ctx.fillStyle="#6ed7ff";
  ctx.beginPath();
  ctx.moveTo(-6,-105); ctx.lineTo(35,-115); ctx.lineTo(-6,-122); ctx.closePath();
  ctx.fill();

  // windows
  ctx.fillStyle="#fff";
  [-70,-45,-20,5,30,55].forEach(cx=>{
    ctx.beginPath(); ctx.arc(cx,54,4,0,Math.PI*2); ctx.fill();
  });

  ctx.restore();
}

function drawTechSea(t){
  const p = phase(t,2.4,4.4);
  const amp = 22;
  const baseY = H*.62;
  const rows = 8;
  ctx.save();
  ctx.globalAlpha=p;
  for(let r=0;r<rows;r++){
    const y = baseY + r*22;
    const grad = ctx.createLinearGradient(W*.12,y,W*.88,y);
    grad.addColorStop(0, r%3===0 ? "#0bc8ff" : "#116dff");
    grad.addColorStop(.65, r%2===0 ? "#158dff" : "#0ed8ff");
    grad.addColorStop(1, r%3===0 ? "#8c54ff" : "#244cff");
    ctx.strokeStyle=grad;
    ctx.lineWidth = r<4 ? 2.5 : 1.8;
    ctx.shadowColor = r%3===0 ? "#15cfff" : "#7954ff";
    ctx.shadowBlur=11;
    ctx.beginPath();

    const startX = W*.08;
    const endX = W*.92;
    const visibleEnd = lerp(startX,endX,p);
    for(let x=startX;x<=visibleEnd;x+=8){
      const yy = y + Math.sin((x*.018)+(t*1.6)+r*.7)*amp*(1-r*.06);
      if(x===startX) ctx.moveTo(x,yy);
      else ctx.lineTo(x,yy);
    }
    ctx.stroke();

    const count = 4;
    for(let i=0;i<count;i++){
      const dotP = clamp((p*1.2)-(i*.08),0,1);
      const x = lerp(W*.18,W*.82,(i+.5)/count);
      if(dotP>0 && x<visibleEnd){
        const yy = y + Math.sin((x*.018)+(t*1.6)+r*.7)*amp*(1-r*.06);
        ctx.fillStyle = r%2 ? "#2c7dff" : "#20d8ff";
        ctx.shadowBlur=18;
        ctx.beginPath(); ctx.arc(x,yy,3.4*dotP,0,Math.PI*2); ctx.fill();
      }
    }
  }
  // network connections
  ctx.globalAlpha = .42*p;
  ctx.strokeStyle="#2b83ff";
  ctx.lineWidth=1;
  for(let i=0;i<35*p;i++){
    const x1 = W*.15 + (i*53 % (W*.7));
    const y1 = baseY + (i*31 % 135);
    const x2 = x1 + Math.sin(i)*65;
    const y2 = y1 + Math.cos(i)*28;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  ctx.restore();
}

function drawArc(t){
  const p = phase(t,4.4,5.0);
  const cx=W*.50, cy=H*.45, r=Math.min(W,H)*.29;
  ctx.save();
  ctx.lineWidth=13;
  ctx.lineCap="round";
  ctx.shadowBlur=22;
  ctx.shadowColor="#109cff";
  const grad = ctx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);
  grad.addColorStop(0,"#0ecbff");
  grad.addColorStop(.65,"#1a72ff");
  grad.addColorStop(1,"#8b55ff");
  ctx.strokeStyle=grad;
  ctx.beginPath();
  const start = Math.PI*.98;
  const end = start + Math.PI*1.25*p;
  ctx.arc(cx,cy,r,start,end,false);
  ctx.stroke();
  ctx.restore();
}

function planePosition(p){
  const sx = W*.56, sy=H*.42;
  const ex = W*.76, ey=H*.25;
  const cx1=W*.69, cy1=H*.42;
  const cx2=W*.64, cy2=H*.29;
  const x = Math.pow(1-p,3)*sx + 3*Math.pow(1-p,2)*p*cx1 + 3*(1-p)*p*p*cx2 + p*p*p*ex;
  const y = Math.pow(1-p,3)*sy + 3*Math.pow(1-p,2)*p*cy1 + 3*(1-p)*p*p*cy2 + p*p*p*ey;
  return {x,y};
}

function drawPlaneAndTrail(t){
  const p = phase(t,5.0,6.1);
  ctx.save();
  ctx.strokeStyle="#5bcaff";
  ctx.lineWidth=3;
  ctx.lineCap="round";
  ctx.shadowColor="#34c8ff";
  ctx.shadowBlur=14;
  ctx.beginPath();
  const steps=80*p;
  for(let i=0;i<=steps;i++){
    const q=i/80;
    const pos=planePosition(q);
    if(i===0) ctx.moveTo(pos.x,pos.y);
    else ctx.lineTo(pos.x,pos.y);
  }
  ctx.stroke();

  if(p>0){
    const pos=planePosition(p);
    ctx.translate(pos.x,pos.y);
    ctx.rotate(-Math.PI/4);
    ctx.fillStyle="#62d4ff";
    ctx.shadowBlur=18;
    ctx.beginPath();
    ctx.moveTo(0,-20);
    ctx.lineTo(42,0);
    ctx.lineTo(0,20);
    ctx.lineTo(8,5);
    ctx.lineTo(-18,5);
    ctx.lineTo(-18,-5);
    ctx.lineTo(8,-5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawStars(t){
  const p = phase(t,5.8,6.6);
  ctx.save();
  ctx.globalAlpha=p;
  ctx.fillStyle="#ffffff";
  ctx.shadowColor="#78cfff";
  ctx.shadowBlur=12;
  const pts = [
    [W*.46,H*.22,8],[W*.55,H*.31,2],[W*.39,H*.28,2],[W*.61,H*.24,2],[W*.50,H*.17,2]
  ];
  for(const [x,y,s] of pts){
    ctx.beginPath();
    if(s>3){
      ctx.moveTo(x,y-s); ctx.lineTo(x+s*.35,y-s*.35); ctx.lineTo(x+s,y);
      ctx.lineTo(x+s*.35,y+s*.35); ctx.lineTo(x,y+s);
      ctx.lineTo(x-s*.35,y+s*.35); ctx.lineTo(x-s,y);
      ctx.lineTo(x-s*.35,y-s*.35); ctx.closePath();
    } else ctx.arc(x,y,s,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTitle(t){
  const p = phase(t,6.7,7.4);
  ctx.save();
  ctx.globalAlpha=p;
  const y=H*.78;
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font=`${Math.min(58,W*.13)}px Arial`;
  ctx.shadowColor="rgba(255,255,255,.35)";
  ctx.shadowBlur=10;
  ctx.fillStyle="white";
  ctx.fillText("Odyss", W*.47, y);

  const grad = ctx.createLinearGradient(W*.58,y-40,W*.76,y+40);
  grad.addColorStop(0,"#10caff");
  grad.addColorStop(1,"#8a56ff");
  ctx.fillStyle=grad;
  ctx.fillText("AI", W*.67, y);

  const p2=phase(t,7.2,8.0);
  ctx.globalAlpha=p2;
  ctx.font=`${Math.min(13,W*.032)}px Arial`;
  ctx.letterSpacing="2px";
  ctx.fillStyle="#d8e2ff";
  ctx.fillText("VOTRE VOYAGE, OPTIMISÉ PAR L’IA", W*.5, y+48);

  // loading light
  ctx.globalAlpha=p2;
  glowLine(W*.36,y+82,W*.64,y+82,"rgba(40,140,255,.65)",1,12);
  const lx=lerp(W*.36,W*.64,(Math.sin(t*2)+1)/2);
  ctx.fillStyle="#2ad8ff";
  ctx.shadowColor="#2ad8ff";
  ctx.shadowBlur=18;
  ctx.beginPath(); ctx.arc(lx,y+82,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function render(now){
  const t = (now-start)/1000;
  ctx.clearRect(0,0,W,H);
  drawBackground(t);
  drawHorizon(t);
  drawBoat(t);
  drawTechSea(t);
  drawArc(t);
  drawPlaneAndTrail(t);
  drawStars(t);
  drawTitle(t);
  if(t<8.8) requestAnimationFrame(render);
}
requestAnimationFrame(render);

setTimeout(()=>{
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("home").classList.add("visible");
}, 8600);
