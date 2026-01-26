import { useState, useEffect } from "react";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  assets: ReleaseAsset[];
}

interface DownloadInfo {
  url: string;
  filename: string;
  size: string;
  version: string;
}

type Platform = "mac" | "windows" | "linux" | "unknown";

const GITHUB_REPO = "gustavowebjs/flash-snap";

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (platform.includes("mac") || userAgent.includes("mac")) {
    return "mac";
  }
  if (platform.includes("win") || userAgent.includes("win")) {
    return "windows";
  }
  if (platform.includes("linux") || userAgent.includes("linux")) {
    return "linux";
  }
  // Default to Windows for mobile/unknown platforms
  return "windows";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function findAssetForPlatform(
  assets: ReleaseAsset[],
  platform: Platform,
): ReleaseAsset | null {
  const patterns: Record<Platform, RegExp[]> = {
    mac: [/\.dmg$/i, /darwin.*\.zip$/i, /mac.*\.zip$/i],
    windows: [/\.exe$/i, /setup.*\.exe$/i],
    linux: [/\.AppImage$/i, /\.deb$/i],
    unknown: [],
  };

  const platformPatterns = patterns[platform];

  for (const pattern of platformPatterns) {
    const asset = assets.find((a) => pattern.test(a.name));
    if (asset) return asset;
  }

  return null;
}

export function useGitHubRelease() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [allDownloads, setAllDownloads] = useState<
    Record<Platform, DownloadInfo | null>
  >({
    mac: null,
    windows: null,
    linux: null,
    unknown: null,
  });

  useEffect(() => {
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    async function fetchRelease() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch release info");
        }

        const release: Release = await response.json();
        const version = release.tag_name.replace(/^v/, "");

        const platforms: Platform[] = ["mac", "windows", "linux"];
        const downloads: Record<Platform, DownloadInfo | null> = {
          mac: null,
          windows: null,
          linux: null,
          unknown: null,
        };

        for (const p of platforms) {
          const asset = findAssetForPlatform(release.assets, p);
          if (asset) {
            downloads[p] = {
              url: asset.browser_download_url,
              filename: asset.name,
              size: formatBytes(asset.size),
              version,
            };
          }
        }

        setAllDownloads(downloads);
        setDownloadInfo(downloads[detectedPlatform]);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    }

    fetchRelease();
  }, []);

  return { loading, error, platform, downloadInfo, allDownloads };
}

export const platformNames: Record<Platform, string> = {
  mac: "macOS",
  windows: "Windows",
  linux: "Linux",
  unknown: "Your OS",
};

export const platformIcons: Record<Platform, string> = {
  mac: "🍎",
  windows: "🪟",
  linux: "🐧",
  unknown: "💻",
};
