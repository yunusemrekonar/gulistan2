import './globals.css'

export const metadata = {
  title: '💞',
  description: 'Ilk Dogum Gunumuz',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
