"use server";

import { PostError } from "@/lib/errors";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { clerkClient } from "@clerk/nextjs/server";
import { TwitterApi } from "twitter-api-v2";

export const postToX = async (
  userId: string,
  content: string,
  images: File[]
) => {
  console.log("Posting to X:", content);
  try {
    const clerk = await clerkClient();
    const [userResponse, tokenResponse] = await Promise.all([
      clerk.users.getUser(userId),
      clerk.users.getUserOauthAccessToken(userId, "oauth_x"),
    ]);

    if (!userResponse.externalAccounts[0]?.username) {
      throw new PostError("X account not properly connected", "X");
    }

    const username = userResponse.externalAccounts[0].username;
    const accessToken = tokenResponse.data[0]?.token;

    if (!accessToken) {
      throw new PostError("X access token not found", "X");
    }

    // OAuth 1.0a (User context)
    const userClient = new TwitterApi({
      appKey: process.env.X_OAUTH_CONSUMER_API_KEY!,
      appSecret: process.env.X_OAUTH_CONSUMER_SECRET!,
      accessToken: process.env.X_OAUTH_ACCESS_TOKEN!,
      accessSecret: process.env.X_OAUTH_ACCESS_TOKEN_SECRET!,
    });
    // OAuth2 (app-only or user context)
    const appOnlyClient = new TwitterApi(accessToken);

    // Upload images to X
    const mediaIds = await Promise.all(
      images.map(async (image) =>
        userClient.v1.uploadMedia(Buffer.from(await image.arrayBuffer()), {
          mimeType: image.type,
        })
      )
    );

    // Post to X
    const { data, errors } = await appOnlyClient.v2.tweet(content, {
      ...(mediaIds.length > 0 && {
        media: {
          media_ids: mediaIds as
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string],
        },
      }),
    });

    if (errors) {
      throw new PostError(errors[0].title || "Failed to post to X", "X");
    }

    return `https://x.com/${username}/status/${data.id}`;
  } catch (error) {
    if (error instanceof PostError) throw error;
    throw new PostError(
      error instanceof Error ? error.message : "Failed to post to X",
      "X"
    );
  }
};

export const postToThreads = async (
  userId: string,
  content: string,
  images: File[]
) => {
  console.log("Posting to Threads:", content);
  const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });
  // Upload images to R2
  const URLS = await Promise.all(
    images.map(async (image) => {
      const Key = `${userId}/${Date.now()}-${image.name}`;
      await S3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key,
          Body: Buffer.from(await image.arrayBuffer()),
        })
      );
      return `${process.env.R2_BUCKET_PUBLIC_URL}/${Key}`;
    })
  );

  try {
    const clerk = await clerkClient();
    const userResponse = await clerk.users.getUser(userId);

    if (!userResponse.externalAccounts[0]?.externalId) {
      throw new PostError("Threads account not properly connected", "Threads");
    }

    const threadsUserId = userResponse.externalAccounts[0].externalId;
    const accessToken =
      userResponse.privateMetadata.accessToken ??
      (
        await clerk.users.getUserOauthAccessToken(
          userId,
          "oauth_custom_threads"
        )
      ).data[0]?.token;

    if (!accessToken) {
      throw new PostError("Threads access token not found", "Threads");
    }

    let creationId: string | null = null;

    // Create the post
    const MEDIA_TYPE =
      URLS.length === 0 ? "TEXT" : URLS.length === 1 ? "IMAGE" : "CAROUSEL";
    if (MEDIA_TYPE === "CAROUSEL") {
      // Create the carousel items
      const mediaIds = await Promise.all(
        URLS.map(async (url) => {
          const res = await fetch(
            `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=IMAGE&image_url=${url}&is_carousel_item=true&access_token=${accessToken}`,
            { method: "POST" }
          );
          const { id } = (await res.json()) as { id: string };
          return id;
        })
      );
      // Create the carousel
      const res = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=CAROUSEL&children=${mediaIds.join(
          ","
        )}&text=${encodeURIComponent(content)}&access_token=${accessToken}`,
        { method: "POST" }
      );
      creationId = ((await res.json()) as { id: string }).id;
    } else {
      const res1 = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=${MEDIA_TYPE}&text=${encodeURIComponent(
          content
        )}&${
          MEDIA_TYPE === "IMAGE" ? `image_url=${URLS[0]}` : ""
        }&access_token=${accessToken}`,
        { method: "POST" }
      );

      if (!res1.ok) {
        const error = await res1.json();
        throw new PostError(
          error.message || "Failed to create Threads post",
          "Threads",
          res1.status
        );
      }

      creationId = ((await res1.json()) as { id: string }).id;
    }

    // Publish the post
    const res2 = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`,
      { method: "POST" }
    );

    if (!res2.ok) {
      const error = await res2.json();
      throw new PostError(
        error.message || "Failed to publish Threads post",
        "Threads",
        res2.status
      );
    }

    const { id: mediaId } = (await res2.json()) as { id: string };

    // Get the permalink
    const res3 = await fetch(
      `https://graph.threads.net/v1.0/${mediaId}?fields=permalink&access_token=${accessToken}`,
      { method: "GET" }
    );

    if (!res3.ok) {
      const error = await res3.json();
      throw new PostError(
        error.message || "Failed to get Threads permalink",
        "Threads",
        res3.status
      );
    }

    const { permalink } = (await res3.json()) as { permalink: string };
    return permalink;
  } catch (error) {
    if (error instanceof PostError) throw error;
    throw new PostError(
      error instanceof Error ? error.message : "Failed to post to Threads",
      "Threads"
    );
  }
};
