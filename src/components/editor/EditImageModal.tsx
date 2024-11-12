import { resizeImage } from "@/lib/mediaUtils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CloseIcon from "../icons/Close";

const DEFAULT_CROP: Crop = {
  unit: '%',
  width: 50,
  height: 50,
  x: 25,
  y: 25
};

type EditImageModalProps = {
  isOpen: boolean;
  image: { file: File; preview: string } | null;
  onClose: () => void;
  onSave: (editedImage: { file: File; preview: string; type: 'image' }) => void;
};

const EditImageModal: React.FC<EditImageModalProps> = ({
  isOpen,
  image,
  onClose,
  onSave,
}) => {
  const [editedImage, setEditedImage] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setEditedImage(image);
  }, [image]);

  const resetCropState = () => {
    setCrop(DEFAULT_CROP);
    setCompletedCrop(undefined);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      resetCropState();
      onClose();
    }
  };

  const handleSave = async () => {
    if (!completedCrop || !canvasRef.current || !imgRef.current || !editedImage) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;
    const crop = completedCrop;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const mimeType = editedImage.file.type || 'image/jpeg';
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      let file = new File([blob], editedImage.file.name, {
        type: mimeType,
        lastModified: Date.now(),
      });

      // Resize if file is too large
      file = await resizeImage(file);

      onSave({
        file,
        preview: URL.createObjectURL(file),
        type: 'image',
      });
      setCrop(DEFAULT_CROP);
      setCompletedCrop(undefined);
    }, 'image/jpeg');
  };

  if (!isOpen || !editedImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 relative">
        <button
          onClick={() => {
            resetCropState();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <CloseIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Image</h2>
        <div className="flex justify-center items-center relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined}
            minWidth={100}
            minHeight={100}
            style={{ maxHeight: '350px' }}
          >
            <Image
              ref={imgRef}
              src={editedImage.preview}
              alt="Edit preview"
              className="max-h-[60vh] w-auto mx-auto"
              width={200}
              height={200}
            />
          </ReactCrop>
        </div>
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              resetCropState();
              onClose();
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImageModal;