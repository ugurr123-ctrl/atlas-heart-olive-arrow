import{r as runtime}from"./rolldown-runtime-Drvvfanw.js";
import{c as jsx,d as react}from"./vendor-react-Cyg13_s7.js";
import{premiumPlans,loadPremiumProducts,purchasePremium,restorePremium,refreshPremium}from"./premium-access.js";
const R=runtime(react(),1),e=jsx();
function VeiraPremiumModal({isOpen,onClose,onShowToast}) {
 const ref=R.useRef(null),[open,setOpen]=R.useState(false),[selected,setSelected]=R.useState(0),[products,setProducts]=R.useState([]),[busy,setBusy]=R.useState(false),[message,setMessage]=R.useState('');
 const close=()=>{setOpen(false);onClose?.();};
 R.useEffect(()=>{const fn=()=>setOpen(true);window.addEventListener('veira:premium-open',fn);return()=>window.removeEventListener('veira:premium-open',fn);},[]);
 R.useEffect(()=>{if(isOpen)setOpen(true);},[isOpen]);
 R.useEffect(()=>{if(!open){ref.current?.close();return;}ref.current?.showModal();let live=true;setMessage('Planlar mağazadan yükleniyor…');setProducts([]);loadPremiumProducts().then(items=>{if(live){setProducts(items);setMessage(items.length?'':'Abonelikler henüz mağazada satışa açık değil.');}}).catch(error=>{if(live)setMessage(error.message||'Mağazaya bağlanılamadı. Tekrar deneyebilirsin.');});return()=>{live=false;};},[open]);
 const plan=premiumPlans[selected],product=products.find(p=>(p.planIdentifier||p.identifier)===plan.id);
 const action=async restore=>{if(busy)return;setBusy(true);setMessage('');try{const active=restore?await restorePremium():await purchasePremium(plan,product);if(active){onShowToast?.('Premium erişimin açıldı.','check');close();}else setMessage(restore?'Bu mağaza hesabında etkin Premium aboneliği bulunamadı.':'Satın alma henüz doğrulanmadı. Bekleyen işlemi mağazadan kontrol et.');}catch(error){setMessage(/cancel|dismiss/i.test(error.message)?'Satın alma iptal edildi.':error.message||'İşlem tamamlanamadı. Tekrar dene.');}finally{setBusy(false);}};
 return(0,e.jsxs)('dialog',{ref,onCancel:close,onClose:()=>{if(open)close();},'aria-labelledby':'veira-premium-title',style:{width:'min(480px,calc(100vw - 28px))',maxHeight:'88dvh',overflowY:'auto',border:'1px solid #d9ba67',borderRadius:24,padding:24,background:'#15182c',color:'#f7f1df',boxShadow:'0 24px 80px #0009'},children:[
 (0,e.jsx)('button',{type:'button',onClick:close,'aria-label':'Kapat',style:{float:'right',width:44,height:44,borderRadius:'50%',background:'#272b44',color:'white'},children:'×'}),
 (0,e.jsx)('img',{src:'/apple-touch-icon.png',alt:'',width:52,height:52,style:{borderRadius:12,marginBottom:16}}),
 (0,e.jsx)('p',{style:{color:'#e8ca79',fontSize:12,letterSpacing:2},children:'VEIRA PREMIUM'}),
 (0,e.jsx)('h2',{id:'veira-premium-title',style:{fontFamily:'Georgia,serif',fontSize:30,lineHeight:1.15,margin:'12px 0'},children:'Panona daha fazla alan aç.'}),
 (0,e.jsx)('p',{style:{color:'#c4c5d8',lineHeight:1.6},children:'Tüm pano şablonları, doğum haritası, elementler, gezegenler ve transitler.'}),
 (0,e.jsx)('p',{style:{color:'#c4c5d8',fontSize:13,margin:'12px 0 20px'},children:'3 pano şablonu ve günlük burç yorumu her zaman ücretsiz.'}),
 (0,e.jsx)('div',{role:'group','aria-label':'Abonelik planı',children:premiumPlans.map((p,index)=>{const store=products.find(item=>(item.planIdentifier||item.identifier)===p.id);return(0,e.jsxs)('button',{type:'button',onClick:()=>setSelected(index),'aria-pressed':selected===index,style:{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',minHeight:68,padding:16,marginBottom:10,borderRadius:14,border:selected===index?'2px solid #e8ca79':'2px solid #353951',background:selected===index?'#333047':'#1e2239',color:'inherit'},children:[(0,e.jsx)('strong',{children:p.label}),(0,e.jsx)('span',{children:(store?.priceString||p.price)+' / '+p.period})]},p.id);})}),
 (0,e.jsx)('p',{role:'status','aria-live':'polite',style:{fontSize:13,color:'#e8ca79',minHeight:38,margin:'12px 0'},children:message}),
 (0,e.jsx)('button',{type:'button',disabled:busy||!product,onClick:()=>action(false),style:{width:'100%',minHeight:50,borderRadius:14,background:'#e8ca79',color:'#241d10',fontWeight:700,opacity:busy||!product?0.55:1},children:busy?'İşlem sürüyor…':'Premium’a geç'}),
 (0,e.jsx)('p',{style:{fontSize:11,lineHeight:1.6,color:'#b1b4ca',margin:'14px 0'},children:'Abonelik otomatik yenilenir. Ödeme mağaza hesabından alınır. Bir sonraki yenilemeyi mağaza hesap ayarlarından iptal edebilirsin. Kesin fiyat ve dönem satın alma ekranında gösterilir.'}),
 (0,e.jsx)('button',{type:'button',disabled:busy,onClick:()=>action(true),style:{minHeight:44,color:'#e8ca79',textDecoration:'underline'},children:'Satın alımları geri yükle'}),
 (0,e.jsxs)('p',{style:{fontSize:12,color:'#b1b4ca',display:'flex',gap:16,flexWrap:'wrap'},children:[(0,e.jsx)('a',{href:'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',target:'_blank',rel:'noopener',children:'Kullanım koşulları'}),(0,e.jsx)('a',{href:'https://veira.life/privacy',target:'_blank',rel:'noopener',children:'Gizlilik politikası'})]})]});
}
export{VeiraPremiumModal};
