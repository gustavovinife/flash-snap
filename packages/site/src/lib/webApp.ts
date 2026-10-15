// The Flash Snap app's web build, served from this site under /app (see vercel.json)
export const WEB_APP_PATH = "/app/";
// Opens the app with its install dialog already showing (one-click install on Chrome/Edge)
export const INSTALL_APP_PATH = "/app/?install=1";

export type InstallPlatform =
  | "desktop-chromium"
  | "mac-safari"
  | "ios"
  | "android"
  | "desktop-other";

export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  // iPadOS reports itself as a Mac, so also check for touch support
  const isIPad =
    userAgent.includes("macintosh") && navigator.maxTouchPoints > 1;
  return (
    isIPad ||
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(
      userAgent,
    )
  );
}

/** Which install instructions apply to the visitor's browser */
export function detectInstallPlatform(): InstallPlatform {
  const userAgent = navigator.userAgent;
  const isIPad = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  if (isIPad || /iPhone|iPad|iPod/.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  if (/Firefox\//.test(userAgent)) return "desktop-other";
  if (/Chrome\/|Chromium\/|Edg\//.test(userAgent)) return "desktop-chromium";
  if (/Macintosh/.test(userAgent) && /Safari\//.test(userAgent))
    return "mac-safari";
  return "desktop-other";
}
