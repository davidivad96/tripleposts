import Image from "next/image";
import CloseIcon from "../icons/Close";
import EditIcon from "../icons/Edit";

type ImagePreviewProps = {
  images: Array<{ file: File; preview: string }>;
  onRemoveImage: (index: number) => void;
  onEditImage: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemoveImage, onEditImage }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {images.map((image, index) => (
        <div key={image.preview} className="relative w-fit">
          <Image
            src={image.preview}
            alt={`Upload preview ${index + 1}`}
            className="rounded-lg cursor-pointer"
            width={300}
            height={300}
            style={{ maxHeight: '300px', height: "100%", objectFit: "cover" }}
            onClick={() => onEditImage(index)}
          />
          <div className="absolute top-1 right-1 flex gap-1">
            <button
              onClick={() => onEditImage(index)}
              className="bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
              title="Edit image"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onRemoveImage(index)}
              className="bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
              title="Remove image"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
