import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getCurrentUser } from '@/actions/auth'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
