'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from "@/store/authStore";
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              DSA Tracker
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/dashboard/analytics" className="text-gray-700 hover:text-blue-600">
              Analytics
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}