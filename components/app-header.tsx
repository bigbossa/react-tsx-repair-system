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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Menu, ChevronDown, ChevronRight, Monitor, Users, BarChart3, Home, Copy, Shield, Bell, CheckSquare, Building2, Package, UserMinus, FileQuestion, Key, Wrench } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Swal from 'sweetalert2'

export function AppHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Collapsible menu states
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Change password states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'รหัสผ่านใหม่ไม่ตรงกัน',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    if (newPassword.length < 4) {
      await Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await apiFetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: user.username,
          oldPassword,
          newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง'
        })
        setIsChangePasswordOpen(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: result.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error('Change password error:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) return null

  return (
    <>
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
                    {/* Dashboard */}
                  <DropdownMenuItem 
                    onClick={() => router.push('/report')}
                    className="cursor-pointer py-3 px-3 hover:bg-indigo-50 focus:bg-indigo-50"
                  >
                    <BarChart3 className="h-5 w-5 mr-3 text-indigo-600" />
                    <span className="text-base">Dashboard</span>
                  </DropdownMenuItem>
                  {/* หน้าแรก */}
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')}
                    className="cursor-pointer py-3 px-3 hover:bg-gray-50 focus:bg-gray-50"
                  >
                   <Wrench className="h-5 w-5 mr-3 text-gray-600" />
                    <span className="text-base">แจ้งซ่อม</span>
                  </DropdownMenuItem>
                                    {/* MA Checklist */}
                  <DropdownMenuItem 
                    onClick={() => router.push('/checklist')}
                    className="cursor-pointer py-3 px-3 hover:bg-pink-50 focus:bg-pink-50"
                  >
                    <CheckSquare className="h-5 w-5 mr-3 text-pink-600" />
                    <span className="text-base">MA Checklist</span>
                  </DropdownMenuItem>
                                    {/* แจ้งเตือน License */}
                  <DropdownMenuItem 
                    onClick={() => router.push('/subscriptions')}
                    className="cursor-pointer py-3 px-3 hover:bg-yellow-50 focus:bg-yellow-50"
                  >
                    <Bell className="h-5 w-5 mr-3 text-yellow-600" />
                    <span className="text-base">แจ้งเตือนค่า License</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuSeparator />
                  
                  {/* จัดการทรัพย์สิน - Collapsible */}
                  <Collapsible open={assetsOpen} onOpenChange={setAssetsOpen}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between px-2 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded cursor-pointer">
                        <span>จัดการทรัพย์สิน</span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${assetsOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <DropdownMenuItem 
                        onClick={() => router.push('/assets')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-blue-50 focus:bg-blue-50"
                      >
                        <Monitor className="h-4 w-4 mr-3 text-blue-600" />
                        <span className="text-sm">จัดการทรัพย์สิน</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/assets-without-users')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-blue-50 focus:bg-blue-50"
                      >
                        <UserMinus className="h-4 w-4 mr-3 text-blue-600" />
                        <span className="text-sm">ทรัพย์สินที่ไม่มีผู้ใช้งาน</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/duplicate-assets')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-blue-50 focus:bg-blue-50"
                      >
                        <Copy className="h-4 w-4 mr-3 text-blue-600" />
                        <span className="text-sm">ทรัพย์สินที่ซ้ำกัน</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/assets-without-code')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-blue-50 focus:bg-blue-50"
                      >
                        <FileQuestion className="h-4 w-4 mr-3 text-blue-600" />
                        <span className="text-sm">ทรัพย์สินที่ไม่มีรหัสทรัพย์สิน</span>
                      </DropdownMenuItem>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <DropdownMenuSeparator />
                  
                  {/* ผู้ใช้งาน - Collapsible */}
                  <Collapsible open={usersOpen} onOpenChange={setUsersOpen}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between px-2 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded cursor-pointer">
                        <span>ผู้ใช้งาน</span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${usersOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <DropdownMenuItem 
                        onClick={() => router.push('/users')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-green-50 focus:bg-green-50"
                      >
                        <Users className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">จัดการผู้ใช้</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/admin-permissions')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-green-50 focus:bg-green-50"
                      >
                        <Shield className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">สิทธิ์ Admin</span>
                      </DropdownMenuItem>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuSeparator />
                  
                  {/* ตั้งค่าระบบ - Collapsible */}
                  <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between px-2 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded cursor-pointer">
                        <span>ตั้งค่าระบบ</span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <DropdownMenuItem 
                        onClick={() => router.push('/sites')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-purple-50 focus:bg-purple-50"
                      >
                        <Building2 className="h-4 w-4 mr-3 text-purple-600" />
                        <span className="text-sm">จัดการสาขา/แผนก</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push('/devices')}
                        className="cursor-pointer py-2.5 px-3 pl-8 hover:bg-purple-50 focus:bg-purple-50"
                      >
                        <Package className="h-4 w-4 mr-3 text-purple-600" />
                        <span className="text-sm">จัดการอุปกรณ์เบิกจ่าย</span>
                      </DropdownMenuItem>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <DropdownMenuSeparator />
                  

                  

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
              <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer text-sm">
                <Key className="h-4 w-4 mr-2" />
                เปลี่ยนรหัสผ่าน
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 text-sm">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    {/* Change Password Dialog */}
    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">รหัสผ่านเดิม</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="กรุณากรอกรหัสผ่านเดิม"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="กรุณากรอกรหัสผ่านใหม่"
                  minLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="กรุณากรอกรหัสผ่านใหม่อีกครั้ง"
                  minLength={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsChangePasswordOpen(false)
                  setOldPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                }}
                disabled={isChangingPassword}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
