import './admin.css'

export const metadata = {
  title: 'Admin Dashboard — Mouse Trap News',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
