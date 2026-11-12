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
