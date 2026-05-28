import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '優波韓式泡菜訂單計算機',
  description: '線上泡菜訂單計算工具，支援 LINE LIFF 集成',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
