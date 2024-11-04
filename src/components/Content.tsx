"use client";

import { postToThreads, postToX } from "@/app/actions";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import CharacterCounter from "./CharacterCounter";
import ArrowDownIcon from "./icons/ArrowDown";
import CloseIcon from "./icons/Close";
import LoadingModal from "./LoadingModal";

type PostStatus = "idle" | "posting" | "success";

const Content = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const [postContent, setPostContent] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  const [status, setStatus] = useState<PostStatus>("idle");

  if (!signIn) return null;

  const sessions = client.sessions || [];

  const hasXAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "x"
  );

  const hasThreadsAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "custom_threads"
  );

  const isPostingDisabled = sessions.length === 0;

  const handlePost = async () => {
    if (postContent.length === 0) return;
    setStatus("posting");
    try {
      const actionsToCall = [
        ...(hasXAccount ? [postToX] : []),
        ...(hasThreadsAccount ? [postToThreads] : []),
      ];
      await Promise.all(actionsToCall.map((action) => action(postContent)));
      setPostContent(""); // Clear the content after successful post
      setStatus("success");
    } catch (error) {
      console.error("Error posting:", error);
      setStatus("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isPostingDisabled) {
      e.preventDefault();
      handlePost();
    }
  };

  const handleModalClose = () => {
    setStatus("idle");
  };

  return (
    <>
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
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's happening?"
          disabled={isPostingDisabled}
          className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="mt-4 space-y-3">
          {postContent.length > 280 && showWarning && (
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
          )}
          <div className="flex items-center justify-between">
            <CharacterCounter count={postContent.length} limit={280} />
            <button
              disabled={
                isPostingDisabled ||
                postContent.length === 0 ||
                status === "posting"
              }
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handlePost}
            >
              Post
            </button>
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
        isSuccess={status === "success"}
        onClose={handleModalClose}
      />
    </>
  );
};

export default Content;
