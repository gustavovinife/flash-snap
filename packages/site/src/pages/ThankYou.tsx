import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";

export function ThankYou() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Flash Snap" className="h-10 w-auto" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("thankYou.backToHome")}</span>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {t("thankYou.title")}
          </h1>

          <p className="text-xl text-gray-300 mb-6">
            {t("thankYou.subtitle")}
          </p>

          <p className="text-gray-400 mb-8">
            {t("thankYou.description")}
          </p>

          {/* Instructions Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5 text-secondary-400" />
              <h2 className="text-lg font-semibold text-white">
                {t("thankYou.nextSteps.title")}
              </h2>
            </div>
            <ol className="text-gray-300 space-y-3">
              <li className="flex items-center justify-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary-500 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>{t("thankYou.nextSteps.step1")}</span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary-500 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>{t("thankYou.nextSteps.step2")}</span>
              </li>
              <li className="flex items-center justify-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-secondary-500 text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>{t("thankYou.nextSteps.step3")}</span>
              </li>
            </ol>
          </div>

          {/* Support Link */}
          <p className="text-sm text-gray-500">
            {t("thankYou.support")}{" "}
            <a
              href="mailto:support@flashsnap.com.br"
              className="text-secondary-400 hover:text-secondary-300"
            >
              support@flashsnap.com.br
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
