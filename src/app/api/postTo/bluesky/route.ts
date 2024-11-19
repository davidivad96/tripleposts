import { getSessionAgent } from "@/bluesky/context";
import { getContext } from "@/bluesky/instrumentation";
import { PostError } from "@/lib/errors";

export async function POST(request: Request) {
  console.log("Posting to Bluesky");
  try {
    const formData = await request.formData();
    const content = formData.get("content") as string;
    const mediaFiles = formData.getAll("mediaFiles") as File[];

    const ctx = getContext();
    const agent = await getSessionAgent(ctx);
    if (!agent) {
      throw new PostError("Bluesky account not properly connected", "Bluesky");
    }

    // Post the content
    const { uri } = await agent.post({
      text: content,
      ...(mediaFiles.length > 0
        ? {
            embed: {
              $type: "app.bsky.embed.images",
              images: await Promise.all(
                mediaFiles.map(async (file) => {
                  // Upload the media
                  const { data } = await agent.uploadBlob(file, {
                    encoding: file.type,
                  });
                  return { image: data.blob, alt: file.name };
                })
              ),
            },
          }
        : {}),
    });

    // Get the user handle and extract the post ID from the URI
    const handle = await ctx.resolver.resolveDidToHandle(agent.did!);
    const postId = uri.split("/").pop();
    return Response.json({
      url: `https://bsky.app/profile/${handle}/post/${postId}`,
    });
  } catch (error) {
    if (error instanceof PostError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to post to Bluesky",
      },
      { status: 500 }
    );
  }
}
