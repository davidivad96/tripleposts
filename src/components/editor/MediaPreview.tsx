import Image from "next/image";
import CloseIcon from "../icons/Close";
import EditIcon from "../icons/Edit";

type MediaPreviewProps = {
  media: Array<{ file: File; preview: string; type: 'image' | 'video' }>;
  onRemoveMedia: (index: number) => void;
  onEditMedia: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onRemoveMedia, onEditMedia }) => {
  if (media.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {media.map((item, index) => (
        <div key={item.preview} className="relative w-fit">
          {item.type === 'image' ? (
            <Image
              src={item.preview}
              alt={`Upload preview ${index + 1}`}
              className="rounded-lg cursor-pointer"
              width={300}
              height={300}
              style={{ maxHeight: '300px', height: "100%", objectFit: "cover" }}
              onClick={() => onEditMedia(index)}
            />
          ) : (
            <video
              src={item.preview}
              className="rounded-lg max-h-[300px] w-auto h-full"
              controls
            />
          )}
          <div className="absolute top-1 right-1 flex gap-1">
            {item.type === 'image' && (
              <button
                onClick={() => onEditMedia(index)}
                className="bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
                title="Edit image"
              >
                <EditIcon />
              </button>
            )}
            <button
              onClick={() => onRemoveMedia(index)}
              className="bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
              title="Remove media"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaPreview; 