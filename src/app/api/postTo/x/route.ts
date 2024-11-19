import { PostError } from "@/lib/errors";
import { clerkClient } from "@clerk/nextjs/server";
import { TwitterApi } from "twitter-api-v2";

export async function POST(request: Request) {
  console.log("Posting to X");
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const userId = formData.get("userId") as string;
    const mediaFiles = formData.getAll("mediaFiles") as File[];

    if (!content || !userId) {
      throw new PostError("Missing required fields", "X");
    }

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

    // Upload media to X
    const mediaIds = await Promise.all(
      mediaFiles.map(async (media) =>
        userClient.v1.uploadMedia(Buffer.from(await media.arrayBuffer()), {
          mimeType: media.type,
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

    return Response.json({
      url: `https://x.com/${username}/status/${data.id}`,
    });
  } catch (error) {
    if (error instanceof PostError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to post to X" },
      { status: 500 }
    );
  }
}
