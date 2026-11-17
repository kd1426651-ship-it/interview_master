const PHOTO_W = 480;
const PHOTO_H = 640;

// Reads a picked image and returns a cropped 3:4 JPEG data URL, small enough to keep in saved drafts.
export function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('invalid image'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = PHOTO_W;
        canvas.height = PHOTO_H;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);
        const scale = Math.max(PHOTO_W / img.width, PHOTO_H / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (PHOTO_W - w) / 2, (PHOTO_H - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}