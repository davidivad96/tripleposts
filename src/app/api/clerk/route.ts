import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";

// This is a webhook that Clerk sends to us on any event
// Here we are handling the session.created event
// We use this to exchange the Threads short-lived access token for a long-lived one
export const POST = async (request: Request) => {
  try {
    const payload: WebhookEvent = await request.json();
    if (payload.type === "session.created") {
      const clerk = await clerkClient();
      const userId = payload.data.user_id;
      const user = await clerk.users.getUser(userId);
      const isThreadsSession =
        user.externalAccounts[0].provider === "oauth_custom_threads";
      if (isThreadsSession) {
        const accessToken = (
          await clerk.users.getUserOauthAccessToken(
            userId,
            "oauth_custom_threads"
          )
        ).data[0].token;
        const res = await fetch(
          `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${accessToken}`,
          { method: "GET" }
        );
        const { access_token: newToken } = (await res.json()) as {
          access_token: string;
        };
        await clerk.users.updateUserMetadata(userId, {
          privateMetadata: {
            accessToken: newToken,
          },
        });
      }
    }
    return Response.json({ message: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
