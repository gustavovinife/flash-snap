import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const faqItems: FAQItem[] = [
  { questionKey: "faq.mobile.question", answerKey: "faq.mobile.answer" },
  { questionKey: "faq.pricing.question", answerKey: "faq.pricing.answer" },
  { questionKey: "faq.languages.question", answerKey: "faq.languages.answer" },
  { questionKey: "faq.premium.question", answerKey: "faq.premium.answer" },
];

export function FAQAccordion() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {faqItems.map((item, index) => (
        <div
          key={index}
          className="bg-gray-800/30 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-medium text-white">
              {t(item.questionKey)}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? "max-h-48" : "max-h-0"
            }`}
          >
            <p className="px-6 pb-4 text-gray-400">{t(item.answerKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
