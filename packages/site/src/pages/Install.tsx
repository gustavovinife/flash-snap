import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Chrome,
  Compass,
  Download,
  Globe,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import {
  detectInstallPlatform,
  INSTALL_APP_PATH,
  isMobileDevice,
  WEB_APP_PATH,
  type InstallPlatform,
} from "../lib/webApp";

const PLATFORMS: { id: InstallPlatform; icon: LucideIcon }[] = [
  { id: "desktop-chromium", icon: Chrome },
  { id: "mac-safari", icon: Compass },
  { id: "ios", icon: Smartphone },
  { id: "android", icon: Smartphone },
  { id: "desktop-other", icon: Globe },
];

function PlatformSteps({
  platform,
  highlighted = false,
}: {
  platform: (typeof PLATFORMS)[number];
  highlighted?: boolean;
}) {
  const { t } = useTranslation();
  const Icon = platform.icon;
  const key = `install.platforms.${platform.id}`;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlighted
          ? "bg-purple-500/10 border-purple-500/30"
          : "bg-gray-900/60 border-gray-800"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-purple-300" />
        <h3 className="font-semibold text-white">{t(`${key}.title`)}</h3>
      </div>
      <ol className="space-y-3">
        {(["step1", "step2"] as const).map((step, index) => (
          <li key={step} className="flex gap-3 text-gray-300 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center justify-center">
              {index + 1}
            </span>
            <span className="pt-0.5">{t(`${key}.${step}`)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Install() {
  const { t } = useTranslation();
  const posthog = usePostHog();
  const webAppUrl = `${window.location.origin}${WEB_APP_PATH}`;
  const detected = detectInstallPlatform();
  const current = PLATFORMS.find((p) => p.id === detected) ?? PLATFORMS[0];
  const others = PLATFORMS.filter((p) => p.id !== current.id);
  const isMobile = isMobileDevice();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Flash Snap" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t("install.backToHome")}</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-10 md:py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.25fr_1fr] gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 text-purple-300 text-sm font-medium px-3 py-1 mb-5">
              <Download className="w-4 h-4" />
              {t("install.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("install.title")}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {t("install.subtitle")}
            </p>

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {t("install.yourDevice")}
            </p>
            <PlatformSteps platform={current} highlighted />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center md:mt-14">
            <img
              src="/app-icon.png"
              alt=""
              className="w-20 h-20 rounded-2xl mx-auto mb-6 shadow-lg shadow-purple-900/40"
            />
            <a
              href={INSTALL_APP_PATH}
              onClick={() =>
                posthog.capture("install_cta_clicked", {
                  location: "install_page",
                  platform: detected,
                })
              }
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 transition-colors"
            >
              <Download className="w-5 h-5" />
              {t("install.installNow")}
            </a>
            <a
              href={WEB_APP_PATH}
              onClick={() =>
                posthog.capture("web_app_opened", { location: "install_page" })
              }
              className="block mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {t("install.openInBrowser")}
            </a>
            <p className="text-gray-500 text-xs mt-6">{t("install.free")}</p>

            {!isMobile && (
              <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="bg-white rounded-2xl p-3 inline-block mb-3">
                  <QRCodeSVG value={webAppUrl} size={140} level="M" />
                </div>
                <p className="text-gray-400 text-sm">{t("install.scan")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {t("install.otherDevices")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {others.map((platform) => (
              <PlatformSteps key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
