"use client";

import { resizeImage } from "@/lib/mediaUtils";
import { Media, PlatformStatus } from "@/types";
import { useClerk, useSignIn } from "@clerk/nextjs";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import Alert from "./Alert";
import CharacterCounter from "./CharacterCounter";
import EditImageModal from "./editor/EditImageModal";
import EditorToolbar from "./editor/EditorToolbar";
import MediaPreview from "./editor/MediaPreview";
import WarningBanner from "./editor/WarningBanner";
import ArrowDownIcon from "./icons/ArrowDown";
import LoadingModal from "./LoadingModal";


type ContentProps = {
  hasBlueskyAccount: boolean;
};

const Content: React.FC<ContentProps> = ({ hasBlueskyAccount }) => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const [showWarning, setShowWarning] = useState(true);
  const [media, setMedia] = useState<Media[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak.extend({
        addKeyboardShortcuts: () => ({
          "Mod-Enter": () => {
            const postButton = document.querySelector("button[data-post-button]");
            if (postButton instanceof HTMLButtonElement && !postButton.disabled) {
              postButton.click();
            }
            return true;
          },
        }),
      }),
      Placeholder.configure({
        placeholder: "What's happening?!",
        emptyNodeClass:
          "first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0 first:before:opacity-50",
      }),
      History.configure({ depth: 10 }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert outline-none focus:ring-0 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 min-h-[90px] max-h-[200px] overflow-y-scroll focus-within:border focus-within:border-blue-500 dark:focus-within:border-blue-500",
      },
    },
  });

  useEffect(() => {
    if (!showAlert) {
      setAlertMessage('');
    }
  }, [showAlert]);

  if (!signIn) return null;

  const sessions = client.activeSessions || [];

  // Get X session
  const xSession = sessions.find(
    (session) => session.user?.externalAccounts[0].provider === "x"
  );

  // Get Threads session
  const threadsSession = sessions.find(
    (session) => session.user?.externalAccounts[0].provider === "custom_threads"
  );

  const hasXAccount = !!xSession;
  const hasThreadsAccount = !!threadsSession;
  const isPostingDisabled = sessions.length === 0 && !hasBlueskyAccount;
  const text = editor?.getText();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + media.length > 4) {
      setAlertMessage('Maximum 4 media items allowed');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
    const newFiles = files.slice(0, 4 - media.length);

    // Resize images and create previews
    const processedMedia = await Promise.all(
      newFiles.map(async (file) => {
        const resizedFile = await resizeImage(file);
        return {
          file: resizedFile,
          preview: URL.createObjectURL(resizedFile),
          type: "image",
        };
      })
    );

    setMedia(prev => [...prev, ...processedMedia as Media[]]);
  };

  const handlePost = async () => {
    const content = editor?.getText() || "";
    const mediaFiles = media.map((m) => m.file);

    setPlatformStatuses([
      ...(hasXAccount ? [{ platform: "X", status: "loading" }] : []),
      ...(hasThreadsAccount ? [{ platform: "Threads", status: "loading" }] : []),
      ...(hasBlueskyAccount ? [{ platform: "Bluesky", status: "loading" }] : []),
    ] as PlatformStatus[]);

    const promises: Promise<string | undefined>[] = [];

    if (hasXAccount) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("userId", xSession.user.id);
      mediaFiles.forEach((file) => {
        formData.append("mediaFiles", file);
      });

      promises.push(
        fetch("/api/postTo/x", {
          method: "POST",
          body: formData,
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "X" ? { ...ps, status: "success", url: data.url } : ps
              )
            );
            return data.url;
          })
          .catch((error) => {
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "X"
                  ? { ...ps, status: "error", error: error.message }
                  : ps
              )
            );
            return undefined;
          })
      );
    }

    if (hasThreadsAccount) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("userId", threadsSession.user.id);
      mediaFiles.forEach((file) => {
        formData.append("mediaFiles", file);
      });

      promises.push(
        fetch("/api/postTo/threads", {
          method: "POST",
          body: formData,
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "Threads"
                  ? { ...ps, status: "success", url: data.url }
                  : ps
              )
            );
            return data.url;
          })
          .catch((error) => {
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "Threads"
                  ? { ...ps, status: "error", error: error.message }
                  : ps
              )
            );
            return undefined;
          })
      );
    }

    if (hasBlueskyAccount) {
      const formData = new FormData();
      formData.append("content", content);
      mediaFiles.forEach((file) => {
        formData.append("mediaFiles", file);
      });

      promises.push(
        fetch("/api/postTo/bluesky", {
          method: "POST",
          body: formData,
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "Bluesky"
                  ? { ...ps, status: "success", url: data.url }
                  : ps
              )
            );
            return data.url;
          })
          .catch((error) => {
            setPlatformStatuses((prev) =>
              prev.map((ps) =>
                ps.platform === "Bluesky"
                  ? { ...ps, status: "error", error: error.message }
                  : ps
              )
            );
            return undefined;
          })
      );
    }

    try {
      const results = await Promise.all(promises);
      if (editor && results.every((r) => r !== undefined)) {
        editor.commands.setContent("");
        setMedia([]);
      }
    } catch (error) {
      console.error("Error posting:", error);
      setPlatformStatuses((prev) =>
        prev.map((ps) => ({
          ...ps,
          status: "error",
          error: "An unexpected error occurred",
        }))
      );
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditMedia = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const handleSaveEditedImage = (editedImage: Media) => {
    if (selectedMediaIndex === null) return;
    setMedia(prev => prev.map((media, i) =>
      i === selectedMediaIndex ? editedImage : media
    ));
    setSelectedMediaIndex(null);
  };

  return (
    <>
      {showAlert && <Alert message={alertMessage} />}
      <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        {isPostingDisabled && (
          <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
            <div className="text-center p-4">
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                Connect an account to start posting
              </p>
              <ArrowDownIcon />
            </div>
          </div>
        )}
        <h2 className="text-md font-bold text-gray-500 dark:text-gray-400 mb-3">
          Create Post
        </h2>
        <EditorContent editor={editor} disabled={isPostingDisabled} />
        <MediaPreview
          media={media}
          onRemoveMedia={handleRemoveMedia}
          onEditMedia={handleEditMedia}
        />
        <div className="mt-4 mb-2 space-y-3">
          <WarningBanner
            show={!!text?.length && text.length > 280 && showWarning}
            onClose={() => setShowWarning(false)}
          />
          <div className="flex items-center justify-between">
            <EditorToolbar
              editor={editor}
              onImageUpload={handleImageUpload}
              mediaCount={media.length}
            />
            <div className="flex items-center gap-4">
              {!editor?.isEmpty && (
                <CharacterCounter count={text?.trim().length || 0} limit={280} />
              )}
              <button
                disabled={isPostingDisabled || editor?.isEmpty || platformStatuses.some(ps => ps.status === "loading")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center group relative"
                onClick={handlePost}
                data-post-button
                title="Post (⌘↵)"
              >
                Post
                <span className="hidden sm:block absolute bottom-[-20px] right-1/2 transform translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">⌘↵</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <LoadingModal
        isOpen={platformStatuses.length > 0}
        platformStatuses={platformStatuses}
        onClose={() => setPlatformStatuses([])}
      />
      <EditImageModal
        isOpen={selectedMediaIndex !== null}
        image={selectedMediaIndex !== null ? media[selectedMediaIndex] : null}
        onClose={() => setSelectedMediaIndex(null)}
        onSave={handleSaveEditedImage}
      />
    </>
  );
};

export default Content;
