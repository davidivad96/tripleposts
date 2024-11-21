"use client";

import { ExtraSession } from "@/types";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BlueskyLoginModal from "./BlueskyLoginModal";
import BlueskyIcon from "./icons/Bluesky";
import SignOutIcon from "./icons/SignOut";
import ThreadsIcon from "./icons/Threads";
import XIcon from "./icons/X";
import Switch from "./Switch";

type ConnectedAccountsProps = {
  extraSessions: ExtraSession[];
  accountStatuses: string[];
  setAccountStatuses: (statuses: string[]) => void;
};

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  extraSessions,
  accountStatuses,
  setAccountStatuses,
}) => {
  const { signIn } = useSignIn();
  const { client, signOut } = useClerk();
  const [showBlueskyModal, setShowBlueskyModal] = useState(false);
  const router = useRouter();

  const sessions = client?.activeSessions || [];

  const hasXAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "x"
  );

  const hasThreadsAccount = sessions.some(
    (session) => session.user?.externalAccounts[0].provider === "custom_threads"
  );

  const hasBlueskyAccount = extraSessions.some(
    (session) => session.provider === "bluesky"
  );

  const signInWith = (strategy: OAuthStrategy) =>
    signIn?.authenticateWithRedirect({
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
            <div className="ml-auto flex items-center gap-3">
              <Switch
                checked={accountStatuses.includes(session.user?.externalAccounts[0].provider === "x" ? "x" : "threads")}
                onChange={(enabled) => {
                  const platform = session.user?.externalAccounts[0].provider === "x" ? "x" : "threads";
                  setAccountStatuses(enabled ? [...accountStatuses, platform] : accountStatuses.filter(s => s !== platform));
                }}
              />
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
        {extraSessions.map((session) => (
          <div
            key={session.provider}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <Image
              src={session.profile.avatar || ""}
              alt={session.profile.displayName || ""}
              className="rounded-full"
              width={40}
              height={40}
            />
            <div className="flex flex-col">
              <p className="font-medium">{session.profile.displayName}</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {session.profile.handle
                  ? `@${session.profile.handle}`
                  : ""}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Switch
                checked={accountStatuses.includes(session.provider)}
                onChange={(enabled) => {
                  setAccountStatuses(enabled ? [...accountStatuses, session.provider] : accountStatuses.filter(s => s !== session.provider));
                }}
              />
              {session.provider === "bluesky" ? (
                <BlueskyIcon />
              ) : null}
              <button
                onClick={async () => {
                  const response = await fetch('/oauth/logout')
                  if (response.ok) {
                    router.refresh();
                  }
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Sign out"
              >
                <SignOutIcon />
              </button>
            </div>
          </div>
        ))}
        {/* Connect Account Buttons */}
        {sessions.length < 3 && (
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
            {!hasBlueskyAccount && (
              <button
                onClick={() => setShowBlueskyModal(true)}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BlueskyIcon />
                <span>Connect Bluesky</span>
              </button>
            )}
          </div>
        )}
      </div>
      <BlueskyLoginModal
        isOpen={showBlueskyModal}
        onClose={() => setShowBlueskyModal(false)}
      />
    </div>
  );
};

export default ConnectedAccounts;
