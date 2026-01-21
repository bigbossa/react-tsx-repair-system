'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, ChevronDown, Monitor, Users, BarChart3, Home, Copy, Shield } from 'lucide-react'

export function AppHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) return null

  return (
    <header className="bg-white border-b w-full">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border-2 hover:bg-gray-100 hover:border-gray-400 transition-all shrink-0"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 mt-2 shadow-lg border-2"
              sideOffset={5}
            >
              {user.role === "admin" ? (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    เมนูผู้ดูแลระบบ
                  </div>
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer py-3 px-3 hover:bg-gray-50 focus:bg-gray-50"
                  >
                    <Home className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="text-base">หน้าแรก</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/assets')}
                    className="cursor-pointer py-3 px-3 hover:bg-blue-50 focus:bg-blue-50"
                  >
                    <Monitor className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="text-base">จัดการทรัพย์สิน</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/duplicate-assets')}
                    className="cursor-pointer py-3 px-3 hover:bg-orange-50 focus:bg-orange-50"
                  >
                    <Copy className="h-5 w-5 mr-3 text-orange-600" />
                    <span className="text-base">ทรัพย์สินที่ซ้ำ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/users')}
                    className="cursor-pointer py-3 px-3 hover:bg-green-50 focus:bg-green-50"
                  >
                    <Users className="h-5 w-5 mr-3 text-green-600" />
                    <span className="text-base">จัดการผู้ใช้</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/admin-permissions')}
                    className="cursor-pointer py-3 px-3 hover:bg-cyan-50 focus:bg-cyan-50"
                  >
                    <Shield className="h-5 w-5 mr-3 text-cyan-600" />
                    <span className="text-base">สิทธิ์ Admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/devices')}
                    className="cursor-pointer py-3 px-3 hover:bg-orange-50 focus:bg-orange-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span className="text-base">จัดการอุปกรณ์เบิกจ่าย</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/subscriptions')}
                    className="cursor-pointer py-3 px-3 hover:bg-yellow-50 focus:bg-yellow-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                    </svg>
                    <span className="text-base">แจ้งเตือนค่า License</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/sites')}
                    className="cursor-pointer py-3 px-3 hover:bg-indigo-50 focus:bg-indigo-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span className="text-base">ตั้งค่าระบบ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/checklist')}
                    className="cursor-pointer py-3 px-3 hover:bg-pink-50 focus:bg-pink-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span className="text-base">MA Checklist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/report')}
                    className="cursor-pointer py-3 px-3 hover:bg-purple-50 focus:bg-purple-50"
                  >
                    <BarChart3 className="h-5 w-5 mr-3 text-purple-600" />
                    <span className="text-base">Dashboard</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    เมนูผู้ใช้งาน
                  </div>
                  <DropdownMenuItem 
                    onClick={() => router.push('/my-assets')}
                    className="cursor-pointer py-3 px-3 hover:bg-blue-50 focus:bg-blue-50"
                  >
                    <Monitor className="h-5 w-5 mr-3 text-blue-600" />
                    <span className="text-base">ทรัพย์สินของคุณ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer py-3 px-3 hover:bg-purple-50 focus:bg-purple-50"
                  >
                    <BarChart3 className="h-5 w-5 mr-3 text-purple-600" />
                    <span className="text-base">Dashboard</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="min-w-0 flex-1 sm:flex-initial">
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold truncate">ระบบบำรุงรักษา</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              {user.role === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-sm">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.department} | {user.site}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 text-sm">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
