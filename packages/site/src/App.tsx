import { useTranslation } from "react-i18next";
import { useGitHubRelease, platformNames } from "./hooks/useGitHubRelease";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import {
  Zap,
  Brain,
  Volume2,
  Apple,
  Monitor,
  Download,
  Mail,
  Bell,
  TrendingUp,
  BookOpen,
  Laptop,
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
  const { t } = useTranslation();
  const { loading, platform, downloadInfo, allDownloads } = useGitHubRelease();

  const handleDownload = () => {
    if (downloadInfo?.url) {
      window.open(downloadInfo.url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <header className="relative overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />

        <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Flash Snap" className="h-12 w-auto" />
          </div>
          <LanguageSwitcher />
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-secondary-400" />
              <span className="text-sm text-gray-300">{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              {t("hero.title")}
              <span className="text-secondary-400">
                {" "}
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDownload}
                disabled={loading || !downloadInfo}
                className="group relative inline-flex items-center gap-3 bg-secondary-500 hover:bg-secondary-400 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-secondary-500/20 hover:shadow-secondary-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>{t("hero.loading")}</span>
                ) : (
                  <>
                    <PlatformIcon platform={platform} />
                    <span>
                      {t("hero.downloadFor", {
                        platform: platformNames[platform],
                      })}
                    </span>
                    {downloadInfo && (
                      <span className="text-sm opacity-75">
                        ({downloadInfo.size})
                      </span>
                    )}
                  </>
                )}
              </button>

              {downloadInfo && (
                <span className="text-sm text-gray-500">
                  {t("hero.version", { version: downloadInfo.version })}
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
            {t("features.title")}
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Laptop className="w-6 h-6 text-secondary-400" />}
              title={t("features.desktopFirst.title")}
              description={t("features.desktopFirst.description")}
            />
            <FeatureCard
              icon={<Bell className="w-6 h-6 text-secondary-400" />}
              title={t("features.notifications.title")}
              description={t("features.notifications.description")}
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-secondary-400" />}
              title={t("features.progress.title")}
              description={t("features.progress.description")}
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6 text-secondary-400" />}
              title={t("features.templates.title")}
              description={t("features.templates.description")}
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-secondary-400" />}
              title={t("features.algorithm.title")}
              description={t("features.algorithm.description")}
            />
            <FeatureCard
              icon={<Volume2 className="w-6 h-6 text-secondary-400" />}
              title={t("features.tts.title")}
              description={t("features.tts.description")}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            {t("useCases.title")}
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            {t("useCases.subtitle")}
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="🌍"
              title={t("useCases.language.title")}
              description={t("useCases.language.description")}
            />
            <StepCard
              number="📚"
              title={t("useCases.academic.title")}
              description={t("useCases.academic.description")}
            />
            <StepCard
              number="💼"
              title={t("useCases.professional.title")}
              description={t("useCases.professional.description")}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            {t("howItWorks.title")}
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title={t("howItWorks.step1.title")}
              description={t("howItWorks.step1.description")}
            />
            <StepCard
              number="2"
              title={t("howItWorks.step2.title")}
              description={t("howItWorks.step2.description")}
            />
            <StepCard
              number="3"
              title={t("howItWorks.step3.title")}
              description={t("howItWorks.step3.description")}
            />
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            {t("download.title")}
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            {t("download.subtitle")}
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
                  <span>{t(`download.platforms.${p}`)}</span>
                  {info && (
                    <span className="text-sm text-gray-500">({info.size})</span>
                  )}
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
              {t("footer.contact")}
            </a>
          </div>
          <p className="text-sm text-gray-600">
            {t("footer.copyright", { year: new Date().getFullYear() })}
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
