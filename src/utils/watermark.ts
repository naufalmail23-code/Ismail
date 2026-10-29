export interface WatermarkData {
  nip: string;
  name: string;
  zone: string;
  itemTitle: string;
  timestamp: Date;
  extraInfo?: string;
}

export function drawWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: WatermarkData
): void {
  // Format Indonesian date and time
  const timeStr = data.timestamp.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' WIB';
  
  const dateStr = data.timestamp.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Stamp bar height scaled to image resolution
  const bannerHeight = Math.max(90, Math.floor(height * 0.18));
  const bannerY = height - bannerHeight;

  // Semi-transparent dark background bar with subtle gradient
  const grad = ctx.createLinearGradient(0, bannerY, 0, height);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, bannerY, width, bannerHeight);

  // Top accent line in Informa orange
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, bannerY, width, Math.max(3, Math.floor(height * 0.006)));

  // Text scaling based on width
  const baseFontSize = Math.max(12, Math.floor(width * 0.024));
  const paddingX = Math.max(16, Math.floor(width * 0.035));

  // 1. Header: Brand + Store
  ctx.font = `bold ${Math.floor(baseFontSize * 1.15)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = '#f97316'; // Informa orange
  ctx.fillText(
    `[READY TO SELL · INFORMA ALAM SUTERA]`,
    paddingX,
    bannerY + Math.floor(bannerHeight * 0.28)
  );

  // 2. Staff info
  ctx.font = `600 ${baseFontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    `NIP: ${data.nip} — ${data.name} · ${data.zone}`,
    paddingX,
    bannerY + Math.floor(bannerHeight * 0.52)
  );

  // 3. Item & Timestamp
  ctx.font = `500 ${Math.floor(baseFontSize * 0.9)}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = '#94a3b8';
  let detailLine = `CHECKLIST: ${data.itemTitle.toUpperCase()} · ${dateStr}, ${timeStr}`;
  if (data.extraInfo) {
    detailLine += ` | ${data.extraInfo}`;
  }
  ctx.fillText(
    detailLine,
    paddingX,
    bannerY + Math.floor(bannerHeight * 0.74)
  );

  // 4. Live Verification Tag on the right
  ctx.font = `bold ${Math.floor(baseFontSize * 0.8)}px 'Plus Jakarta Sans', sans-serif`;
  ctx.fillStyle = '#22c55e'; // green verified
  const tagText = 'VERIFIED CAMERA CAPTURE';
  const tagWidth = ctx.measureText(tagText).width;
  ctx.fillText(
    tagText,
    width - paddingX - tagWidth,
    bannerY + Math.floor(bannerHeight * 0.28)
  );
}

export async function processImageWithWatermark(
  imageSource: HTMLVideoElement | HTMLImageElement,
  data: WatermarkData
): Promise<string> {
  const canvas = document.createElement('canvas');
  let width = 0;
  let height = 0;

  if (imageSource instanceof HTMLVideoElement) {
    width = imageSource.videoWidth || 1280;
    height = imageSource.videoHeight || 720;
  } else {
    width = imageSource.naturalWidth || 1280;
    height = imageSource.naturalHeight || 720;
  }

  // Constrain max dimension to keep storage responsive in IndexedDB/localStorage/memory
  const maxDim = 800;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  // Draw image
  ctx.drawImage(imageSource, 0, 0, width, height);

  // Draw watermark
  drawWatermarkOnCanvas(ctx, width, height, data);

  // Return compact high-clarity base64 JPEG
  return canvas.toDataURL('image/jpeg', 0.65);
}
