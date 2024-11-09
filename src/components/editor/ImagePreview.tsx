import Image from "next/image";
import CloseIcon from "../icons/Close";

type ImagePreviewProps = {
  images: Array<{ file: File; preview: string }>;
  onRemoveImage: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemoveImage }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {images.map((image, index) => (
        <div key={image.preview} className="relative w-fit">
          <Image
            src={image.preview}
            alt={`Upload preview ${index + 1}`}
            className="rounded-lg"
            width={300}
            height={300}
            style={{ maxHeight: '300px', height: "100%", width: 'auto', objectFit: "cover" }}
          />
          <button
            onClick={() => onRemoveImage(index)}
            className="absolute top-1 right-1 bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
            title="Remove image"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
