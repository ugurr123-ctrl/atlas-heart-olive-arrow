import hdPhotos from "./board-collage-hd.js";

export const collageThemes = [
  ["Kendi Ritmimde","Amalfi Polaroids","#492239","#f6dfbd","Küçük adımlar","Yaratmaya devam"],
  ["Akdeniz Defteri","Riviera Yacht Club & Capri","#506959","#ffebcc","Yeni kıyılar","Denize yakın"],
  ["Yavaş Sabahlar","Vienna Coffee & Piano","#76594c","#fff1df","Kendime zaman","Bir fincan huzur"],
  ["Yeşile Dönüş","Singapore Sky Garden","#304942","#dce9cb","Doğaya yakın","Kök sal"],
  ["Şehir Günlüğü","Brooklyn Film Diary","#4a3a43","#f7d7c0","Sokak sokak","Yeni hikâyeler"],
  ["Yaratıcı Atölye","Parisian Chic & Atelier","#784a53","#ffe4d7","Üretmeye devam","Merakını izle"],
  ["Yol Çağırıyor","Iceland Quiet Frames","#34495a","#e8edf1","Yeni yerler","Yola çık"],
  ["Sıcak Bir Yuva","Milan Apartment Bento","#654b44","#f7e4c8","Birlikte güzel","Evde huzur"],
  ["Bedenime İyi Bak","Bali Still Water","#51644b","#f1eaca","İyi hisset","Nefes al"],
  ["Yıldızların Altında","Atlas Star Camp","#292740","#e6d9fb","Göğe bak","Büyük hayaller"]
];

export function collageTemplates(templates) {
  return collageThemes.map(([name,source,paper,ink,tape,quote],index)=>{
    const original=templates.find(template=>template.name===source);
    const companion=templates.find(template=>template.name===collageThemes[(index+1)%collageThemes.length][1]);
    const thumbnails=[...new Set([...original.imgs,...companion.imgs])].filter(photo=>hdPhotos[photo]).slice(0,12);
    return {
      ...original,id:"collage-"+index,num:"#"+(index+1),name,headline:name,tape,quote,
      desc:"Fotoğraflı kolaj",badge:"Kolaj",layout:"collage",paper,ink,variant:index,
      thumbnails,imgs:thumbnails.map(photo=>hdPhotos[photo])
    };
  });
}

const portraitBands = [
  [[42,58],[27,44,29],[58,42],[29,31,40],[37,63]],
  [[31,37,32],[63,37],[30,45,25],[45,55],[26,33,41]],
  [[64,36],[34,29,37],[43,57],[33,37,30],[53,47]]
];
const wideBands = [
  [[28,17,32,23],[19,25,21,35],[23,31,19,27]],
  [[34,18,22,26],[22,30,31,17],[28,19,20,33]],
  [[21,34,17,28],[32,23,27,18],[23,21,31,25]]
];

export function collageTiles(count, ratio, variant) {
  if (!count) return [];
  const style = variant%3;
  const portrait = ratio < .8;
  const bands = (portrait ? portraitBands : wideBands)[style];
  const bandCount = Math.min(count, bands.length);
  const heights = portrait ? [23,15,25,15,22] : [31,39,30];
  const totalHeight = heights.slice(0,bandCount).reduce((total,height)=>total+height,0);
  let top=0;
  let index=0;
  return bands.slice(0,bandCount).flatMap((band,row)=>{
    const height=100*heights[row]/totalHeight;
    const columns=Math.floor(count/bandCount)+Number(row<count%bandCount);
    const weights=Array.from({length:columns},(_,column)=>band[(variant+column)%band.length]);
    const totalWidth=weights.reduce((total,width)=>total+width,0);
    let left=0;
    const tiles=weights.map(weight=>{
      const width=100*weight/totalWidth;
      const inset=[.6,-.5,2.3][style];
      const angle=style===1?0:((index++*3+variant)%5-2)*(style===0?1.2:2.1);
      const tile={x:left+width/2,y:top+height/2,w:width-inset,h:height-inset,angle};
      left+=width;
      return tile;
    });
    top+=height;
    return tiles;
  });
}

export const collageCaptions = [
  [{x:32,y:21,angle:-10},{x:48,y:49,angle:-7},{x:69,y:78,angle:5}],
  [{x:27,y:25,angle:0},{x:50,y:52,angle:0},{x:71,y:82,angle:0}],
  [{x:65,y:20,angle:-12},{x:52,y:53,angle:5},{x:36,y:82,angle:-5}]
];
export function collagePhoto(source) {
  const [url, region] = source.split("#crop=");
  return {url, crop:region?.split(",").map(Number)};
}

export const collageNotes = [
  ["Her gün biraz","Kendime alan açıyorum"],["Tuzlu hava","Yavaşla ve etrafına bak"],
  ["Kahve molası","Bugün kendime iyi davranacağım"],["Yeşile yakın","Biraz daha açık hava"],
  ["Merakla keşfet","Yürüyerek keşfetmenin tadı"],["Denemeye devam","Kusursuz olmayı bekleme"],
  ["Bir bilet al","Yolda güzel şeyler var"],["Birlikte sofrada","En güzel anlar evde"],
  ["İyi bir uyku","Kendine şefkat göster"],["Gece göğü","Hayallerime zaman ayırıyorum"]
];
