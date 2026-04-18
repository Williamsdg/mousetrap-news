export const metadata = {
  title: 'Mouse Trap News Studio',
  description: 'Content management for Mouse Trap News',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
