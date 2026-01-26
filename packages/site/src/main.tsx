import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import App from "./App";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { ThankYou } from "./pages/ThankYou";
import "./index.css";
import "./i18n";

// Initialize PostHog
posthog.init("phc_mCiB9WdbT8yu5Se08aksD0ORDxPye8P5lgbfssIttiL", {
  api_host: "https://us.i.posthog.com",
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </BrowserRouter>
    </PostHogProvider>
  </React.StrictMode>,
);
