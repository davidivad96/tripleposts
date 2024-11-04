"use client";

import CharacterCounter from "@/components/CharacterCounter";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";
import { useState } from "react";

const Home: React.FC = () => {
  const { signIn } = useSignIn();
  const { client, signOut } = useClerk();
  const [postContent, setPostContent] = useState("");
  const [showWarning, setShowWarning] = useState(true);

  if (!signIn) return null;

  const sessions = client.sessions || [];

  const signInWith = (strategy: OAuthStrategy) =>
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });

  const handlePost = () => {
    if (postContent.length === 0) return;
    console.log("Posting content:", postContent);
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
                <svg
                  className="w-6 h-6 mx-auto text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <CharacterCounter count={postContent.length} limit={280} />
              <button
                disabled={isPostingDisabled || postContent.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 192 192"
                      fill="currentColor"
                    >
                      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                    </svg>
                  )}
                  <button
                    onClick={() => signOut({ sessionId: session.id })}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Sign out"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
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
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Connect X</span>
                  </button>
                )}
                {!hasThreadsAccount && (
                  <button
                    onClick={() => signInWith("oauth_custom_threads")}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 192 192"
                      fill="currentColor"
                    >
                      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                    </svg>
                    <span>Connect Threads</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
