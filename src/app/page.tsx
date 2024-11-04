"use client";

import { useClerk, useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";

const Home: React.FC = () => {
  const { signIn } = useSignIn();
  const { client } = useClerk();

  if (!signIn) return null;

  const sessions = client.activeSessions || [];

  const signInWith = (strategy: OAuthStrategy) =>
    signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });

  return (
    <div className="h-screen flex justify-center items-center">
      <main className="w-full max-w-xs flex flex-col gap-4">
        <button
          onClick={() => signInWith("oauth_x")}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full"
        >
          Sign in with X
        </button>
        <button
          onClick={() => signInWith("oauth_custom_threads")}
          className="bg-white text-black border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
        >
          Sign in with Threads
        </button>
        <div className="flex flex-row justify-between items-center">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-2">
              <Image
                src={session.user.imageUrl || ""}
                alt={session.user.username || session.user.fullName || ""}
                className="rounded-full"
                width={40}
                height={40}
              />
              <div className="flex flex-col">
                <p>{session.user.username}</p>
                <span className="text-gray-500 text-sm">
                  {session.user.fullName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
