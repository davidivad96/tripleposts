"use client";

import { postToThreads, postToX } from "@/app/actions";
import { PostError } from "@/lib/errors";
import { PostResult, PostStatus } from "@/types";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import CharacterCounter from "./CharacterCounter";
import ArrowDownIcon from "./icons/ArrowDown";
import CloseIcon from "./icons/Close";
import LoadingModal from "./LoadingModal";

const Content = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();
  const [postContent, setPostContent] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  const [status, setStatus] = useState<PostStatus>("idle");
  const [error, setError] = useState<{ platform: string; message: string } | null>(null);
  const [postResults, setPostResults] = useState<PostResult[]>([]);

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

  const handlePost = async () => {
    if (postContent.length === 0) return;
    setStatus("posting");
    setError(null);
    setPostResults([]);

    try {
      const xUserId = xSession?.user?.id;
      const threadsUserId = threadsSession?.user?.id;
      const results = await Promise.allSettled([
        ...(hasXAccount && xUserId
          ? [
            postToX(xUserId, postContent).then((url) => ({
              platform: "X",
              url,
            })),
          ]
          : []),
        ...(hasThreadsAccount && threadsUserId
          ? [
            postToThreads(threadsUserId, postContent).then((url) => ({
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
        setPostContent("");
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
        status={status}
        error={error}
        onClose={handleModalClose}
        results={postResults}
      />
    </>
  );
};

export default Content;
