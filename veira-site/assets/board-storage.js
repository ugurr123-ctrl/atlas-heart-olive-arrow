const boardPrefix = "veira_board_v1_";

export function listBoards(storage) {
  const boards = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(boardPrefix)) continue;
    try {
      const board = JSON.parse(storage.getItem(key));
      if (board?.id === key.slice(boardPrefix.length) && (Number.isInteger(board.templateId) || typeof board.templateId === "string") && Array.isArray(board.slots)) {
        boards.push(board);
      }
    } catch {
      // A malformed entry should not hide the remaining boards.
    }
  }
  return boards.sort((left, right) => right.updatedAt - left.updatedAt);
}

export function saveBoard(storage, board) {
  const saved = { ...board, updatedAt: Date.now() };
  storage.setItem(boardPrefix + saved.id, JSON.stringify(saved));
  return saved;
}

function loadImage(source, anonymous = false) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (anonymous) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Görsel yüklenemedi."));
    image.src = source;
  });
}

export async function readBoardPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const scale = Math.min(1, 960 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#10142b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function drawBoardPhotos(context, slots) {
  const sources = slots.filter(Boolean);
  if (!sources.length) return;
  const photos = await Promise.all(sources.map(source => loadImage(source, /^https?:/i.test(source))));
  const columns = photos.length === 1 ? 1 : photos.length <= 4 ? 2 : 3;
  const rows = Math.ceil(photos.length / columns);
  const gap = 16;
  const width = (936 - gap * (columns - 1)) / columns;
  const height = (860 - gap * (rows - 1)) / rows;
  photos.forEach((image, index) => {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    context.drawImage(image, (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2,
      cropWidth, cropHeight, 72 + (index % columns) * (width + gap),
      430 + Math.floor(index / columns) * (height + gap), width, height);
  });
}

export async function drawBoardLayers(context, layers, width, height) {
  for (const layer of layers) {
    const left = width * layer.x / 100;
    const top = height * layer.y / 100;
    const layerWidth = width * 0.24;
    context.save();
    context.translate(left, top);
    try {
      if (layer.kind === "photo") {
        const image = await loadImage(layer.src);
        const layerHeight = layerWidth * 0.75;
        const fit = Math.max(layerWidth / image.width, layerHeight / image.height);
        const cropWidth = layerWidth / fit;
        const cropHeight = layerHeight / fit;
        context.drawImage(image, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2,
          cropWidth, cropHeight, -layerWidth / 2, -layerHeight / 2, layerWidth, layerHeight);
      } else {
        const fontSize = Math.round(width * 0.03);
        if (layer.kind === "washi") {
          context.rotate(-7 * Math.PI / 180);
          context.fillStyle = layer.color;
          context.fillRect(-layerWidth / 2, -fontSize, layerWidth, fontSize * 2);
        }
        if (layer.kind === "label") {
          context.fillStyle = layer.color;
          context.beginPath();
          context.roundRect(-layerWidth / 2, -fontSize, layerWidth, fontSize * 2, fontSize);
          context.fill();
        }
        context.fillStyle = layer.kind === "washi" || layer.kind === "label" ? "#241a00" : "#ffffff";
        context.font = layer.kind === "quote" ? `italic 700 ${fontSize}px Georgia` : `700 ${fontSize}px sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(layer.text, 0, 0, layerWidth * 0.94);
      }
    } finally {
      context.restore();
    }
  }
}
import { collageTiles, collageCaptions, collagePhoto, collageNotes } from "./board-collage.js";

export async function drawCollage(context, template, slots, text, width, height) {
  const sources = slots.slice(0, template.imgs.length);
  const images = await Promise.all(sources.map(async source=>{const {url,crop}=collagePhoto(source);return {image:await loadImage(url),crop}}));
  const tiles = collageTiles(images.length, width / height, template.variant);
  const style = template.variant % 3;
  context.fillStyle = style === 2 ? "#e9dcc5" : template.paper;
  context.fillRect(0, 0, width, height);
  for (const [index, tile] of tiles.entries()) {
    const {image,crop}=images[index];
    const [left,top,sourceWidth,sourceHeight]=crop??[0,0,image.width,image.height];
    const w = tile.w * width / 100;
    const h = tile.h * height / 100;
    const edge = style === 1 ? 0 : Math.max(2, width * .005);
    const bottom = style === 2 ? edge * 3.5 : edge;
    const photoWidth = w - 2 * edge;
    const photoHeight = h - edge - bottom;
    const scale = Math.max(photoWidth / sourceWidth, photoHeight / sourceHeight);
    context.save();
    context.translate(tile.x * width / 100, tile.y * height / 100);
    context.rotate(tile.angle * Math.PI / 180);
    context.fillStyle = "#fff8ed";
    if (edge) context.fillRect(-w / 2, -h / 2, w, h);
    const cropWidth = photoWidth / scale;
    const cropHeight = photoHeight / scale;
    context.drawImage(image, left + (sourceWidth - cropWidth) / 2, top + (sourceHeight - cropHeight) / 2, cropWidth, cropHeight,
      -w / 2 + edge, -h / 2 + edge, photoWidth, photoHeight);
    context.restore();
  }
  const captions = [[text.tape,.035,"sans-serif"],[text.headline,.079,"Georgia"],[text.quote,.039,"Georgia"]];
  for (const [index, caption] of captions.entries()) {
    const [value, proportion, font] = caption;
    const {x,y,angle} = collageCaptions[style][index];
    if (!value) continue;
    const size = Math.min(width * proportion, height * .14);
    const maxWidth = width * (index === 1 ? .7 : .49);
    context.save();
    context.translate(x * width / 100, y * height / 100);
    context.rotate(angle * Math.PI / 180);
    context.font = "700 " + size + "px " + (text.serif===false?"sans-serif":font);
    const labelWidth = Math.min(maxWidth, context.measureText(value).width) + size;
    context.fillStyle = index === 0 ? template.ink : "#fff5e4";
    context.fillRect(-labelWidth / 2, -size * .77, labelWidth, size * 1.54);
    context.fillStyle = "#2b1e26";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(value, 0, 0, maxWidth);
    context.restore();
  }
  const [stamp,note]=collageNotes[template.variant];
  for (const [value,x,y,angle,color] of [
    [stamp,.79,style===1?.14:.35,style===1?0:9,style===1?"#242121":"#eac5b8"],
    [note,.23,.87,style===1?0:-9,"#fbf0d9"]
  ]) {
    const size=Math.min(width*.038,height*.075);
    context.save();
    context.translate(x*width,y*height);
    context.rotate(angle*Math.PI/180);
    context.font="italic 600 "+size+"px Georgia";
    const maxWidth=width*.35;
    const labelWidth=Math.min(maxWidth,context.measureText(value).width)+size*.8;
    context.fillStyle=color;
    context.fillRect(-labelWidth/2,-size*.75,labelWidth,size*1.5);
    context.fillStyle=color==="#242121"?"#fff9ed":"#2f231d";
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillText(value,0,0,maxWidth);
    context.restore();
  }
  for (const [x,y,angle] of [[.545,.054,12],[.835,.956,-13]]) {
    context.save();
    context.translate(x*width,y*height);
    context.rotate(angle*Math.PI/180);
    context.globalAlpha=.76;
    context.fillStyle=template.ink;
    context.fillRect(-width*.085,-height*.014,width*.17,height*.028);
    context.restore();
  }
}
