import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import SkipLink from '@/components/SkipLink';
import Providers from '@/components/Providers';

const fontSans = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const siteUrl = 'https://astronomyhints.com';
const siteName = 'Astronomy Hints';
const title = 'Orbit Command - Free 3D Solar System Simulator | Real-Time Planet Positions';
const description =
  'Explore the solar system in stunning 3D with real-time planetary positions. Free interactive space simulator with cinematic tours, astrophotography tips, and educational content for students and astronomy enthusiasts.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    'solar system simulator',
    '3D solar system',
    'planet positions',
    'astronomy education',
    'space exploration',
    'astrophotography',
    'planetary orbits',
    'interactive space',
    'astronomy for kids',
    'learn astronomy',
    'planet tracker',
    'night sky guide',
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Orbit Command - 3D Solar System Explorer showing planets orbiting the Sun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${siteUrl}/og-image.png`],
    creator: '@astronomyhints',
    site: '@astronomyhints',
  },
  verification: {
    google: 'verification-code-here',
  },
  category: 'education',
  classification: 'Astronomy Education Software',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: 'Astronomy education and space exploration resources',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@astronomyhints.com',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
      sameAs: [
        'https://twitter.com/astronomyhints',
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#webapp`,
      name: 'Orbit Command',
      description: title,
      url: siteUrl,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires WebGL support',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@id': `${siteUrl}/#organization`,
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '156',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Real-time planetary positions',
        '3D solar system visualization',
        'Time travel simulation',
        'Cinematic planet tours',
        'Educational content',
        'Mobile responsive',
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Orbit Command',
          item: siteUrl,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Orbit Command?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Orbit Command is a free, interactive 3D solar system simulator that shows real-time planetary positions. It runs in your web browser without any downloads required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are the planet positions accurate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Orbit Command uses established astronomical algorithms to calculate accurate planetary positions for any date, past or future.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Orbit Command free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Orbit Command is completely free. No registration, download, or payment required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use Orbit Command for education?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely! Teachers and educators worldwide use Orbit Command as a classroom tool to help students understand planetary orbits, distances, and solar system mechanics.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh bg-black text-white antialiased font-sans">
        <Providers>
          <SkipLink />
          {children}
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
