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
    <div style={{ height: '100vh', margin: 0 }}>{children}</div>
  )
}
