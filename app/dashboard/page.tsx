"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserDashboard } from "@/components/user-dashboard"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, Monitor, Users, BarChart3, ChevronDown, Key } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import Swal from "sweetalert2"

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const hasShownLicenseAlert = useRef(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // ตรวจสอบ License ที่ใกล้หมดอายุ (เหลือน้อยกว่า 20 วัน)
  useEffect(() => {
    const checkExpiringLicenses = async () => {
      if (!user || user.role !== 'admin') return
      
      // ตรวจสอบว่าได้แจ้งเตือนไปแล้วในครั้งนี้หรือยัง (ใช้ useRef แทน sessionStorage)
      if (hasShownLicenseAlert.current) return
      
      try {
        const response = await fetch('/api/subscriptions')
        if (!response.ok) return

        const subscriptions = await response.json()
        const today = new Date()
        const expiringLicenses = subscriptions.filter((sub: any) => {
          const expiryDate = new Date(sub.expiry_date)
          const diffTime = expiryDate.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays >= 0 && diffDays < 10 // เหลือน้อยกว่า 10 วัน
        })

        if (expiringLicenses.length > 0) {
          const licenseList = expiringLicenses.map((sub: any) => {
            const expiryDate = new Date(sub.expiry_date)
            const diffTime = expiryDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return `<div style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">
              <strong>${sub.program_name}</strong><br/>
              <span style="color: #666;">${sub.company_name || '-'}</span><br/>
              <span style="color: ${diffDays <= 7 ? '#dc2626' : '#ea580c'}; font-weight: bold;">เหลือ ${diffDays} วัน</span>
            </div>`
          }).join('')

          await Swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือนค่า License!',
            html: `
              <div style="margin-bottom: 16px;">
                <p style="color: #666;">มี License ${expiringLicenses.length} รายการที่ใกล้หมดอายุ (เหลือน้อยกว่า 10 วัน)</p>
              </div>
              <div style="max-height: 300px; overflow-y: auto; text-align: left;">
                ${licenseList}
              </div>
            `,
            confirmButtonText: 'ดูรายละเอียด',
            confirmButtonColor: '#3b82f6',
            showCancelButton: true,
            cancelButtonText: 'ปิด',
            width: '600px'
          }).then((result) => {
            // บันทึกว่าได้แจ้งเตือนไปแล้ว (ใช้ useRef เพื่อไม่แจ้งซ้ำใน component lifecycle เดียวกัน)
            hasShownLicenseAlert.current = true
            
            if (result.isConfirmed) {
              router.push('/subscriptions')
            }
          })
        }
      } catch (error) {
        console.error('Error checking expiring licenses:', error)
      }
    }

    // ตรวจสอบหลังจาก component mount และมี user แล้ว
    if (user && !isLoading) {
      checkExpiringLicenses()
    }
  }, [user, isLoading, router])

  // จัดการเมื่อคลิกปุ่มจาก LINE
  useEffect(() => {
    const ticketId = searchParams.get('ticket')
    const action = searchParams.get('action')

    if (!ticketId || !action || user?.role !== 'admin') return

    // จัดการปุ่ม "รับงาน"
    if (action === 'accept') {
      Swal.fire({
        title: 'รับงาน',
        text: `คุณต้องการรับงาน ${ticketId} หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'รับงาน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#06C755'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // อัปเดตสถานะเป็น "กำลังดำเนินการ" (status = 1)
            const response = await fetch(`/api/tickets/${ticketId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: '1' })
            })

            if (response.ok) {
              await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'รับงานเรียบร้อยแล้ว',
                timer: 2000,
                showConfirmButton: false
              })
              // รีหน้าให้ข้อมูลล่าสุดและล้าง query params
              router.replace('/dashboard')
              window.location.reload()
            } else {
              throw new Error('Failed to update status')
            }
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถรับงานได้',
              confirmButtonText: 'ตกลง'
            })
          }
        } else {
          router.push('/dashboard')
        }
      })
    }
    
    // จัดการปุ่ม "เสร็จสิ้น"
    if (action === 'complete') {
      Swal.fire({
        title: 'เสร็จสิ้น',
        text: `คุณต้องการเปลี่ยนสถานะงาน ${ticketId} เป็น "รอการประเมิน" หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'เสร็จสิ้น',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#06C755'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // อัปเดตสถานะเป็น "รอการประเมิน" (status = 4)
            const response = await fetch(`/api/tickets/${ticketId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: '4' })
            })

            if (response.ok) {
              await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'เปลี่ยนสถานะเป็น "รอการประเมิน" แล้ว',
                timer: 2000,
                showConfirmButton: false
              })
              router.push('/dashboard')
            } else {
              throw new Error('Failed to update status')
            }
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถเปลี่ยนสถานะได้',
              confirmButtonText: 'ตกลง'
            })
          }
        } else {
          router.push('/dashboard')
        }
      })
    }
  }, [searchParams, user, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณาตรวจสอบรหัสผ่านใหม่และยืนยันรหัสผ่านให้ตรงกัน',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    if (newPassword.length < 4) {
      await Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านสั้นเกินไป',
        text: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: user.userid,
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
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: result.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
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

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
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
                      onClick={() => router.push('/assets')}
                      className="cursor-pointer py-3 px-3 hover:bg-blue-50 focus:bg-blue-50"
                    >
                      <Monitor className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-base">จัดการทรัพย์สิน</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/users')}
                      className="cursor-pointer py-3 px-3 hover:bg-green-50 focus:bg-green-50"
                    >
                      <Users className="h-5 w-5 mr-3 text-green-600" />
                      <span className="text-base">จัดการผู้ใช้</span>
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
                    {/* <DropdownMenuItem 
                      onClick={() => router.push('/company')}
                      className="cursor-pointer py-3 px-3 hover:bg-cyan-50 focus:bg-cyan-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-cyan-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M9 8h1"></path>
                        <path d="M9 12h1"></path>
                        <path d="M9 16h1"></path>
                        <path d="M14 8h1"></path>
                        <path d="M14 12h1"></path>
                        <path d="M14 16h1"></path>
                        <path d="M6 21V3h12v18"></path>
                      </svg>
                      <span className="text-base">จัดการข้อมูลบริษัท2</span>
                    </DropdownMenuItem> */}
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

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
      </main>

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
                  setOldPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                disabled={isChangingPassword}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
