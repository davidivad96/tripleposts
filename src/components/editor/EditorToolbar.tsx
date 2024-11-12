import { Editor } from "@tiptap/react";
import ImageIcon from "../icons/Image";
import VideoIcon from "../icons/Video";

type EditorToolbarProps = {
  editor: Editor | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaCount: number;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageUpload,
  onVideoUpload,
  mediaCount,
}) => (
  <div className="flex items-center gap-1">
    <input
      type="file"
      accept="image/png, image/jpeg, image/webp, image/avif, image/gif"
      onChange={onImageUpload}
      className="hidden"
      id="image-upload"
      disabled={mediaCount >= 4}
      multiple
    />
    <input
      type="file"
      accept="video/mp4, video/quicktime"
      onChange={onVideoUpload}
      className="hidden"
      id="video-upload"
      disabled={mediaCount >= 4}
    />
    <label
      htmlFor="image-upload"
      className={`${mediaCount >= 4
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-gray-800'
        } bg-transparent text-blue-500 dark:text-white p-[8px] rounded-full transition-colors`}
    >
      <ImageIcon />
    </label>
    <label
      htmlFor="video-upload"
      className={`${mediaCount >= 4
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-gray-800'
        } bg-transparent text-blue-500 dark:text-white p-[8px] rounded-full transition-colors`}
    >
      <VideoIcon />
    </label>
    <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
    <button
      onClick={() => {
        if (editor) {
          editor.chain().focus().toggleBold().run();
        }
      }}
      className={`${editor?.isActive('bold') ? 'bg-blue-500 dark:bg-white text-white dark:text-gray-800' : 'bg-transparent text-blue-500 dark:text-white'
        } font-bold py-[6px] px-[12px] rounded-full transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-gray-800 group relative`}
      title="Bold (⌘B)"
    >
      B
      <span className="hidden sm:block absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">⌘B</span>
    </button>
    <button
      onClick={() => {
        if (editor) {
          editor.chain().focus().toggleItalic().run();
        }
      }}
      className={`${editor?.isActive('italic') ? 'bg-blue-500 dark:bg-white text-white dark:text-gray-800' : 'bg-transparent text-blue-500 dark:text-white'
        } italic py-[6px] px-[16px] rounded-full transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-gray-800 group relative`}
      title="Italic (⌘I)"
    >
      I
      <span className="hidden sm:block absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">⌘I</span>
    </button>
  </div>
);

export default EditorToolbar; 