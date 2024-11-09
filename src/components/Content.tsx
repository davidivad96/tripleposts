"use client";

import { postToThreads, postToX } from "@/app/actions";
import { useEditorConfig } from "@/hooks/useEditorConfig";
import { PostError } from "@/lib/errors";
import { jsonToText } from "@/lib/utils";
import { PostResult, PostStatus } from "@/types";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";
import Alert from "./Alert";
import CharacterCounter from "./CharacterCounter";
import EditImageModal from "./editor/EditImageModal";
import EditorToolbar from "./editor/EditorToolbar";
import ImagePreview from "./editor/ImagePreview";
import WarningBanner from "./editor/WarningBanner";
import ArrowDownIcon from "./icons/ArrowDown";
import LoadingModal from "./LoadingModal";

const Content: React.FC = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const [showWarning, setShowWarning] = useState(true);
  const [status, setStatus] = useState<PostStatus>("idle");
  const [error, setError] = useState<{ platform: string; message: string } | null>(null);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const editor = useEditor(useEditorConfig());

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

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleSaveEditedImage = (editedImage: { file: File; preview: string }) => {
    if (selectedImageIndex === null) return;
    setImages(prev => prev.map((img, i) =>
      i === selectedImageIndex ? editedImage : img
    ));
    setSelectedImageIndex(null);
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
        <ImagePreview
          images={images}
          onRemoveImage={handleRemoveImage}
          onEditImage={handleEditImage}
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
              imagesCount={images.length}
            />
            <div className="flex items-center gap-4">
              {!editor?.isEmpty && (
                <CharacterCounter count={text?.trim().length || 0} limit={280} />
              )}
              <button
                disabled={isPostingDisabled || editor?.isEmpty || status === "posting"}
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
        platforms={[
          ...(hasXAccount ? ["X"] : []),
          ...(hasThreadsAccount ? ["Threads"] : []),
        ] as ("X" | "Threads")[]}
        status={status}
        error={error}
        onClose={handleModalClose}
        results={postResults}
      />
      <EditImageModal
        isOpen={selectedImageIndex !== null}
        image={selectedImageIndex !== null ? images[selectedImageIndex] : null}
        onClose={() => setSelectedImageIndex(null)}
        onSave={handleSaveEditedImage}
      />
    </>
  );
};

export default Content;
