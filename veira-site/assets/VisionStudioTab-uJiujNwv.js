import {hasPremium,isFreeTemplate,requestPremium} from "./premium-access.js";
import {exportBoardPng} from "./board-export.js";
import {collageTemplates,collageTiles,collageCaptions,collagePhoto,collageNotes} from "./board-collage.js";
const boardFormats=[
 {id:"iphone",label:"iPhone ekranı",width:1179,height:2556,layouts:["phone-"]},
 {id:"story",label:"Instagram Hikâye",width:1080,height:1920,layouts:["phone-"]},
 {id:"square",label:"Kare",width:1080,height:1080,layouts:["polaroid-scatter","aura-gradient","bento-lux"]},
 {id:"medium",label:"Orta widget",width:1080,height:540,layouts:["horizontal-panels","editorial-newspaper"]},
 {id:"large",label:"Büyük widget",width:1080,height:1080,layouts:["bento-lux","editorial-newspaper","polaroid-scatter"]}
];
import{listBoards,saveBoard,readBoardPhoto,drawBoardPhotos,drawBoardLayers,drawCollage}from"./board-storage.js";
import{r as Z}from"./rolldown-runtime-Drvvfanw.js";import{c as Y,d as J}from"./vendor-react-Cyg13_s7.js";import{n as X}from"./index-14glUDO-.js";var x=Z(J(),1),e=Y(),A={"bg-secondary":{bg:"#f5d061",fg:"#241a00"},"bg-emerald-400":{bg:"#34d399",fg:"#022c22"},"bg-teal-200":{bg:"#99f6e4",fg:"#042f2e"},"bg-amber-300":{bg:"#fcd34d",fg:"#451a03"},"bg-lime-300":{bg:"#bef264",fg:"#1a2e05"},"bg-cyan-300":{bg:"#67e8f9",fg:"#083344"},"bg-rose-300":{bg:"#fda4af",fg:"#4c0519"},"bg-purple-300":{bg:"#d8b4fe",fg:"#3b0764"},"bg-sky-200":{bg:"#bae6fd",fg:"#082f49"},"bg-amber-100":{bg:"#fef3c7",fg:"#1c1917"}};function H(l){const t=l.tapeColor.split(" ")[0];return A[t]||A["bg-secondary"]}function B(l,t){const u=l.filter(Boolean);return u.length?Array.from({length:t},(i,b)=>u[b%u.length]):Array.from({length:t},()=>"")}function ee({src:l,className:t}){const[u,i]=(0,x.useState)(!0);return!l||!u?(0,e.jsx)("div",{className:`grid place-items-center bg-gradient-to-br from-[#2a3158] to-[#12162c] text-[#c0c1ff] ${t||""}`,children:(0,e.jsx)("span",{className:"material-symbols-outlined text-[16px]",children:"image"})}):(0,e.jsx)("img",{src:l,alt:"",className:`h-full w-full object-cover object-center ${t||""}`,onError:()=>i(!1)})}function E(props){return(0,e.jsx)("div",{className:"veira-board-art veira-layer-surface",children:[(0,e.jsx)(BoardArtwork,props),(0,e.jsx)(BoardLayers,{layers:props.edit?.layers??[],moveLayer:props.edit?.moveLayer})]})}
const layerStyles = [
  {label:"Altın",color:"#f5d061"},
  {label:"Lavanta",color:"#b9a6f5"},
  {label:"Adaçayı",color:"#a2d3b4"},
  {label:"Gül",color:"#efaab8"}
];

function BoardLayers({layers,moveLayer}) {
  return layers.map(layer=>(0,e.jsx)("div",{
    className:"veira-free-layer veira-free-"+layer.kind,
    style:{left:layer.x+"%",top:layer.y+"%",backgroundColor:(layer.kind==="washi"||layer.kind==="label")?layer.color:undefined},
    tabIndex:moveLayer?0:undefined,
    role:moveLayer?"group":undefined,
    "aria-label":layer.kind==="photo"?"Fotoğraf":layer.text,
    ref:element=>{
      if(!element)return;
      element.onpointerdown=moveLayer?event=>{
      if(event.button!==0)return;
      event.preventDefault();
      const surface=event.currentTarget.parentElement.getBoundingClientRect();
      const bounds=event.currentTarget.getBoundingClientRect();
      if(!surface.width||!surface.height)return;
      const limitX=Math.min(50,bounds.width*50/surface.width);
      const limitY=Math.min(50,bounds.height*50/surface.height);
      const element=event.currentTarget;
      const pointer=event.pointerId;
      const startX=event.clientX;
      const startY=event.clientY;
      const listeners=new AbortController();
      let moved=false;
      const update=pointerEvent=>{
        if(pointerEvent.pointerId!==pointer)return;
        const dx=pointerEvent.clientX-startX;
        const dy=pointerEvent.clientY-startY;
        if(!moved&&Math.hypot(dx,dy)<8)return;
        moved=true;
        moveLayer(layer.id,layer.x+dx*100/surface.width,layer.y+dy*100/surface.height,limitX,limitY);
      };
      const finish=pointerEvent=>{
        if(pointerEvent.pointerId===pointer)listeners.abort();
      };
      const options={signal:listeners.signal};
      element.setPointerCapture(pointer);
      element.addEventListener("pointermove",update,options);
      element.addEventListener("pointerup",pointerEvent=>{update(pointerEvent);finish(pointerEvent)},options);
      element.addEventListener("pointercancel",finish,options);
      element.addEventListener("lostpointercapture",finish,options);
      }:null;
    },
    onKeyDown:moveLayer?event=>{
      const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[event.key];
      if(!delta)return;
      event.preventDefault();
      moveLayer(layer.id,layer.x+delta[0],layer.y+delta[1]);
    }:undefined,
    children:layer.kind==="photo"?(0,e.jsx)("img",{src:layer.src,alt:"",draggable:false}):layer.text
  },layer.id));
}

