import { useState, useEffect } from "react";

interface DownloadInfo {
  url: string;
  filename: string;
  version: string;
  size?: string;
}

type Platform = "mac" | "windows" | "linux" | "unknown";

// Your Supabase project URL - update this
const SUPABASE_URL = "https://your-project.supabase.co";
const BUCKET_NAME = "releases";

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
  return "unknown";
}

type KnownPlatform = "mac" | "windows" | "linux";

interface LatestRelease {
  version: string;
  assets: Partial<Record<KnownPlatform, { filename: string }>>;
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
          `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/latest.json`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch release info");
        }

        const release: LatestRelease = await response.json();
        const version = release.version;

        const downloads: Record<Platform, DownloadInfo | null> = {
          mac: null,
          windows: null,
          linux: null,
          unknown: null,
        };

        const platforms: KnownPlatform[] = ["mac", "windows", "linux"];

        for (const p of platforms) {
          const asset = release.assets[p];
          if (asset) {
            downloads[p] = {
              url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${version}/${encodeURIComponent(asset.filename)}`,
              filename: asset.filename,
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
