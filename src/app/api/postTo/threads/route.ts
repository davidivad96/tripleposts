import { PostError } from "@/lib/errors";
import { ThreadsMediaContainerStatus } from "@/types";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  console.log("Posting to Threads");
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const userId = formData.get("userId") as string;
    const mediaFiles = formData.getAll("mediaFiles") as File[];

    const checkContainerStatus = async (
      creationId: string,
      accessToken: string
    ) => {
      let status: ThreadsMediaContainerStatus = "IN_PROGRESS";
      while (status === "IN_PROGRESS") {
        const res = await fetch(
          `https://graph.threads.net/v1.0/${creationId}?fields=status&access_token=${accessToken}`,
          { method: "GET" }
        );
        ({ status } = (await res.json()) as {
          status: ThreadsMediaContainerStatus;
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (status === "ERROR") {
        throw new PostError("Failed to create Threads post", "Threads");
      }
    };

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    });

    // Upload media to R2
    const URLS = await Promise.all(
      mediaFiles.map(async (media) => {
        const Key = `${userId}/${Date.now()}-${media.name}`;
        await S3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key,
            Body: Buffer.from(await media.arrayBuffer()),
          })
        );
        return `${process.env.R2_BUCKET_PUBLIC_URL}/${Key}`;
      })
    );

    const clerk = await clerkClient();
    const userResponse = await clerk.users.getUser(userId);

    if (!userResponse.externalAccounts[0]?.externalId) {
      throw new PostError("Threads account not properly connected", "Threads");
    }

    const threadsUserId = userResponse.externalAccounts[0].externalId;
    const accessToken =
      (userResponse.privateMetadata.accessToken as string) ??
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
    if (URLS.length > 1) {
      // Create the carousel items
      const mediaIds = await Promise.all(
        URLS.map(async (url) => {
          const res = await fetch(
            `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=IMAGE&image_url=${url}&is_carousel_item=true&access_token=${accessToken}`,
            { method: "POST" }
          );
          const { id } = (await res.json()) as { id: string };

          // Query for media container until it's ready
          await checkContainerStatus(id, accessToken);

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
      const noMedia = URLS.length === 0;
      const res = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=${
          noMedia ? "TEXT" : "IMAGE"
        }&${noMedia ? "" : "image_url"}=${URLS[0]}&text=${encodeURIComponent(
          content
        )}&access_token=${accessToken}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new PostError(
          error.message || "Failed to create Threads post",
          "Threads",
          res.status
        );
      }

      creationId = ((await res.json()) as { id: string }).id;
    }

    // Query for media container until it's ready
    await checkContainerStatus(creationId, accessToken);

    // Publish the post
    const res1 = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`,
      { method: "POST" }
    );

    if (!res1.ok) {
      const error = await res1.json();
      throw new PostError(
        error.message || "Failed to publish Threads post",
        "Threads",
        res1.status
      );
    }

    const { id: mediaId } = (await res1.json()) as { id: string };

    // Get the permalink
    const res2 = await fetch(
      `https://graph.threads.net/v1.0/${mediaId}?fields=permalink&access_token=${accessToken}`,
      { method: "GET" }
    );

    if (!res2.ok) {
      const error = await res2.json();
      throw new PostError(
        error.message || "Failed to get Threads permalink",
        "Threads",
        res2.status
      );
    }

    const { permalink } = (await res2.json()) as { permalink: string };
    return Response.json({ url: permalink });
  } catch (error) {
    if (error instanceof PostError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to post to Threads",
      },
      { status: 500 }
    );
  }
}
