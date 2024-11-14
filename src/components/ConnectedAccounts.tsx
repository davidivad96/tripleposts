"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";
import SignOutIcon from "./icons/SignOut";
import ThreadsIcon from "./icons/Threads";
import XIcon from "./icons/X";

const ConnectedAccounts: React.FC = () => {
  const { signIn } = useSignIn();
  const { client, signOut } = useClerk();

  if (!signIn) return null;

  const sessions = client.activeSessions || [];

  const hasXAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "x"
  );

  const hasThreadsAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "custom_threads"
  );

  const signInWith = (strategy: OAuthStrategy) =>
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });

  return (
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
                {session.user?.externalAccounts[0].username
                  ? `@${session.user.externalAccounts[0].username}`
                  : ""}
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
  );
};

export default ConnectedAccounts;
