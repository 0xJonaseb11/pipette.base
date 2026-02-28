import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${process.env.PORT || 3000}`);

const titleTemplate = "%s | Pipette";
const siteName = "Pipette";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/logo.svg",
  keywords,
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
  keywords?: string[];
}): Metadata => {
  const imageUrl = `${baseUrl.replace(/\/$/, "")}${imageRelativePath}`;
  const defaultKeywords = ["Base Sepolia", "testnet ETH", "faucet", "African Web3", "Base", "Ethereum", "developer"];
  const keywordsList = keywords ?? defaultKeywords;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    keywords: keywordsList,
    applicationName: siteName,
    openGraph: {
      type: "website",
      siteName,
      title: {
        default: title,
        template: titleTemplate,
      },
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: title,
        template: titleTemplate,
      },
      description,
      images: [imageUrl],
    },
    icons: {
      icon: [{ url: "/favicon.svg", sizes: "32x32", type: "image/svg+xml" }],
    },
    robots: {
      index: true,
      follow: true,
    },
    manifest: "/manifest.json",
  };
};