function CollagePhoto({source}) {
  const {url,crop}=collagePhoto(source);
  const [image,setImage]=x.useState(null);
  const container=x.useRef(null);
  const [size,setSize]=x.useState(null);
  x.useEffect(()=>{
    if(!crop||!container.current)return;
    const observer=new ResizeObserver(([entry])=>setSize(entry.contentRect));
    observer.observe(container.current);
    return ()=>observer.disconnect();
  },[source]);
  const style={};
  if(crop&&size&&image?.src===url){
    const [left,top,width,height]=crop;
    const scale=Math.max(size.width/width,size.height/height);
    Object.assign(style,{width:image.width*scale,height:image.height*scale,maxWidth:"none",position:"absolute",
      left:(size.width-width*scale)/2-left*scale,top:(size.height-height*scale)/2-top*scale});
  }
  return (0,e.jsx)("span",{ref:container,className:"veira-photo-frame",children:(0,e.jsx)("img",{
    key:url,src:url,alt:"",loading:"lazy",decoding:"async",draggable:false,style,
    onLoad:crop?event=>setImage({src:url,width:event.currentTarget.naturalWidth,height:event.currentTarget.naturalHeight}):undefined
  })});
}
function CollageArtwork({template,edit,format}) {
  const ratio=format?format.width/format.height:1;
  const photos=(edit?.slots??template.thumbnails).slice(0,template.imgs.length);
  const tiles=collageTiles(photos.length,ratio,template.variant);
  const captions=collageCaptions[template.variant%3];
  const [stamp,note]=collageNotes[template.variant];
  const captionStyle=index=>{
    const {x,y,angle}=captions[index];
    return {left:x+"%",top:y+"%",transform:"translate(-50%,-50%) rotate("+angle+"deg)"};
  };
  return (0,e.jsxs)("div",{className:"veira-collage veira-collage-"+["scrapbook","editorial","polaroid"][template.variant%3]+(edit?.serif===false?" veira-collage-sans":""),style:{aspectRatio:ratio,backgroundColor:template.paper,"--collage-paper":template.ink},children:[
    ...tiles.map(({x:left,y:top,w:width,h:height,angle},index)=>(0,e.jsx)(edit?.onPick?"button":"div",{
      type:edit?.onPick?"button":undefined,
      "aria-label":edit?.onPick?"Fotoğraf "+(index+1)+" değiştir":undefined,
      onClick:edit?.onPick?()=>edit.onPick(index):undefined,
      className:"veira-collage-photo",
      style:{left:left+"%",top:top+"%",width:width+"%",height:height+"%",transform:"translate(-50%,-50%) rotate("+angle+"deg)"},
      children:(0,e.jsx)(CollagePhoto,{source:photos[index]})
    },index)),
    (0,e.jsx)("span",{className:"veira-collage-tape",style:captionStyle(0),children:edit?.tape??template.tape}),
    template.variant%3===0&&(0,e.jsx)("span",{className:"veira-collage-paper-star","aria-hidden":true,children:"✧"}),
    (0,e.jsx)("strong",{className:"veira-collage-title",style:captionStyle(1),children:edit?.headline??template.headline}),
    (0,e.jsx)("em",{className:"veira-collage-quote",style:captionStyle(2),children:edit?.quote??template.quote}),
    (0,e.jsx)("span",{className:"veira-paper-stamp",children:stamp}),
    (0,e.jsx)("span",{className:"veira-paper-note",children:note}),
    (0,e.jsx)("span",{className:"veira-photo-washi veira-photo-washi-top","aria-hidden":true}),
    (0,e.jsx)("span",{className:"veira-photo-washi veira-photo-washi-bottom","aria-hidden":true})
  ]});
}
function BoardArtwork({template:l,edit:t,format}){if(l.layout==="collage")return (0,e.jsx)(CollageArtwork,{template:l,edit:t,format});const u=H(l),i=t?.headline??l.headline,b=t?.quote??l.quote,g=t?.tape??l.tape,j=t?.press??l.press??"",m=t?.slots?.length?t.slots:B(l.imgs,8),f=t?.serif===!1?"font-sans":"font-serif",a=!!t?.fill,k=o=>m[o%Math.max(m.length,1)],n=({index:o,className:r})=>{const w=(0,e.jsx)(ee,{src:k(o),className:"absolute inset-0 h-full w-full"});return t?.onPick?(0,e.jsx)("button",{type:"button",onClick:()=>t.onPick?.(o),className:`relative block overflow-hidden text-left ${r}`,children:w}):(0,e.jsx)("div",{className:`relative overflow-hidden ${r}`,children:w})},z=({className:o})=>t?.onHeadline?(0,e.jsx)("textarea",{ref:t.headlineRef,value:i,onChange:r=>t.onHeadline?.(r.target.value),rows:2,className:`w-full resize-none bg-transparent outline-none ${o}`}):(0,e.jsx)("p",{className:o,children:i}),$=({className:o})=>t?.onQuote?(0,e.jsx)("textarea",{ref:t.quoteRef,value:b,onChange:r=>t.onQuote?.(r.target.value),rows:2,className:`w-full resize-none bg-transparent outline-none ${o}`}):(0,e.jsxs)("p",{className:o,children:['"',b,'"']}),p=(0,e.jsx)("span",{className:"rounded-sm px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest",style:{background:u.bg,color:u.fg},children:g});if(l.layout.startsWith("phone-")){const o=a?"h-full min-h-0":"mx-auto aspect-[9/16] w-full max-w-[340px]",r="h-full min-h-0 w-full",w=(h,T,c)=>(0,e.jsx)("div",{className:`grid h-[16%] shrink-0 gap-1 ${c}`,children:Array.from({length:T},(F,S)=>(0,e.jsx)(n,{index:h+S,className:`${r} rounded-md`},`${l.layout}-${h}-${S}`))});let N=null;return l.layout==="phone-polaroid"?N=(0,e.jsx)("div",{className:`${o} overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024]`,children:(0,e.jsxs)("div",{className:"flex h-full min-h-0 flex-col gap-2 p-2.5",children:[(0,e.jsxs)("div",{className:"flex shrink-0 items-center justify-between",children:[p,(0,e.jsx)("span",{className:"max-w-[46%] truncate text-[8px] uppercase tracking-wider text-[#f5d061]",children:l.badge})]}),(0,e.jsxs)("div",{className:"flex min-h-0 flex-1 items-center justify-center gap-2 overflow-hidden",children:[(0,e.jsx)("div",{className:"w-[46%] -rotate-2 rounded-lg bg-white p-1 pb-2 shadow-xl",children:(0,e.jsx)(n,{index:0,className:"aspect-[3/4] w-full rounded-sm"})}),(0,e.jsx)("div",{className:"mt-5 w-[46%] rotate-2 rounded-lg bg-white p-1 pb-2 shadow-xl",children:(0,e.jsx)(n,{index:1,className:"aspect-[3/4] w-full rounded-sm"})})]}),w(2,6,"grid-cols-6")]})}):l.layout==="phone-film"?N=(0,e.jsx)("div",{className:`${o} overflow-hidden rounded-2xl border border-white/10 bg-[#080b18]`,children:(0,e.jsxs)("div",{className:"flex h-full min-h-0 flex-col gap-1.5 p-2",children:[(0,e.jsxs)("div",{className:"flex shrink-0 items-center justify-between",children:[p,(0,e.jsx)("span",{className:"text-[8px] font-mono tracking-widest text-white/70",children:"35MM"})]}),(0,e.jsx)("div",{className:"grid min-h-0 flex-1 grid-cols-3 gap-1 rounded-lg bg-black p-1",children:[0,1,2].map(h=>(0,e.jsx)(n,{index:h,className:`${r} rounded`},`film-${h}`))}),w(3,5,"grid-cols-5")]})}):l.layout==="phone-asymmetric"?N=(0,e.jsx)("div",{className:`${o} overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d20]`,children:(0,e.jsxs)("div",{className:"flex h-full min-h-0 flex-col gap-1.5 p-2",children:[(0,e.jsxs)("div",{className:"flex shrink-0 items-center justify-between",children:[p,(0,e.jsx)("span",{className:"max-w-[46%] truncate text-[8px] font-mono text-[#c0c1ff]",children:l.badge})]}),(0,e.jsxs)("div",{className:"grid min-h-0 flex-1 grid-cols-12 gap-1",children:[(0,e.jsx)(n,{index:0,className:`col-span-5 ${r} rounded-lg`}),(0,e.jsx)("div",{className:"col-span-7 grid min-h-0 grid-cols-2 grid-rows-2 gap-1",children:[1,2,3,4].map(h=>(0,e.jsx)(n,{index:h,className:`${r} rounded`},`asy-${h}`))})]}),(0,e.jsxs)("div",{className:"grid h-[18%] shrink-0 grid-cols-12 gap-1",children:[(0,e.jsx)("div",{className:"col-span-7 grid grid-cols-3 gap-1",children:[5,6,7].map(h=>(0,e.jsx)(n,{index:h,className:`${r} rounded`},`asyb-${h}`))}),(0,e.jsx)("div",{className:"col-span-5 flex items-center overflow-hidden rounded-lg bg-[#161c38] px-1.5",children:(0,e.jsxs)("p",{className:`line-clamp-3 text-[9px] italic leading-tight text-white/90 ${f}`,children:['"',b,'"']})})]})]})}):l.layout==="phone-bento"?N=(0,e.jsx)("div",{className:`${o} overflow-hidden rounded-2xl border border-white/10 bg-[#10142b]`,children:(0,e.jsxs)("div",{className:"flex h-full min-h-0 flex-col gap-1.5 p-2",children:[(0,e.jsxs)("div",{className:"relative shrink-0 rounded-lg border border-white/10 bg-[#181d3d] px-2 pb-1.5 pt-3",children:[(0,e.jsx)("span",{className:"absolute -top-2 left-3 max-w-[70%] truncate",children:p}),(0,e.jsx)("span",{className:"block truncate text-[8px] uppercase tracking-widest text-[#8a8ea8]",children:j}),(0,e.jsx)("p",{className:`line-clamp-2 text-[12px] font-bold leading-tight text-white ${f}`,children:i})]}),(0,e.jsxs)("div",{className:"grid min-h-0 flex-1 grid-cols-12 gap-1",children:[(0,e.jsx)(n,{index:0,className:`col-span-7 ${r} rounded-lg`}),(0,e.jsxs)("div",{className:"col-span-5 grid min-h-0 grid-rows-2 gap-1",children:[(0,e.jsx)(n,{index:1,className:`${r} rounded-lg`}),(0,e.jsx)(n,{index:2,className:`${r} rounded-lg`})]})]}),(0,e.jsx)("div",{className:"shrink-0 overflow-hidden rounded bg-[#1d2342] px-2 py-1",children:(0,e.jsxs)("p",{className:`line-clamp-2 text-[10px] italic text-white/90 ${f}`,children:['"',b,'"']})}),w(3,5,"grid-cols-5")]})}):N=(0,e.jsx)("div",{className:`${o} overflow-hidden rounded-2xl border border-white/10 bg-[#0d1127]`,children:(0,e.jsxs)("div",{className:"flex h-full min-h-0 flex-col gap-1.5 p-2",children:[(0,e.jsxs)("div",{className:"flex shrink-0 items-center justify-between gap-2",children:[p,(0,e.jsx)("span",{className:"max-w-[46%] truncate text-[8px] font-mono text-[#f5d061]",children:l.badge})]}),(0,e.jsx)(n,{index:0,className:"aspect-[4/5] w-full shrink-0 rounded-lg"}),(0,e.jsxs)("div",{className:"grid min-h-0 flex-1 grid-cols-2 gap-1",children:[(0,e.jsx)(n,{index:1,className:`${r} rounded-lg`}),(0,e.jsx)(n,{index:2,className:`${r} rounded-lg`})]}),w(3,5,"grid-cols-5")]})}),N}if(l.layout==="editorial-newspaper-8"||l.layout==="bento-lux-8"){const o=l.layout==="bento-lux-8";return(0,e.jsxs)("div",{className:`flex flex-col gap-1.5 rounded-xl border border-white/10 bg-[#10142b] p-2 ${a?"h-full min-h-0":""}`,children:[(0,e.jsxs)("div",{className:"relative shrink-0 rounded-lg border border-white/10 bg-[#181d3d] px-2 pb-1.5 pt-3",children:[(0,e.jsx)("span",{className:"absolute -top-2 left-3",children:p}),(0,e.jsx)("span",{className:"block text-[8px] uppercase tracking-widest text-[#8a8ea8]",children:j}),(0,e.jsx)(z,{className:`font-bold leading-tight text-white ${a?"text-sm":"truncate text-[12px]"} ${f}`})]}),o?(0,e.jsxs)("div",{className:`grid grid-cols-12 gap-1 ${a?"min-h-0 flex-1":"h-32"}`,children:[(0,e.jsx)(n,{index:0,className:"col-span-5 h-full w-full rounded-md"}),(0,e.jsx)("div",{className:"col-span-7 grid h-full grid-cols-2 grid-rows-2 gap-1",children:[1,2,3,4].map(r=>(0,e.jsx)(n,{index:r,className:"h-full w-full rounded"},`b-${r}`))})]}):(0,e.jsxs)("div",{className:`grid grid-cols-12 gap-1 ${a?"min-h-0 flex-1 grid-rows-1":""}`,children:[(0,e.jsx)(n,{index:0,className:`col-span-7 w-full rounded-md ${a?"h-full":"h-24"}`}),(0,e.jsx)(n,{index:1,className:`col-span-5 w-full rounded-md ${a?"h-full":"h-24"}`})]}),(0,e.jsx)($,{className:`shrink-0 px-1 italic text-white/80 ${a?"line-clamp-3 text-[11px]":"truncate text-[10px]"} ${f}`}),(0,e.jsx)("div",{className:`grid grid-cols-6 gap-1 ${a?"h-16 shrink-0":"h-12"}`,children:[2,3,4,5,6,7].map(r=>(0,e.jsx)(n,{index:r,className:"h-full w-full rounded"},`s-${r}`))})]})}return l.layout==="polaroid-scatter"?(0,e.jsxs)("div",{className:`relative flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0c1024] ${a?"h-full min-h-0":"h-52"}`,children:[(0,e.jsx)("span",{className:"absolute left-4 top-2 z-20",children:p}),(0,e.jsxs)("div",{className:`absolute left-[6%] -rotate-6 rounded-lg bg-white p-1 pb-3 shadow-xl ${a?"w-[42%]":"w-28"}`,children:[(0,e.jsx)(n,{index:0,className:"aspect-square h-auto w-full rounded"}),(0,e.jsx)("span",{className:"mt-1 block text-center font-serif text-[8px] font-bold text-slate-800",children:"Manifest"})]}),(0,e.jsxs)("div",{className:`absolute right-[6%] rotate-6 rounded-lg bg-white p-1 pb-3 shadow-xl ${a?"w-[42%]":"w-28"}`,children:[(0,e.jsx)(n,{index:1,className:"aspect-square h-auto w-full rounded"}),(0,e.jsx)("span",{className:"mt-1 block text-center font-serif text-[8px] font-bold text-slate-800",children:"Divine Flow"})]})]}):l.layout==="aura-gradient"?(0,e.jsxs)("div",{className:`flex flex-col items-center justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-tr from-[#140f2b] via-[#10142c] to-[#0a182b] p-3 ${a?"h-full min-h-0":"h-52"}`,children:[p,(0,e.jsxs)("div",{className:"flex min-h-0 flex-1 items-center gap-2 py-2",children:[(0,e.jsx)(n,{index:0,className:`${a?"h-full max-h-40 w-28":"h-24 w-24"} shrink-0 rounded-full border-2 border-[#f5d061]/60`}),(0,e.jsx)(n,{index:1,className:`${a?"h-full max-h-44 w-32":"h-24 w-28"} shrink-0 rounded-2xl`})]}),(0,e.jsx)($,{className:`text-center italic text-white ${a?"text-sm":"text-xs"} ${f}`})]}):l.layout==="bento-lux"?(0,e.jsxs)("div",{className:`grid grid-cols-12 gap-1.5 rounded-xl border border-white/10 bg-[#0a0d1e] p-2 ${a?"h-full min-h-0":"h-52"}`,children:[(0,e.jsxs)("div",{className:"relative col-span-7 overflow-hidden rounded-lg",children:[(0,e.jsx)(n,{index:0,className:"absolute inset-0 h-full w-full"}),(0,e.jsx)("span",{className:"absolute left-2 top-2",children:p})]}),(0,e.jsxs)("div",{className:"col-span-5 flex flex-col gap-1.5",children:[(0,e.jsx)(n,{index:1,className:"min-h-0 w-full flex-1 rounded-lg"}),(0,e.jsx)(n,{index:2,className:"min-h-0 w-full flex-1 rounded-lg"})]})]}):(0,e.jsxs)("div",{className:`flex flex-col justify-between rounded-xl border border-white/10 bg-[#13172e] p-2 ${a?"h-full min-h-0":"h-52"}`,children:[(0,e.jsxs)("div",{className:"shrink-0 rounded-lg border border-white/10 bg-[#1b203d] px-2 py-1.5",children:[(0,e.jsx)("span",{className:"text-[8px] uppercase tracking-widest text-[#8a8ea8]",children:j}),(0,e.jsx)(z,{className:`font-bold text-white ${a?"text-sm":"truncate text-[13px]"} ${f}`})]}),(0,e.jsx)("div",{className:`grid grid-cols-3 gap-1.5 py-1.5 ${a?"min-h-0 flex-1 grid-rows-1":""}`,children:[0,1,2].map(o=>(0,e.jsx)(n,{index:o,className:`w-full rounded-lg ${a?"h-full":"h-28"}`},`n-${o}`))}),(0,e.jsx)($,{className:`italic text-[#abaec9] ${a?"line-clamp-3 text-[11px]":"truncate text-[10px]"} ${f}`})]})}var ae=({onShowToast:l})=>{const[i,b]=(0,x.useState)(null),[g,j]=(0,x.useState)(""),[m,f]=(0,x.useState)(""),[a,k]=(0,x.useState)(""),[n,z]=(0,x.useState)(""),[$,p]=(0,x.useState)([]),[o,r]=(0,x.useState)(!0),[w,N]=(0,x.useState)(!1),[h,T]=(0,x.useState)(!1),[c,F]=(0,x.useState)("phone"),[formatId,setFormatId]=(0,x.useState)(null),[galleryFilter,setGalleryFilter]=x.useState("all"),galleryScroll=x.useRef(0),[boards,setBoards]=(0,x.useState)(()=>{try{return listBoards(localStorage)}catch{return[]}}),[layers,setLayers]=x.useState([]),[layerText,setLayerText]=x.useState(""),[layerStyle,setLayerStyle]=x.useState(layerStyles[0].color),[showSaved,setShowSaved]=x.useState(false),[boardId,setBoardId]=(0,x.useState)(null),[exporting,setExporting]=(0,x.useState)(false),[readingPhoto,setReadingPhoto]=(0,x.useState)(false),S=(0,x.useRef)(null),W=(0,x.useRef)(0),P=(0,x.useRef)(null),M=(0,x.useRef)(null),R=(0,x.useRef)(null),v=(0,x.useMemo)(()=>[...collageTemplates(X),...X].sort((s,d)=>Number(s.num.replace("#",""))-Number(d.num.replace("#",""))),[]),format=boardFormats.find(size=>size.id===formatId),G=v.filter(s=>!format||s.layout==="collage"||format.layouts.some(layout=>s.layout.startsWith(layout))),I=(template,saved)=>{if(!saved&&!isFreeTemplate(template)&&!hasPremium()){requestPremium();return;}galleryScroll.current=window.scrollY;if(saved)setFormatId(saved.formatId??null);setBoardId(saved?.id??crypto.randomUUID());b(template);setLayers(saved?.layers??[]);setLayerText("");j(saved?.headline??template.headline);f(saved?.quote??template.quote);k(saved?.tape??template.tape);z(saved?.press??template.press??"");p(B(template.imgs,Math.max(template.imgs.length,8)).map((photo,index)=>saved?.slots?.[index]??photo));r(saved?.serif??true);N(false);T(false);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}))},q=s=>{W.current=s,S.current?.click()},addLayer=(kind,content)=>{
  setLayers(previous=>{
    const column=previous.length%3;
    const row=Math.floor(previous.length/3)%3;
    return [...previous,{id:crypto.randomUUID(),kind,x:24+column*26,y:30+row*20,...content}];
  });
},moveLayer=(id,left,top,limitX=13,limitY=14)=>setLayers(previous=>previous.map(layer=>layer.id===id?{...layer,x:Math.max(limitX,Math.min(100-limitX,left)),y:Math.max(limitY,Math.min(100-limitY,top))}:layer)),O=async file=>{
  if (!file || readingPhoto) return;
  const slot = W.current;
  setReadingPhoto(true);
  try {
    const photo = await readBoardPhoto(file);
    if(slot===null)addLayer("photo",{src:photo});
    else p(slots=>slots.map((value,index)=>index===slot?photo:value));
  } catch {
    l?.("Fotoğraf açılamadı. Başka bir görsel seç.","error");
  } finally {
    setReadingPhoto(false);
  }
},saveCurrentBoard=()=>{
  if (!i || !boardId || readingPhoto) return;
  try {
    const saved = saveBoard(localStorage,{id:boardId,templateId:i.id,formatId,headline:g,quote:m,tape:a,press:n,slots:$,serif:o,layers});
    setBoards(previous=>[saved,...previous.filter(board=>board.id!==saved.id)]);
    l?.("Pano cihazına kaydedildi. Panom → Kayıtlı panolar.","check");
  } catch {
    l?.("Pano kaydedilemedi. Cihaz depolamasında yer açıp tekrar dene.","error");
  }
},Q=async()=>{
  if (!i || exporting || readingPhoto) return;
  setExporting(true);
  try {
    const canvas = document.createElement("canvas");
    canvas.width=format?.width??1080;canvas.height=format?.height??1920;
    const context=canvas.getContext("2d");
    if(i.layout==="collage"){
      await drawCollage(context,i,$,{headline:g,tape:a,quote:m,serif:o},canvas.width,canvas.height);
    } else {
    context.fillStyle="#050713";context.fillRect(0,0,canvas.width,canvas.height);
    const scale=Math.min(canvas.width/1080,canvas.height/1920);
    context.translate((canvas.width-1080*scale)/2,(canvas.height-1920*scale)/2);
    context.scale(scale,scale);
    context.fillStyle="#f5d061";context.font="700 28px sans-serif";context.fillText(a,72,110,936);
    context.fillStyle="#ffffff";context.font=o?"600 54px Georgia":"600 54px sans-serif";
    for (const [index,line] of wrapBoardText(context,g,936).slice(0,4).entries()) context.fillText(line,72,185+index*57);
    await drawBoardPhotos(context,$);
    context.fillStyle="#edeefc";context.font=o?"italic 38px Georgia":"italic 38px sans-serif";
    for (const [index,line] of wrapBoardText(context,m,936).slice(0,7).entries()) context.fillText(line,72,1410+index*52);
    context.fillStyle="#abaec9";context.font="24px sans-serif";context.fillText(n||i.name,72,1810,936);
    }
    context.setTransform(1,0,0,1,0,0);
    await drawBoardLayers(context,layers,canvas.width,canvas.height);
    const result=await exportBoardPng(canvas);
    if(result!=="cancelled") l?.(result==="native"?"Kaydetmek için paylaşım ekranından Dosyalara Kaydet veya görseli kaydet seçeneğini kullan.":"Pano PNG olarak indirildi.","wallpaper");
  } catch (error) {
    console.error("Board export failed",error);
    l?.("Pano indirilemedi. Bağlantını kontrol et veya açılamayan görseli cihazından bir fotoğrafla değiştir.","error");
  } finally {
    setExporting(false);
  }
};return i?H(i):A["bg-secondary"],i?(0,e.jsxs)("div",{className:"veira-board px-4 pb-8",children:[(0,e.jsx)("button",{type:"button",disabled:readingPhoto,onClick:saveCurrentBoard,className:"mb-3 rounded-full bg-[#f5d061] px-4 py-2 text-sm font-semibold text-[#241a00]",children:"Panoyu kaydet"}),(0,e.jsx)("input",{ref:S,type:"file",accept:"image/*",className:"hidden",onChange:s=>{O(s.target.files?.[0]),s.target.value=""}}),(0,e.jsxs)("div",{className:"veira-board-actions mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3",children:[(0,e.jsxs)("button",{type:"button",disabled:readingPhoto||exporting,onClick:()=>{b(null);requestAnimationFrame(()=>window.scrollTo(0,galleryScroll.current))},className:"flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1d2342] px-3 py-1.5 text-xs",children:[(0,e.jsx)("span",{className:"material-symbols-outlined text-[17px]",children:"arrow_back"}),"Panoma dön"]}),(0,e.jsxs)("button",{type:"button",disabled:exporting||readingPhoto,onClick:Q,className:"flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#f5d061] to-[#fde68a] px-3.5 py-1.5 text-xs font-bold text-[#241a00]",children:[(0,e.jsx)("span",{className:"material-symbols-outlined text-[17px]",children:"wallpaper"}),exporting?"Hazırlanıyor…":"PNG indir"]})]}),(0,e.jsxs)("div",{className:"veira-board-editor-heading mb-3 flex flex-wrap items-start justify-between gap-2 px-1",children:[(0,e.jsxs)("div",{children:[(0,e.jsxs)("div",{className:"text-[10px] font-bold uppercase tracking-widest text-[#f5d061]",children:i.badge}),(0,e.jsx)("h2",{className:"font-serif text-xl font-semibold",children:i.name})]}),(0,e.jsx)("button",{type:"button",onClick:()=>T(s=>!s),className:`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${h?"bg-[#f5d061] text-[#241a00]":"border border-[#f5d061]/30 bg-[#f5d061]/15 text-[#f5d061]"}`,children:h?"Düzenle":"Ön izleme"})]}),h?(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:"veira-preview-options mb-3 flex flex-wrap gap-1.5 rounded-2xl bg-[#151a33] p-1 [scrollbar-width:none]",children:[["phone","Telefon"],["tablet","Tablet"],["mac","Mac"],["watch","Saat"],["wide","Geniş"]].map(([s,d])=>(0,e.jsx)("button",{type:"button",onClick:()=>F(s),className:`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${c===s?"bg-[#f5d061] text-[#241a00]":"text-[#abaec9]"}`,children:d},s))}),(0,e.jsxs)("div",{className:`veira-board-preview mx-auto ${c==="phone"?"w-[240px]":c==="watch"?"w-[190px]":c==="tablet"?"w-full max-w-[420px]":"w-full"}`,children:[c==="mac"&&(0,e.jsx)("div",{className:"mx-auto mb-1 flex h-4 items-end justify-center",children:(0,e.jsx)("span",{className:"h-1.5 w-1.5 rounded-full bg-[#3a3a3c]"})}),(0,e.jsx)("div",{className:`overflow-hidden bg-[#0a0a0c] shadow-2xl ${c==="phone"?"rounded-[38px] border-[9px] border-[#2a2a2e]":c==="watch"?"rounded-[42px] border-[8px] border-[#2a2a2e]":c==="tablet"?"rounded-[28px] border-[12px] border-[#2a2a2e]":c==="wide"?"rounded-2xl border-[8px] border-[#2a2a2e]":"rounded-t-[14px] border-[10px] border-b-0 border-[#2a2a2e]"}`,children:(0,e.jsxs)("div",{style:format?{aspectRatio:format.width+"/"+format.height}:undefined,className:`relative flex flex-col bg-[#050713] ${c==="phone"?"aspect-[9/19.5] px-2 pb-2 pt-7":c==="watch"?"aspect-square px-2 py-3":c==="tablet"?"aspect-[3/4] p-3 pt-7":c==="wide"?"aspect-[21/9] p-3":"aspect-[16/10] p-3 pt-6"}`,children:[c!=="wide"&&c!=="watch"&&(0,e.jsx)("div",{className:`absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black ${c==="phone"?"top-2 h-4 w-20":"top-2 h-2 w-2"}`}),(0,e.jsx)("div",{className:"h-full min-h-0 flex-1",children:(0,e.jsx)(E,{template:i,format,edit:{headline:g,quote:m,tape:a,press:n,slots:$,serif:o,layers,fill:!0}})})]})}),c==="mac"&&(0,e.jsx)("div",{className:"mx-auto h-3 w-[108%] -translate-x-[4%] rounded-b-xl bg-[#3a3a3c]"}),c==="watch"&&(0,e.jsx)("div",{className:"mx-auto mt-2 h-8 w-1.5 rounded-full bg-[#2a2a2e]"})]})]}):(i.layout==="collage"||i.layout.startsWith("phone-"))?(0,e.jsxs)("div",{className:"flex flex-col gap-3",children:[(0,e.jsx)(E,{template:i,format,edit:{headline:g,quote:m,tape:a,press:n,slots:$,serif:o,layers,moveLayer,onPick:q}}),(0,e.jsx)("p",{className:"px-1 text-[11px] text-[#abaec9]",children:"Fotoğrafa dokun, kendi görselini koy."}),(0,e.jsxs)("label",{className:"block text-[11px] text-[#abaec9]",children:["Washi bant",(0,e.jsx)("input",{ref:R,value:a,onChange:s=>k(s.target.value),className:"mt-1 w-full rounded-xl border border-white/10 bg-[#1d2342] px-3 py-2 text-sm text-white outline-none"})]}),(0,e.jsxs)("label",{className:"block text-[11px] text-[#abaec9]",children:["Manşet",(0,e.jsx)("textarea",{ref:M,value:g,onChange:s=>j(s.target.value),rows:2,className:"mt-1 w-full resize-none rounded-xl border border-white/10 bg-[#1d2342] px-3 py-2 text-sm font-semibold text-white outline-none"})]}),(0,e.jsxs)("label",{className:"block text-[11px] text-[#abaec9]",children:["Niyet",(0,e.jsx)("textarea",{ref:P,value:m,onChange:s=>f(s.target.value),rows:3,className:"mt-1 w-full resize-none rounded-xl border border-white/10 bg-[#1d2342] px-3 py-2 text-sm italic text-white outline-none"})]}),(0,e.jsxs)("div",{className:"grid grid-cols-4 gap-2",children:[(0,e.jsx)(y,{icon:"add_photo_alternate",label:"Foto",tone:"#c0c1ff",onClick:()=>q(0)}),(0,e.jsx)(y,{icon:"label",label:"Etiket / Washi",tone:"#f5d061",onClick:()=>document.getElementById("veira-layer-tools")?.scrollIntoView({behavior:"smooth",block:"center"})}),(0,e.jsx)(y,{icon:"text_fields",label:"Yazı",tone:"#7bd0ff",onClick:()=>r(s=>!s)}),(0,e.jsx)(y,{icon:"format_quote",label:"Niyet",tone:"#fcd34d",onClick:()=>P.current?.focus()})]})]}):(0,e.jsx)(e.Fragment,{children:(0,e.jsx)(E,{template:i,format,edit:{headline:g,quote:m,tape:a,press:n,slots:$,serif:o,layers,moveLayer,onPick:q,onHeadline:j,onQuote:f,headlineRef:M,quoteRef:P}})}),!h&&(0,e.jsxs)("section",{id:"veira-layer-tools",className:"veira-layer-tools",children:[
  (0,e.jsx)("h3",{children:"Panoya ekle"}),
  (0,e.jsx)("p",{children:"Etiket için yazını gir ve Etiket ekle’ye dokun. Öğeleri panoda sürükleyebilirsin."}),
  (0,e.jsx)("input",{value:layerText,maxLength:80,placeholder:"Bant yazısı, metin veya niyet","aria-label":"Yeni öğenin yazısı",onChange:event=>setLayerText(event.target.value)}),
  (0,e.jsx)("select",{value:layerStyle,"aria-label":"Washi rengi",onChange:event=>setLayerStyle(event.target.value),children:layerStyles.map(style=>(0,e.jsx)("option",{value:style.color,children:style.label},style.color))}),
  (0,e.jsx)("div",{className:"veira-layer-buttons",children:[["Washi ekle","washi"],["Etiket ekle","label"],["Yazı ekle","text"],["Niyet ekle","quote"],["Fotoğraf ekle","photo"]].map(([label,kind])=>(0,e.jsx)("button",{type:"button",disabled:readingPhoto||((kind==="text"||kind==="quote"||kind==="label")&&!layerText.trim()),onClick:()=>{if(kind==="photo")q(null);else {addLayer(kind,{text:layerText.trim(),color:layerStyle});setLayerText("")}},children:label},kind))}),
  layers.length>0&&(0,e.jsx)("ul",{children:layers.map((layer,index)=>(0,e.jsxs)("li",{children:[layer.text|| (layer.kind==="photo"?"Fotoğraf":"Washi bant"),(0,e.jsx)("button",{type:"button","aria-label":"Öğeyi kaldır "+(index+1),onClick:()=>setLayers(previous=>previous.filter(item=>item.id!==layer.id)),children:"Kaldır"})]},layer.id))})
]}),!h&&i.layout!=="collage"&&!i.layout.startsWith("phone-")&&(0,e.jsxs)("div",{className:"mt-4",children:[(0,e.jsxs)("div",{className:"mb-2 flex items-center justify-between px-1",children:[(0,e.jsx)("span",{className:"text-xs font-semibold",children:"Kanvas araçları"}),(0,e.jsx)("span",{className:"text-[11px] text-[#abaec9]",children:layers.length+" eklenen öğe"})]}),(0,e.jsxs)("div",{className:"veira-board-tools grid grid-cols-5 gap-2",children:[(0,e.jsx)(y,{icon:"add_photo_alternate",label:"Foto",tone:"#c0c1ff",onClick:()=>q(1)}),(0,e.jsx)(y,{icon:"label",label:"Etiket / Washi",tone:"#f5d061",onClick:()=>document.getElementById("veira-layer-tools")?.scrollIntoView({behavior:"smooth",block:"center"})}),(0,e.jsx)(y,{icon:"text_fields",label:"Tipografi",tone:"#7bd0ff",onClick:()=>r(s=>!s)}),(0,e.jsx)(y,{icon:"newspaper",label:"Kupür",tone:"#fcd34d",onClick:()=>M.current?.focus()}),(0,e.jsx)(y,{icon:"layers",label:"Katmanlar",tone:"#abaec9",onClick:()=>N(s=>!s)})]}),(0,e.jsxs)("label",{className:"mt-3 block text-[11px] text-[#abaec9]",children:["Washi bant",(0,e.jsx)("input",{ref:R,value:a,onChange:s=>k(s.target.value),className:"mt-1 w-full rounded-xl border border-white/10 bg-[#1d2342] px-3 py-2 text-sm text-white outline-none"})]}),w&&(0,e.jsx)("div",{className:"mt-3 space-y-1 rounded-2xl bg-[#151a33] p-3 text-sm",children:layers.length?layers.map((layer,index)=>(0,e.jsx)("div",{children:layer.text||(layer.kind==="photo"?"Fotoğraf "+(index+1):"Washi bant")},layer.id)):(0,e.jsx)("p",{children:"Henüz öğe eklemedin."})})]})]}):(0,e.jsxs)("div",{className:"veira-board px-4 pb-8",children:[(0,e.jsxs)("div",{className:"mb-4 mt-1",children:[(0,e.jsx)("h1",{className:"font-serif text-[26px] font-semibold text-white",children:[(0,e.jsx)("img",{src:"/icon.svg",alt:"",width:28,height:28,style:{display:"inline-block",marginRight:8,verticalAlign:"middle"}}),"Hayal Panom"]})]}),showSaved?(0,e.jsxs)("section",{className:"veira-saved-boards space-y-2",children:[(0,e.jsx)("button",{type:"button",onClick:()=>{setShowSaved(false);setFormatId(null);setGalleryFilter("all");window.scrollTo(0,0)},children:"Boyut seçimine dön"}),(0,e.jsx)("h2",{children:"Kayıtlı panolar"}),boards.length?boards.map(board=>{const template=v.find(item=>String(item.id)===String(board.templateId));return template&&(0,e.jsx)("button",{type:"button",className:"veira-board-saved block w-full rounded-xl border p-3 text-left",onClick:()=>I(template,board),children:board.headline?.trim()&&board.headline!==template.headline?board.headline:template.name},board.id)}):(0,e.jsx)("p",{children:"Kaydettiğin panolar bu cihazda burada görünür."})]}):(0,e.jsx)("button",{type:"button",className:"veira-saved-entry",onClick:()=>setShowSaved(true),children:"Kayıtlı panolar ("+boards.length+")"}),!showSaved&&!format&&(0,e.jsxs)("section",{className:"veira-size-picker",children:[
 (0,e.jsx)("h2",{children:"Pano boyutunu seç"}),
 (0,e.jsx)("div",{className:"veira-size-grid",children:boardFormats.map(size=>(0,e.jsxs)("button",{type:"button",onClick:()=>{setFormatId(size.id);setGalleryFilter("all");window.scrollTo(0,0)},children:[
  (0,e.jsx)("span",{className:"veira-size-preview","aria-hidden":true,children:(0,e.jsx)("span",{style:{aspectRatio:size.width+"/"+size.height,width:size.width<size.height?"44%":"68%"}})}),
  (0,e.jsx)("span",{children:size.label})
 ]},size.id))})
]}),!showSaved&&format&&(0,e.jsxs)("div",{className:"veira-size-selection",children:[
 (0,e.jsx)("button",{type:"button",onClick:()=>{setFormatId(null);window.scrollTo(0,0)},children:"Boyutu değiştir"}),
 (0,e.jsx)("h2",{children:format.label+" şablonları"}),
 (0,e.jsx)("a",{href:"/assets/veira-kendi-ritmimde.png",target:"_blank",rel:"noreferrer",children:"Kolaj örneğini gör"})
]}),!showSaved&&format&&(0,e.jsxs)("div",{className:"veira-template-filters",role:"group","aria-label":"Şablon türü",children:[
 ...[["all","Tümü"],["collage","Fotoğraflı kolaj"],["classic","Klasik"]].map(([value,label])=>(0,e.jsx)("button",{type:"button","aria-pressed":galleryFilter===value,onClick:()=>setGalleryFilter(value),children:label},value))
]}),!showSaved&&format&&(0,e.jsx)("div",{className:"veira-template-gallery",children:G.filter(template=>galleryFilter==="all"||(template.layout==="collage")===(galleryFilter==="collage")).sort((a,b)=>Number(b.layout==="collage")-Number(a.layout==="collage")).map(s=>(0,e.jsxs)("article",{className:"veira-board-template veira-template-card",children:[
 (0,e.jsx)("div",{className:"veira-template-preview",children:(0,e.jsx)(E,{template:s,format})}),
 (0,e.jsxs)("div",{className:"veira-template-footer",children:[
   (0,e.jsx)("h3",{children:s.name}),
   (0,e.jsx)("button",{type:"button",onClick:()=>I(s),"aria-label":s.name+" şablonunu düzenle",children:isFreeTemplate(s)||hasPremium()?"Düzenle":"Premium"})
 ]})
]},s.id))})]})};function y({icon:l,label:t,tone:u,onClick:i}){return(0,e.jsxs)("button",{type:"button",onClick:i,className:"flex flex-col items-center rounded-xl border border-white/5 bg-[#1d2342] py-2.5 active:scale-95",children:[(0,e.jsx)("span",{className:"material-symbols-outlined text-[20px]",style:{color:u},children:l}),(0,e.jsx)("span",{className:"text-[10px]",children:t})]})}function wrapBoardText(context,text,width){
  const lines=[];
  let line="";
  for(const word of text.trim().split(/\s+/)){
    const next=line?line+" "+word:word;
    if(line&&context.measureText(next).width>width){lines.push(line);line=word}
    else line=next;
  }
  if(line)lines.push(line);
  return lines;
}
export{ae as VisionStudioTab};
