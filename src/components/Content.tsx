"use client";

import { postToThreads, postToX } from "@/app/actions";
import { PostError } from "@/lib/errors";
import { jsonToText } from "@/lib/utils";
import { PostResult, PostStatus } from "@/types";
import { useClerk, useSignIn } from "@clerk/nextjs";
import Bold from "@tiptap/extension-bold";
import Document from '@tiptap/extension-document';
import HardBreak from "@tiptap/extension-hard-break";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Alert from "./Alert";
import CharacterCounter from "./CharacterCounter";
import ArrowDownIcon from "./icons/ArrowDown";
import CloseIcon from "./icons/Close";
import ImageIcon from "./icons/Image";
import LoadingModal from "./LoadingModal";

const CustomHardBreak = HardBreak.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        const postButton = document.querySelector('button[data-post-button]');
        if (postButton instanceof HTMLButtonElement && !postButton.disabled) {
          postButton.click();
        }
        return true;
      }
    }
  },
});

const Content: React.FC = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const [showWarning, setShowWarning] = useState(true);
  const [status, setStatus] = useState<PostStatus>("idle");
  const [error, setError] = useState<{ platform: string; message: string } | null>(null);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [showAlert, setShowAlert] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      CustomHardBreak,
      Placeholder.configure({
        placeholder: "What's happening?!",
        emptyNodeClass:
          'first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0 first:before:opacity-50',
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert outline-none focus:ring-0 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 min-h-[90px] max-h-[200px] overflow-y-scroll focus-within:border focus-within:border-blue-500 dark:focus-within:border-blue-500",
      }
    }
  })

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      images.forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

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
  const isPostingDisabled = sessions.length === 0;
  const text = editor?.getText();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
    const newFiles = files.slice(0, 4 - images.length);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newFiles.map((file, index) => ({ file, preview: newPreviews[index] }))]);
  };

  const handlePost = async () => {
    if (editor?.isEmpty) return;
    setStatus("posting");
    setError(null);
    setPostResults([]);

    try {
      const xUserId = xSession?.user?.id;
      const threadsUserId = threadsSession?.user?.id;
      const results = await Promise.allSettled([
        ...(hasXAccount && xUserId
          ? [
            postToX(xUserId, jsonToText(editor!.getJSON())).then((url) => ({
              platform: "X",
              url,
            })),
          ]
          : []),
        ...(hasThreadsAccount && threadsUserId
          ? [
            postToThreads(threadsUserId, jsonToText(editor!.getJSON())).then((url) => ({
              platform: "Threads",
              url,
            })),
          ]
          : []),
      ]);

      const successfulPosts = results
        .filter((result): result is PromiseFulfilledResult<PostResult> =>
          result.status === "fulfilled"
        )
        .map((result) => result.value);

      const failedPosts = results
        .filter((result): result is PromiseRejectedResult =>
          result.status === "rejected"
        )
        .map((result) => result.reason);

      setPostResults(successfulPosts);

      if (failedPosts.length > 0) {
        const firstError = failedPosts[0] as PostError;
        setError({
          platform: firstError.platform,
          message: firstError.message,
        });
        // If we have some successful posts, show partial success
        setStatus(successfulPosts.length > 0 ? "partial_success" : "error");
      } else {
        if (editor) {
          editor.commands.setContent("");
        }
        setImages([]);
        setStatus("success");
      }
    } catch (error) {
      console.error("Error posting:", error);
      setError({
        platform: "unknown",
        message: "An unexpected error occurred",
      });
      setStatus("error");
    }
  };

  const handleModalClose = () => {
    setStatus("idle");
  };

  return (
    <>
      {showAlert && <Alert message="Maximum 4 images allowed" />}
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
        {images.length > 0 && (
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
                  onClick={() => {
                    setImages(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="absolute top-1 right-1 bg-gray-800/75 hover:bg-gray-800/90 text-white p-1.5 rounded-full shadow-lg transition-colors"
                  title="Remove image"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 mb-2 space-y-3">
          {text?.length && text.length > 280 && showWarning ? (
            <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
              <p className="text-sm">
                Only the first 280 characters will be visible on the timeline.
              </p>
              <button
                onClick={() => setShowWarning(false)}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                <CloseIcon />
              </button>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/avif"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 4}
                multiple
              />
              <label
                htmlFor="image-upload"
                className={`${images.length >= 4
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-blue-600 hover:text-white dark:hover:bg-white dark:hover:text-gray-800'
                  } bg-transparent text-blue-500 dark:text-white p-[8px] rounded-full transition-colors`}
              >
                <ImageIcon />
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
            <div className="flex items-center gap-4">
              {!editor?.isEmpty ? (
                <CharacterCounter count={text?.trim().length || 0} limit={280} />
              ) : null}
              <button
                disabled={
                  isPostingDisabled ||
                  editor?.isEmpty ||
                  status === "posting"
                }
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
        isOpen={status !== "idle"}
        platforms={
          [
            ...(hasXAccount ? ["X"] : []),
            ...(hasThreadsAccount ? ["Threads"] : []),
          ] as ("X" | "Threads")[]
        }
        status={status}
        error={error}
        onClose={handleModalClose}
        results={postResults}
      />
    </>
  );
};

export default Content;
