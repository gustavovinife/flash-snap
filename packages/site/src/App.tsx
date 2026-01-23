import { useGitHubRelease, platformNames } from "./hooks/useGitHubRelease";
import {
  Zap,
  Brain,
  Target,
  Volume2,
  Cloud,
  Globe,
  Apple,
  Monitor,
  Download,
  Mail,
} from "lucide-react";

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "mac":
      return <Apple className="w-5 h-5" />;
    case "windows":
      return <Monitor className="w-5 h-5" />;
    case "linux":
      return <Monitor className="w-5 h-5" />;
    default:
      return <Download className="w-5 h-5" />;
  }
};

function App() {
  const { loading, platform, downloadInfo, allDownloads } = useGitHubRelease();

  const handleDownload = () => {
    if (downloadInfo?.url) {
      window.open(downloadInfo.url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Flash Snap" className="h-12 w-auto" />
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-gray-300">
                Capture. Learn. Remember.
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Turn any text into
              <span className="text-secondary-400"> flashcards </span>
              instantly
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Select text anywhere, press a shortcut, and Flash Snap creates a
              flashcard. Master any subject with science-backed spaced
              repetition.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownload}
                disabled={loading || !downloadInfo}
                className="group relative inline-flex items-center gap-3 bg-secondary-500 hover:bg-secondary-400 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-secondary-500/20 hover:shadow-secondary-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <PlatformIcon platform={platform} />
                    <span>Download for {platformNames[platform]}</span>
                  </>
                )}
              </button>

              {downloadInfo && (
                <span className="text-sm text-gray-500">
                  Version {downloadInfo.version}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Why Flash Snap?
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Built for learners who value their time. No friction, just results.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-secondary-400" />}
              title="Instant Capture"
              description="Select any text, press Ctrl+Shift+X, and your flashcard is ready. No copy-paste, no switching apps."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-secondary-400" />}
              title="Smart Repetition"
              description="SM-2 algorithm schedules reviews at the perfect time. Learn more in less time with proven science."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6 text-secondary-400" />}
              title="500+ Ready Cards"
              description="Start immediately with pre-built decks for English, TOEFL, business vocabulary, and more."
            />
            <FeatureCard
              icon={<Volume2 className="w-6 h-6 text-secondary-400" />}
              title="Text-to-Speech"
              description="Hear the pronunciation of any card. Perfect for language learning and memorizing terms."
            />
            <FeatureCard
              icon={<Cloud className="w-6 h-6 text-secondary-400" />}
              title="Cloud Sync"
              description="Your cards sync across devices. Start on desktop, review on the go."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-secondary-400" />}
              title="Multi-language"
              description="Interface available in English and Portuguese. More languages coming soon."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Three steps to better learning
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Capture"
              description="Select text anywhere on your computer and press the global shortcut."
            />
            <StepCard
              number="2"
              title="Review"
              description="Flash Snap shows your cards at the optimal time for memory retention."
            />
            <StepCard
              number="3"
              title="Master"
              description="Rate your recall and watch your knowledge grow over time."
            />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to learn smarter?
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            Download Flash Snap for free. Available for macOS, Windows, and
            Linux.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {(["mac", "windows", "linux"] as const).map((p) => {
              const info = allDownloads[p];
              return (
                <a
                  key={p}
                  href={info?.url || "#"}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 ${
                    info
                      ? "border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 text-white"
                      : "border-gray-800 opacity-50 cursor-not-allowed text-gray-500"
                  }`}
                  onClick={(e) => !info && e.preventDefault()}
                >
                  <PlatformIcon platform={p} />
                  <span>{platformNames[p]}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Flash Snap" className="h-7 w-auto" />
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a
              href="mailto:support@flashsnap.app"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </div>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Flash Snap. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary-500 text-gray-900 font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default App;
