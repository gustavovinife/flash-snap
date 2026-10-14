import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Smartphone, Apple, Play } from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

// The preview channel always serves the latest `yarn publish:preview` from packages/mobile
const EXPO_PREVIEW_URL =
  "exp://u.expo.dev/b3d83416-1a3f-45f5-9512-8d1c09c9cbc6?channel-name=preview";
const EXPO_GO_IOS = "https://apps.apple.com/app/expo-go/id982107779";
const EXPO_GO_ANDROID =
  "https://play.google.com/store/apps/details?id=host.exp.exponent";

export function Beta() {
  const { t } = useTranslation();

  const steps = [t("beta.step1"), t("beta.step2"), t("beta.step3")];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
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
            <span className="hidden sm:inline">{t("beta.backToHome")}</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 text-purple-300 text-sm font-medium px-3 py-1 mb-5">
              <Smartphone className="w-4 h-4" />
              {t("beta.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("beta.title")}
            </h1>
            <p className="text-lg text-gray-300 mb-8">{t("beta.subtitle")}</p>

            <ol className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-gray-300">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap gap-3">
              <a
                href={EXPO_GO_IOS}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
              >
                <Apple className="w-5 h-5" />
                {t("beta.appStore")}
              </a>
              <a
                href={EXPO_GO_ANDROID}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
              >
                <Play className="w-5 h-5" />
                {t("beta.playStore")}
              </a>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl p-4 inline-block mb-5">
                <QRCodeSVG value={EXPO_PREVIEW_URL} size={200} level="M" />
              </div>
              <p className="text-gray-400 text-sm mb-6">{t("beta.scan")}</p>
            </div>

            <a
              href={EXPO_PREVIEW_URL}
              className="block w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold py-4 transition-colors"
            >
              {t("beta.open")}
            </a>
            <p className="text-gray-500 text-xs mt-4">{t("beta.openHint")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
