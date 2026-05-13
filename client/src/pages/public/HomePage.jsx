/* eslint-disable */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { publicApi as api } from '../../api/axios';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 1 — SVG Grid
───────────────────────────────────────────────────────────────────────────── */
function GridBg() {
  return (
    <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00BCD4" strokeWidth="0.5" strokeOpacity="0.025"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 2 — Particle network with mouse repulsion
───────────────────────────────────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref   = useRef(null);
  const mouse = useRef({ x:-9999, y:-9999 });

  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#00BCD4','#4FC3F7','#A78BFA','#ffffff'];
    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,  y: Math.random() * canvas.height,
      ox: 0, oy: 0,
      vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5,
      r: 1 + Math.random() * 3,
      c: COLORS[Math.floor(Math.random()*COLORS.length)],
    }));
    pts.forEach(p => { p.ox = p.x; p.oy = p.y; });

    const onMove = e => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x, my = mouse.current.y;

      pts.forEach(p => {
        // flee
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 80) {
          const force = (80 - dist) / 80;
          p.vx += (dx/dist) * force * 1.5;
          p.vy += (dy/dist) * force * 1.5;
        }
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i+1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,188,212,${0.18*(1-d/90)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}/>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 3 — Surgeon Silhouettes
───────────────────────────────────────────────────────────────────────────── */
function SurgeonSilhouettes() {
  return (
    <svg
      style={{ position:'absolute', right:'18%', bottom:0, height:'65%', zIndex:2, pointerEvents:'none' }}
      viewBox="0 0 420 600" preserveAspectRatio="xMidYMax meet">

      {/* Surgeon 2 — left, shorter, leaning forward */}
      <g transform="translate(30,80) rotate(-6, 90, 300)" style={{ animation:'breathe2 4.3s ease-in-out 1s infinite', transformOrigin:'90px 600px' }}>
        <circle cx="90" cy="100" r="24" fill="rgba(0,188,212,0.04)" stroke="rgba(0,188,212,0.07)" strokeWidth="0.5"/>
        <rect x="68" y="78" width="44" height="16" rx="8" fill="rgba(0,188,212,0.04)" stroke="rgba(0,188,212,0.07)" strokeWidth="0.5"/>
        <rect x="70" y="110" width="40" height="18" rx="6" fill="rgba(0,188,212,0.04)" stroke="rgba(0,188,212,0.07)" strokeWidth="0.5"/>
        <path d="M60 140 Q55 200 50 320 Q55 400 80 420 L100 420 Q120 400 130 320 Q125 200 120 140 Z" fill="rgba(0,188,212,0.04)" stroke="rgba(0,188,212,0.07)" strokeWidth="0.5"/>
        <path d="M60 155 Q30 200 20 280" fill="none" stroke="rgba(0,188,212,0.07)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M120 155 Q145 190 155 250" fill="none" stroke="rgba(0,188,212,0.07)" strokeWidth="8" strokeLinecap="round"/>
      </g>

      {/* Surgeon 1 — center, tallest, arms raised */}
      <g transform="translate(140,20)" style={{ animation:'breathe1 4s ease-in-out infinite', transformOrigin:'140px 600px' }}>
        <circle cx="140" cy="90" r="30" fill="rgba(79,195,247,0.055)" stroke="rgba(79,195,247,0.08)" strokeWidth="0.5"/>
        <rect x="112" y="62" width="56" height="20" rx="10" fill="rgba(79,195,247,0.055)" stroke="rgba(79,195,247,0.08)" strokeWidth="0.5"/>
        <rect x="114" y="106" width="52" height="22" rx="7" fill="rgba(79,195,247,0.055)" stroke="rgba(79,195,247,0.08)" strokeWidth="0.5"/>
        <path d="M115 135 Q108 200 105 340 Q110 430 130 450 L150 450 Q168 430 175 340 Q172 200 165 135 Z" fill="rgba(79,195,247,0.055)" stroke="rgba(79,195,247,0.08)" strokeWidth="0.5"/>
        {/* Arms raised */}
        <path d="M115 150 Q90 120 60 100" fill="none" stroke="rgba(79,195,247,0.08)" strokeWidth="10" strokeLinecap="round"/>
        <path d="M165 150 Q190 120 220 100" fill="none" stroke="rgba(79,195,247,0.08)" strokeWidth="10" strokeLinecap="round"/>
        {/* Gloved hands */}
        <circle cx="60" cy="98" r="10" fill="rgba(79,195,247,0.08)"/>
        <circle cx="220" cy="98" r="10" fill="rgba(79,195,247,0.08)"/>
      </g>

      {/* Surgeon 3 — right, holding instrument */}
      <g transform="translate(280,100)" style={{ animation:'breathe3 3.8s ease-in-out 0.5s infinite', transformOrigin:'90px 600px' }}>
        <circle cx="90" cy="110" r="22" fill="rgba(167,139,250,0.038)" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5"/>
        <rect x="70" y="90" width="40" height="15" rx="7" fill="rgba(167,139,250,0.038)" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5"/>
        <rect x="72" y="118" width="36" height="16" rx="5" fill="rgba(167,139,250,0.038)" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5"/>
        <path d="M68 142 Q62 190 60 300 Q64 380 82 400 L100 400 Q116 380 120 300 Q118 190 112 142 Z" fill="rgba(167,139,250,0.038)" stroke="rgba(167,139,250,0.06)" strokeWidth="0.5"/>
        {/* Arm holding instrument forward */}
        <path d="M68 158 Q50 180 20 185" fill="none" stroke="rgba(167,139,250,0.06)" strokeWidth="8" strokeLinecap="round"/>
        <line x1="20" y1="185" x2="-30" y2="188" stroke="rgba(167,139,250,0.1)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M112 158 Q128 175 140 220" fill="none" stroke="rgba(167,139,250,0.06)" strokeWidth="8" strokeLinecap="round"/>
      </g>

      <style>{`
        @keyframes breathe1 { 0%,100%{transform:translate(140px,20px) scaleY(1)} 50%{transform:translate(140px,20px) scaleY(1.006)} }
        @keyframes breathe2 { 0%,100%{transform:translate(30px,80px) rotate(-6deg) scaleY(1)} 50%{transform:translate(30px,80px) rotate(-6deg) scaleY(1.006)} }
        @keyframes breathe3 { 0%,100%{transform:translate(280px,100px) scaleY(1)} 50%{transform:translate(280px,100px) scaleY(1.005)} }
      `}</style>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 4 — Sonar rings
───────────────────────────────────────────────────────────────────────────── */
function SonarRings() {
  return (
    <svg style={{ position:'absolute', right:'32%', top:'20%', width:220, height:220, zIndex:2, pointerEvents:'none', opacity:0.6 }}>
      {[0,1,2,3].map(i => (
        <circle key={i} cx="110" cy="110" r="10"
          fill="none" stroke="rgba(0,188,212,0.07)" strokeWidth="1"
          style={{ animation:`sonar 3.5s linear ${i*0.85}s infinite` }}/>
      ))}
      <style>{`
        @keyframes sonar {
          0%   { r:10;  opacity:.7; stroke-width:1.5; }
          100% { r:105; opacity:0;  stroke-width:0.3; }
        }
      `}</style>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 5 — DNA Three.js
───────────────────────────────────────────────────────────────────────────── */
function DNACanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100);
    camera.position.set(0, 0, 16);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    const gold    = new THREE.PointLight(0xF59E0B, 2, 30);
    gold.position.set(-8, 0, 5);
    scene.add(ambient, gold);

    const group = new THREE.Group();
    scene.add(group);

    const TURNS=4, PTS=120, R=2.5, H2=13;
    const c1=new THREE.Color('#00BCD4'), c2=new THREE.Color('#4FC3F7');

    for (let s=0; s<2; s++) {
      const off = s*Math.PI;
      const pts=[];
      for (let i=0;i<PTS;i++){
        const t=i/(PTS-1), a=t*TURNS*Math.PI*2+off;
        pts.push(new THREE.Vector3(Math.cos(a)*R,(t-.5)*H2,Math.sin(a)*R));
      }
      const curve=new THREE.CatmullRomCurve3(pts);
      const geo=new THREE.TubeGeometry(curve,PTS*2,0.07,8,false);
      const mat=new THREE.MeshPhongMaterial({color:s===0?c1:c2,transparent:true,opacity:.9,shininess:80});
      group.add(new THREE.Mesh(geo,mat));
      for(let i=0;i<PTS;i+=5){
        const sg=new THREE.SphereGeometry(.13,8,8);
        const sm=new THREE.MeshPhongMaterial({color:s===0?c1:c2,shininess:100});
        const m=new THREE.Mesh(sg,sm); m.position.copy(pts[i]); group.add(m);
      }
    }
    for(let i=0;i<PTS;i+=5){
      const t=i/(PTS-1),a1=t*TURNS*Math.PI*2,a2=a1+Math.PI;
      const p1=new THREE.Vector3(Math.cos(a1)*R,(t-.5)*H2,Math.sin(a1)*R);
      const p2=new THREE.Vector3(Math.cos(a2)*R,(t-.5)*H2,Math.sin(a2)*R);
      const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]);
      const mat=new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.12});
      group.add(new THREE.Line(geo,mat));
    }

    let raf;
    const animate=()=>{
      raf=requestAnimationFrame(animate);
      group.rotation.y+=0.005;
      renderer.render(scene,camera);
    };
    animate();
    return ()=>{cancelAnimationFrame(raf);renderer.dispose();el.removeChild(renderer.domElement);};
  }, []);
  return <div ref={mountRef} style={{ position:'absolute', right:0, top:0, width:'50%', height:'100%', pointerEvents:'none', zIndex:3 }}/>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 6 — Scan line
