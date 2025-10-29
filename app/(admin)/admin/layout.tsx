import { requireRole } from '@/lib/auth/require-auth'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole('admin')

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}
