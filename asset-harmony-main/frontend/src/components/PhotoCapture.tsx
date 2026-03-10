import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";

interface PhotoCaptureProps {
  photos: string[];
  onAddPhoto: (dataUrl: string) => void;
  onRemovePhoto: (index: number) => void;
}

const PhotoCapture = ({ photos, onAddPhoto, onRemovePhoto }: PhotoCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) onAddPhoto(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Photo Evidence</label>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" /> Take Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border">
              <img src={src} alt={`Audit photo ${i + 1}`} className="w-full h-20 object-cover" />
              <button
                type="button"
                onClick={() => onRemovePhoto(i)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-6 text-muted-foreground">
          <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-xs">No photos yet</p>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;
