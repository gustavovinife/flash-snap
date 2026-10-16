import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import App from "./App";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { ThankYou } from "./pages/ThankYou";
import { Install } from "./pages/Install";
import "./index.css";
import "./i18n";

// Initialize PostHog
posthog.init("phc_mCiB9WdbT8yu5Se08aksD0ORDxPye8P5lgbfssIttiL", {
  api_host: "https://us.i.posthog.com",
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});

// Supabase sends Google sign-ins to the Site URL (this landing page) when the app's URL isn't in its
// redirect allow-list; hand the session in the URL over to the web app, which signs the user in
const { pathname, search, hash } = window.location;
const isAuthRedirect =
  /[#&](access_token|error_description)=/.test(hash) || /[?&]code=/.test(search);
if (isAuthRedirect && !pathname.startsWith("/app")) {
  window.location.replace(`/app/${search}${hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/install" element={<Install />} />
          <Route path="/beta" element={<Install />} />
        </Routes>
      </BrowserRouter>
    </PostHogProvider>
  </React.StrictMode>,
);
