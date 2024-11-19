import { getSessionAgent } from "@/bluesky/context";
import { getContext } from "@/bluesky/instrumentation";
import ConnectedAccounts from "@/components/ConnectedAccounts";
import Content from "@/components/Content";
import { ExtraSession } from "@/types";

const Home: React.FC = async () => {
  const ctx = getContext();
  const agent = await getSessionAgent(ctx);
  const extraSessions: ExtraSession[] = [];
  if (agent) {
    const handle = await ctx.resolver.resolveDidToHandle(agent.did!);
    const { data: profile } = await agent?.app.bsky.actor.getProfile({
      actor: handle,
    });
    extraSessions.push({
      provider: "bluesky",
      profile,
    });
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* Hero Section */}
      <div className="w-full max-w-2xl text-center mb-8">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Write once, post twice
        </p>
      </div>
      {/* Main Content */}
      <main className="w-full max-w-2xl flex-1 flex flex-col gap-6 overflow-y-auto">
        <Content hasBlueskyAccount={!!agent} />
        {/* Connected Accounts Section */}
        <ConnectedAccounts extraSessions={extraSessions} />
      </main>
    </div>
  );
};

export default Home;
