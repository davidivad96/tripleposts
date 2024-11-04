"use client";

import CharacterCounter from "@/components/CharacterCounter";
import ArrowDownIcon from "@/components/icons/ArrowDown";
import CloseIcon from "@/components/icons/Close";
import SignOutIcon from "@/components/icons/SignOut";
import ThreadsIcon from "@/components/icons/Threads";
import XIcon from "@/components/icons/X";
import LoadingModal from "@/components/LoadingModal";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";
import { useState } from "react";
import { postToThreads, postToX } from "./actions";

const Home: React.FC = () => {
  const { signIn } = useSignIn();
  const { client, signOut } = useClerk();
  const [postContent, setPostContent] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  if (!signIn) return null;

  const sessions = client.sessions || [];

  const signInWith = (strategy: OAuthStrategy) =>
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });

  const handlePost = async () => {
    if (postContent.length === 0) return;
    setIsPosting(true);
    try {
      const actionsToCall = [
        ...(hasXAccount ? [postToX] : []),
        ...(hasThreadsAccount ? [postToThreads] : []),
      ];
      await Promise.all(actionsToCall.map((action) => action(postContent)));
      setPostContent(""); // Clear the content after successful post
    } catch (error) {
      console.error("Error posting:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isPostingDisabled) {
      e.preventDefault();
      handlePost();
    }
  };

  const hasXAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "x"
  );

  const hasThreadsAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "custom_threads"
  );

  const isPostingDisabled = sessions.length === 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      {/* Hero Section */}
      <div className="w-full max-w-2xl text-center my-16">
        <h1 className="font-bold text-4xl mb-3 font-mono">
          Dual<span className="text-blue-500">Posts</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Write once, post twice
        </p>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-2xl flex flex-col gap-6">
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
                  isPostingDisabled || postContent.length === 0 || isPosting
                }
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handlePost}
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Connected Accounts Section - Keep existing code */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <h2 className="text-md font-bold text-gray-500 dark:text-gray-400 mb-3">
            Connected Accounts
          </h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <Image
                  src={session.user?.imageUrl || ""}
                  alt={session.user?.fullName || ""}
                  className="rounded-full"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <p className="font-medium">{session.user?.fullName}</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {session.user?.username ? `@${session.user?.username}` : ""}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {session.user?.externalAccounts[0].provider === "x" ? (
                    <XIcon />
                  ) : (
                    <ThreadsIcon />
                  )}
                  <button
                    onClick={() => signOut({ sessionId: session.id })}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Sign out"
                  >
                    <SignOutIcon />
                  </button>
                </div>
              </div>
            ))}

            {/* Connect Account Buttons */}
            {sessions.length < 2 && (
              <div className="space-y-3">
                {!hasXAccount && (
                  <button
                    onClick={() => signInWith("oauth_x")}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XIcon />
                    <span>Connect X</span>
                  </button>
                )}
                {!hasThreadsAccount && (
                  <button
                    onClick={() => signInWith("oauth_custom_threads")}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ThreadsIcon />
                    <span>Connect Threads</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <LoadingModal
        isOpen={isPosting}
        platforms={
          [
            ...(hasXAccount ? ["X"] : []),
            ...(hasThreadsAccount ? ["Threads"] : []),
          ] as ("X" | "Threads")[]
        }
      />
    </div>
  );
};

export default Home;
