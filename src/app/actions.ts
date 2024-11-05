"use server";

import { clerkClient } from "@clerk/nextjs/server";

export const postToX = async (userId: string, content: string) => {
  console.log("Posting to X:", content);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return "https://x.com";
};

export const postToThreads = async (userId: string, content: string) => {
  console.log("Posting to Threads:", content);
  const clerk = await clerkClient();
  const [userResponse, tokenResponse] = await Promise.all([
    clerk.users.getUser(userId),
    clerk.users.getUserOauthAccessToken(userId, "oauth_custom_threads"),
  ]);
  const threadsUserId = userResponse.externalAccounts[0].externalId;
  const accessToken = tokenResponse.data[0].token;
  const res1 = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=TEXT&text=${content}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const { id: creationId } = (await res1.json()) as { id: string };
  const res2 = await fetch(
    `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const { id: mediaId } = (await res2.json()) as { id: string };
  const res3 = await fetch(
    `https://graph.threads.net/v1.0/${mediaId}?fields=permalink&access_token=${accessToken}`,
    { method: "GET" }
  );
  const { permalink } = (await res3.json()) as { permalink: string };
  return permalink;
};
