import type { Metadata } from "next";
import "./globals.css";
import SupportWidget from "@/components/support-widget";
import CookieSettings from "@/components/cookie-settings";

export const metadata: Metadata = {
  title: "A&G PUBLICATION",
  description:
    "A&G Publication — Publishing stories, ideas and voices that deserve to be heard.",

  icons: {
    icon: "/ag-logo.png",
    shortcut: "/ag-logo.png",
    apple: "/ag-logo.png",
  },

  openGraph: {
    title: "A&G PUBLICATION",
    description:
      "A&G Publication — Publishing stories, ideas and voices that deserve to be heard.",
    siteName: "A&G PUBLICATION",
    type: "website",
    images: [
      {
        url: "/ag-logo.png",
        width: 512,
        height: 512,
        alt: "A&G PUBLICATION",
      },
    ],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "A&G PUBLICATION",
  url: "https://ag-publication.vercel.app/",
  logo: "https://ag-publication.vercel.app/ag-logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>

      <body>
        {children}

        {/* Global A&G Help Center */}
        <SupportWidget />

        {/* Global Cookie Settings */}
        <CookieSettings />
      </body>
    </html>
  );
}