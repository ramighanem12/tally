import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedLayout from './layouts/ProtectedLayout'
import { Toaster } from 'sonner'
import { DocumentRequestsProvider } from '@/contexts/DocumentRequestsContext'
import { BusinessDetailsProvider } from '@/contexts/BusinessDetailsContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Assure",
  description: "Modern Tax Advisor for Small Businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased font-sans ${inter.className}`}>
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        />
      </head>
      <body className="h-full antialiased font-sans">
        <AuthProvider>
          <BusinessDetailsProvider>
            <DocumentRequestsProvider>
              <ProtectedLayout>
                {children}
              </ProtectedLayout>
            </DocumentRequestsProvider>
          </BusinessDetailsProvider>
        </AuthProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
