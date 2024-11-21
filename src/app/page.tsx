import { getSessionAgent } from "@/bluesky/context";
import { getContext } from "@/bluesky/instrumentation";
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
    <div className="flex flex-col h-full w-full">
      {/* Hero Section */}
      <div className="w-full max-w-2xl mx-auto px-4 mt-8">
        <p className="text-xl text-gray-600 dark:text-gray-400 text-center">
          Write once, post thrice
        </p>
      </div>
      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto px-4 mt-4">
        <div className="space-y-4 mb-8">
          <Content extraSessions={extraSessions} />
        </div>
      </div>
    </div>
  );
};

export default Home;