───────────────────────────────────────────────────────────────────────────── */
function ScanLine() {
  return (
    <>
      <div style={{ position:'absolute', left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(0,188,212,0.15),transparent)', zIndex:4, pointerEvents:'none', animation:'scanline 6s linear infinite' }}/>
      <style>{`@keyframes scanline{0%{top:-2px}100%{top:100%}}`}</style>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYER 7 — ECG
───────────────────────────────────────────────────────────────────────────── */
function ECGLine() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas=ref.current; const ctx=canvas.getContext('2d');
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const W=canvas.width, H=canvas.height;
    let offset=0;
    const ecg=(x)=>{
      const t=((x+offset)%W)/W;
      if(t<.05)return 0; if(t<.10)return Math.sin((t-.05)*40)*.15;
      if(t<.15)return-.1; if(t<.18)return 1.0; if(t<.22)return-.5;
      if(t<.26)return.2; if(t<.30)return 0;
      return Math.sin((t-.30)*60)*.08;
    };
    let raf;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      // Main line
      ctx.beginPath(); ctx.strokeStyle='#00BCD4'; ctx.lineWidth=2.5; ctx.shadowColor='#00BCD4'; ctx.shadowBlur=10;
      for(let x=0;x<W;x++){const y=H/2-ecg(x)*(H*.4); x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.stroke();
      // Echo line (offset)
      ctx.beginPath(); ctx.strokeStyle='rgba(0,188,212,0.2)'; ctx.lineWidth=1.5; ctx.shadowBlur=0;
      const off2=20;
      for(let x=0;x<W;x++){const y=H/2-ecg(x+off2)*(H*.4)+8; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.stroke();
      offset+=2; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{ position:'absolute', bottom:0, left:0, width:'100%', height:90, zIndex:4, pointerEvents:'none' }}/>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLOATING CARDS (right side)
───────────────────────────────────────────────────────────────────────────── */
function HeartSparkline() {
  const points = [0,4,2,8,1,10,3,7,2,5,8,3,6];
  const max=10, w=80, h=24, pad=2;
  const step=w/(points.length-1);
  const pts=points.map((v,i)=>`${i*step+pad},${h-pad-(v/max)*(h-pad*2)}`).join(' ');
  return <polyline points={pts} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>;
}

function FloatingCards() {
  return (
    <div style={{ position:'absolute', right:'4%', top:'22%', zIndex:5, display:'flex', flexDirection:'column', gap:16, pointerEvents:'none' }}>
      {/* Card 1 — appointments */}
      <div style={{ width:170, background:'rgba(5,12,23,0.75)', border:'1px solid rgba(0,188,212,0.2)', borderRadius:14, padding:'14px 16px', backdropFilter:'blur(16px)', animation:'float1 3s ease-in-out infinite' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Bugünkü Randevular</div>
        <div style={{ fontSize:30, fontWeight:900, color:'#00BCD4', fontFamily:'monospace', lineHeight:1, marginBottom:10 }}>73</div>
        <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:24 }}>
          {[40,65,50,80,55,90,73].map((v,i)=>(
            <div key={i} style={{ flex:1, background:i===6?'#00BCD4':'rgba(0,188,212,0.25)', borderRadius:2, height:`${(v/90)*24}px`, transition:'height .3s' }}/>
          ))}
        </div>
      </div>

      {/* Card 2 — last surgery */}
      <div style={{ width:170, marginLeft:20, background:'rgba(5,12,23,0.75)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:14, padding:'14px 16px', backdropFilter:'blur(16px)', animation:'float2 4s ease-in-out 1s infinite' }}>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Son Əməliyyat</div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px #10B981', animation:'pulse-dot 1.4s ease-in-out infinite' }}/>
          <span style={{ fontSize:12, color:'#10B981', fontWeight:700 }}>Uğurlu</span>
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>Dr. N. Mammadova</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>10:42 · Kardio bloku</div>
      </div>

      {/* Card 3 — vitals */}
      <div style={{ width:170, background:'rgba(5,12,23,0.75)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'14px 16px', backdropFilter:'blur(16px)', animation:'float3 3.5s ease-in-out 0.5s infinite' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <span style={{ fontSize:16 }}>♥</span>
          <span style={{ fontSize:22, fontWeight:900, color:'#EF4444', fontFamily:'monospace' }}>72</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>BPM</span>
        </div>
        <svg width="84" height="28" viewBox="0 0 84 28">
          <HeartSparkline/>
        </svg>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-12px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOUSE SCROLL INDICATOR
───────────────────────────────────────────────────────────────────────────── */
function MouseScroll() {
  return (
    <div style={{ position:'absolute', bottom:100, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:10, zIndex:6, pointerEvents:'none' }}>
      <svg width="26" height="40" viewBox="0 0 26 40">
        <rect x="1" y="1" width="24" height="38" rx="12" fill="none" stroke="rgba(0,188,212,0.5)" strokeWidth="1.5"/>
        <circle cx="13" cy="10" r="3" fill="#00BCD4" style={{ animation:'scroll-dot 1.6s ease-in-out infinite' }}/>
      </svg>
      <span style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Kəşf et</span>
      <style>{`
        @keyframes scroll-dot {
          0%  { transform:translateY(0);  opacity:1; }
          60% { transform:translateY(16px); opacity:.2; }
          100%{ transform:translateY(0);  opacity:0; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEPARTMENTS section helpers
───────────────────────────────────────────────────────────────────────────── */
const DEPT_META = {
  Cardiology:    { ico:'❤️', color:'#EF4444', label:'Kardiologiya' },
  Neurology:     { ico:'🧠', color:'#8B5CF6', label:'Nevrologiya'  },
  Pediatrics:    { ico:'👶', color:'#F59E0B', label:'Pediatriya'   },
  Surgery:       { ico:'🔬', color:'#10B981', label:'Cərrahiyyə'   },
  Orthopedics:   { ico:'🦴', color:'#3B82F6', label:'Ortopediya'   },
  Radiology:     { ico:'☢️', color:'#00BCD4', label:'Radiologiya'  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   HERO BADGE with shimmer
───────────────────────────────────────────────────────────────────────────── */
function HeroBadge() {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:28, position:'relative', overflow:'hidden', background:'rgba(0,188,212,0.07)', border:'1px solid rgba(0,188,212,0.18)', borderRadius:24, padding:'7px 18px' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(0,188,212,0.12) 50%,transparent 100%)', animation:'shimmer 3s linear infinite', pointerEvents:'none' }}/>
      <div style={{ width:2, height:14, background:'#00BCD4', borderRadius:1 }}/>
      <span style={{ fontSize:11, letterSpacing:'0.14em', color:'rgba(0,188,212,0.9)', fontWeight:700, position:'relative' }}>
        CANLI SİSTEM &nbsp;·&nbsp; 24/7 AKTİV &nbsp;·&nbsp; BAKI, AZ
      </span>
      <div style={{ width:6, height:6, borderRadius:'50%', background:'#00BCD4', animation:'blink 1.4s ease-in-out infinite' }}/>
      <style>{`
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHARACTER SPLIT TITLE ANIMATION (no premium plugin needed)
───────────────────────────────────────────────────────────────────────────── */
function SplitTitle({ text, color, delay = 0 }) {
  return (
    <span style={{ display:'inline-block' }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{
          display:'inline-block', color,
          animation:`charIn .6s cubic-bezier(.23,1,.32,1) both`,
          animationDelay:`${delay + i * 0.03}s`,
        }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
      <style>{`@keyframes charIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [depts,   setDepts  ] = useState(Object.entries(DEPT_META).map(([k,v])=>({specialization:k,...v,count:0})));

  useEffect(() => {
    api.get('/doctors',{params:{limit:6}}).then(r=>{
      const list = r.data.data?.doctors||[];
      setDoctors(list);
      const counts={};
      list.forEach(d=>{counts[d.specialization]=(counts[d.specialization]||0)+1;});
      setDepts(prev=>prev.map(d=>({...d,count:counts[d.specialization]||0})));
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    gsap.utils.toArray('.reveal').forEach(el=>{
      gsap.fromTo(el,{y:50,opacity:0},{y:0,opacity:1,duration:.8,ease:'power2.out',
        scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}});
    });
    return ()=>ScrollTrigger.getAll().forEach(t=>t.kill());
  },[]);

  return (
    <div style={{ background:'#050c17', minHeight:'100vh', color:'#fff', fontFamily:'var(--font-sans)', overflowX:'hidden' }}>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        position:'relative', height:'100vh', display:'flex', alignItems:'center',
        overflow:'hidden',
        background:'radial-gradient(ellipse at 70% 50%, #0d2137 0%, #050c17 60%, #020810 100%)',
      }}>
        <GridBg/>
        <ParticleCanvas/>
        <SurgeonSilhouettes/>
        <SonarRings/>
        <DNACanvas/>
        <ScanLine/>
        <FloatingCards/>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <div style={{ position:'relative', zIndex:6, maxWidth:660, padding:'0 56px', marginTop:32 }}>
          <HeroBadge/>

          <h1 style={{ fontSize:'clamp(44px,5.5vw,80px)', fontWeight:800, lineHeight:1.08, margin:'0 0 24px', letterSpacing:'-2px', textShadow:'0 0 80px rgba(0,188,212,0.2)' }}>
            <SplitTitle text="Sağlamlığınız" color="#ffffff" delay={0.1}/>
            <br/>
            <SplitTitle text="— Prioritetimiz" color="#00BCD4" delay={0.4}/>
          </h1>

          {/* Feature pills */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
            {['⚕ Robot Cərrahiyyə','🧬 3T MRI','❤️ 24/7 Kardiologiya'].map(label=>(
              <div key={label} style={{ background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'5px 13px', fontSize:12, color:'rgba(255,255,255,0.6)', animation:'charIn .6s ease both', animationDelay:'.8s' }}>
                {label}
              </div>
            ))}
          </div>

          <p style={{ fontSize:17, color:'rgba(255,255,255,0.55)', lineHeight:1.75, marginBottom:36, maxWidth:500, animation:'charIn .7s ease both', animationDelay:'.6s' }}>
            Azərbaycanın ən müasir tibb mərkəzi. Peşəkar həkimlər, qabaqcıl texnologiya, şəxsi yanaşma.
          </p>

          {/* Buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'charIn .6s ease both', animationDelay:'1s' }}>
            {/* Randevu Al — gradient border */}
            <Link to="/randevu" style={{
              position:'relative', padding:'14px 32px', background:'linear-gradient(135deg,#00BCD4,#0284C7)',
              borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none',
              boxShadow:'0 0 20px rgba(0,188,212,0.3)', transition:'all .25s', display:'flex', alignItems:'center', gap:8,
            }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 0 35px rgba(0,188,212,0.55)';e.currentTarget.querySelector('.arrow').style.transform='translateX(4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 0 20px rgba(0,188,212,0.3)';e.currentTarget.querySelector('.arrow').style.transform='translateX(0)';}}>
              Randevu Al <span className="arrow" style={{ transition:'transform .25s' }}>→</span>
            </Link>

            {/* Həkimlər — glassmorphism */}
            <Link to="/hekimler" style={{
              padding:'14px 28px', background:'rgba(255,255,255,0.07)', backdropFilter:'blur(8px)',
              border:'1px solid rgba(255,255,255,0.15)', borderRadius:10,
              color:'#fff', fontWeight:600, fontSize:14, textDecoration:'none', transition:'all .25s',
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
              Həkimlərimiz
            </Link>

            {/* 112 — pulse */}
            <a href="tel:112" style={{
              padding:'14px 24px', background:'rgba(239,68,68,0.12)',
              border:'1px solid rgba(239,68,68,0.35)', borderRadius:10,
              color:'#FCA5A5', fontWeight:700, fontSize:14, textDecoration:'none',
              animation:'pulse112 1.2s ease-in-out infinite',
            }}>🚨 112</a>
          </div>
        </div>

        <MouseScroll/>
        <ECGLine/>

        <style>{`
          @keyframes pulse112{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        `}</style>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section className="reveal" style={{ background:'rgba(0,188,212,0.04)', borderTop:'1px solid rgba(0,188,212,0.12)', borderBottom:'1px solid rgba(0,188,212,0.12)', padding:'36px 56px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:32, textAlign:'center' }}>
          {[['🏥','10+','İl Təcrübə'],['👨‍⚕️','50+','Mütəxəssis Həkim'],['🧑‍🤝‍🧑','1000+','Aktiv Pasiyent'],['⏰','24/7','Fəaliyyət']].map(([ico,num,label])=>(
            <div key={label} style={{ borderTop:'1px solid rgba(0,188,212,0.25)', paddingTop:18 }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{ico}</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#00BCD4', fontFamily:'var(--font-display)', letterSpacing:'-0.02em' }}>{num}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEPARTMENTS ────────────────────────────────────────────────────── */}
      <section style={{ padding:'96px 56px', maxWidth:1200, margin:'0 auto' }}>
        <div className="reveal" style={{ textAlign:'center', marginBottom:56 }}>
          <span style={{ fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:'#00BCD4', fontWeight:700 }}>Şöbələrimiz</span>
          <h2 style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:800, margin:'12px 0 14px', letterSpacing:'-0.02em' }}>Tibbi Xidmətlər</h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:16, maxWidth:460, margin:'0 auto' }}>Müasir avadanlıq və peşəkar komanda ilə geniş spektrli tibbi xidmətlər.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
          {depts.map((d,i)=>(
            <div key={i} className="reveal" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:28, transition:'all .3s', cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.borderColor=d.color+'44';e.currentTarget.style.transform='translateY(-4px)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='none';}}>
              <div style={{ width:52,height:52,borderRadius:14,background:`${d.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:16 }}>{d.ico}</div>
              <h3 style={{ fontSize:17,fontWeight:700,marginBottom:4 }}>{d.label}</h3>
              <p style={{ color:'rgba(255,255,255,0.4)',fontSize:12,marginBottom:14 }}>{d.count} həkim</p>
              <Link to="/randevu" style={{ fontSize:13,color:d.color,fontWeight:600,textDecoration:'none' }}>Randevu Al →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCTORS ────────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 56px', background:'rgba(255,255,255,0.018)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="reveal" style={{ textAlign:'center', marginBottom:48 }}>
            <span style={{ fontSize:11,letterSpacing:'0.22em',textTransform:'uppercase',color:'#00BCD4',fontWeight:700 }}>Komandamız</span>
            <h2 style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,margin:'12px 0' }}>Həkimlərimiz</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
            {doctors.length===0
              ? Array.from({length:3}).map((_,i)=>(
                  <div key={i} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:28,textAlign:'center',animation:'pulse2 1.5s ease-in-out infinite' }}>
                    <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,0.05)',margin:'0 auto 16px' }}/>
                    <div style={{ height:13,background:'rgba(255,255,255,0.05)',borderRadius:4,marginBottom:8 }}/>
                    <div style={{ height:10,background:'rgba(255,255,255,0.05)',borderRadius:4,width:'60%',margin:'0 auto' }}/>
                  </div>
                ))
              : doctors.map((d,i)=>{
                  const name=d.userId?.fullName||'Həkim';
                  const ini=name.split(' ').map(n=>n[0]).join('').slice(0,2);
                  const m=DEPT_META[d.specialization]||{color:'#00BCD4',label:d.specialization};
                  return (
                    <div key={i} className="reveal" style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:28,textAlign:'center',transition:'all .3s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.transform='translateY(-4px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.transform='none';}}>
                      <div style={{ width:72,height:72,borderRadius:'50%',background:`linear-gradient(135deg,${m.color},${m.color}66)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:22,fontWeight:700 }}>{ini}</div>
                      <h3 style={{ fontSize:15,fontWeight:700,marginBottom:3 }}>{name}</h3>
                      <p style={{ color:m.color,fontSize:12,fontWeight:600,marginBottom:5 }}>{m.label||d.specialization}</p>
                      {d.experience&&<p style={{ color:'rgba(255,255,255,0.35)',fontSize:11,marginBottom:12 }}>{d.experience} il təcrübə</p>}
                      <Link to="/randevu" style={{ display:'inline-block',padding:'7px 16px',background:`${m.color}18`,border:`1px solid ${m.color}44`,borderRadius:8,color:m.color,fontSize:12,fontWeight:600,textDecoration:'none' }}>Randevu Al</Link>
                    </div>
                  );
                })
            }
          </div>
          <div className="reveal" style={{ textAlign:'center',marginTop:40 }}>
            <Link to="/hekimler" style={{ padding:'12px 28px',background:'transparent',border:'1px solid rgba(0,188,212,0.4)',borderRadius:10,color:'#00BCD4',fontWeight:600,fontSize:14,textDecoration:'none',transition:'all .2s' }}>
              Bütün həkimləri gör →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOOKING CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding:'96px 56px',maxWidth:680,margin:'0 auto' }}>
        <div className="reveal" style={{ textAlign:'center',marginBottom:48 }}>
          <h2 style={{ fontSize:'clamp(28px,3vw,42px)',fontWeight:800,margin:'0 0 14px' }}>Randevu Al</h2>
          <p style={{ color:'rgba(255,255,255,0.45)',fontSize:16 }}>Həkimlə onlayn görüş təyin edin</p>
        </div>
        <div className="reveal" style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'40px 44px',backdropFilter:'blur(8px)' }}>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {[{l:'Ad Soyad',t:'text',ph:'Adınızı daxil edin'},{l:'Telefon',t:'tel',ph:'+994 50 000 00 00'},{l:'Tarix',t:'date',ph:''}].map(f=>(
              <div key={f.l}>
                <label style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5,letterSpacing:'0.1em',textTransform:'uppercase' }}>{f.l}</label>
                <input type={f.t} placeholder={f.ph} style={{ width:'100%',height:46,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'0 14px',color:'#fff',fontSize:14,fontFamily:'inherit',outline:'none',boxSizing:'border-box',colorScheme:'dark' }}/>
              </div>
            ))}
            <Link to="/randevu" style={{ display:'block',marginTop:6,height:50,background:'linear-gradient(135deg,#00BCD4,#0284C7)',border:'none',borderRadius:10,color:'#fff',fontSize:15,fontWeight:700,textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 24px rgba(0,188,212,0.25)' }}>
              Randevunu Göndər →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)',padding:'36px 56px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14 }}>
        <div style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:800 }}>Elmir<span style={{ color:'#00BCD4' }}>Med</span></div>
        <div style={{ color:'rgba(255,255,255,0.25)',fontSize:13 }}>© 2026 ElmirMed. Bütün hüquqlar qorunur.</div>
        <a href="tel:112" style={{ color:'#FCA5A5',fontSize:13,textDecoration:'none',fontWeight:600 }}>🚨 Təcili: 112</a>
      </footer>

      <style>{`@keyframes pulse2{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
