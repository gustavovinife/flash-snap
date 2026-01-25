import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Flash Snap" className="h-10 w-auto" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("privacy.backToHome")}</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">
          {t("privacy.title")}
        </h1>

        <div className="prose prose-invert prose-gray max-w-none">
          <p className="text-gray-400 mb-6">
            {t("privacy.lastUpdated", { date: "January 25, 2026" })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.introduction.title")}
            </h2>
            <p className="text-gray-400">
              {t("privacy.sections.introduction.content")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.dataCollection.title")}
            </h2>
            <p className="text-gray-400 mb-4">
              {t("privacy.sections.dataCollection.content")}
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>{t("privacy.sections.dataCollection.items.email")}</li>
              <li>{t("privacy.sections.dataCollection.items.flashcards")}</li>
              <li>{t("privacy.sections.dataCollection.items.progress")}</li>
              <li>{t("privacy.sections.dataCollection.items.preferences")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.dataUsage.title")}
            </h2>
            <p className="text-gray-400 mb-4">
              {t("privacy.sections.dataUsage.content")}
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>{t("privacy.sections.dataUsage.items.service")}</li>
              <li>{t("privacy.sections.dataUsage.items.sync")}</li>
              <li>{t("privacy.sections.dataUsage.items.improve")}</li>
              <li>{t("privacy.sections.dataUsage.items.support")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.dataSecurity.title")}
            </h2>
            <p className="text-gray-400">
              {t("privacy.sections.dataSecurity.content")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.userRights.title")}
            </h2>
            <p className="text-gray-400 mb-4">
              {t("privacy.sections.userRights.content")}
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>{t("privacy.sections.userRights.items.access")}</li>
              <li>{t("privacy.sections.userRights.items.correction")}</li>
              <li>{t("privacy.sections.userRights.items.deletion")}</li>
              <li>{t("privacy.sections.userRights.items.export")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.cookies.title")}
            </h2>
            <p className="text-gray-400">
              {t("privacy.sections.cookies.content")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.changes.title")}
            </h2>
            <p className="text-gray-400">
              {t("privacy.sections.changes.content")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {t("privacy.sections.contact.title")}
            </h2>
            <p className="text-gray-400">
              {t("privacy.sections.contact.content")}{" "}
              <a
                href="mailto:support@flashsnap.com.br"
                className="text-secondary-400 hover:text-secondary-300"
              >
                support@flashsnap.com.br
              </a>
            </p>
          </section>
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
