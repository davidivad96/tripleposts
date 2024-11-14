import ConnectedAccounts from "@/components/ConnectedAccounts";
import Content from "@/components/Content";

const Home: React.FC = () => (
  <div className="flex flex-col items-center p-4 mt-10">
    {/* Hero Section */}
    <div className="w-full max-w-2xl text-center mb-8">
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Write once, post twice
      </p>
    </div>
    {/* Main Content */}
    <main className="w-full max-w-2xl flex-1 flex flex-col gap-6 overflow-y-auto">
      <Content />
      {/* Connected Accounts Section */}
      <ConnectedAccounts />
    </main>
  </div>
);

export default Home;
