import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onComplete: (url: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // We want a square crop for a circular logo. Max size to keep under 100kb
  const MAX_SIZE = 300;
  canvas.width = MAX_SIZE;
  canvas.height = MAX_SIZE;

  // Draw the cropped image onto the canvas, resizing it to MAX_SIZE
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    MAX_SIZE,
    MAX_SIZE
  );

  // Apply circular clipping so transparent background outside the circle? 
  // Wait, if it's a JPEG, it won't be transparent. Let's use PNG or WEBP.
  // Actually, standard CSS rounded-full handles it, but maybe the user wants it to look circular in the cropper.
  // We just return a standard square image, the CSS will border-radius it.

  return new Promise((resolve, reject) => {
    // Quality 0.8 usually keeps a 300x300 image well under 100kb
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/webp', 0.8);
  });
}

export function ImageCropperModal({ imageSrc, onClose, onComplete }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setUploading(true);
      const croppedImageBytes = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      
      const { data, error } = await supabase.storage
        .from('sf_logos')
        .upload(fileName, croppedImageBytes, {
          contentType: 'image/webp'
        });

      if (error) {
        console.error('Error uploading:', error);
        alert('Upload failed: ' + error.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('sf_logos').getPublicUrl(fileName);
      
      onComplete(publicUrl);
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white dark:bg-game-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-slate-100 dark:border-game-800 flex justify-between items-center">
          <h3 className="font-display font-bold uppercase tracking-wider text-slate-800 dark:text-white">Cắt Ảnh Logo</h3>
          <button onClick={onClose} disabled={uploading} className="p-2 hover:bg-slate-100 dark:hover:bg-game-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full h-[300px] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Thu Phóng</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-pitch-500 text-white py-3 rounded-xl font-display font-bold uppercase tracking-widest hover:bg-pitch-600 disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <span className="animate-pulse">Đang tải lên...</span>
            ) : (
              <>
                <Check size={20} /> Xong
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
