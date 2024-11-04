import ConnectedAccounts from "@/components/ConnectedAccounts";
import Content from "@/components/Content";

const Home: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center p-4">
    {/* Hero Section */}
    <div className="w-full max-w-2xl text-center my-16">
      <h1 className="font-bold text-4xl mb-3 font-mono">
        Dual<span className="text-blue-500">Posts</span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Write once, post twice
      </p>
    </div>
    {/* Main Content */}
    <main className="w-full max-w-2xl flex flex-col gap-6">
      <Content />
      {/* Connected Accounts Section */}
      <ConnectedAccounts />
    </main>
  </div>
);

export default Home;
