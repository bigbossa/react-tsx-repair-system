"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { apiFetch } from '@/lib/api'
import { AdminDashboard } from "@/components/admin-dashboard"
import { UserDashboard } from "@/components/user-dashboard"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useRef, Suspense } from "react"
import Swal from "sweetalert2"

function Dashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
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
        const response = await apiFetch('/api/subscriptions')
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
            const response = await apiFetch(`/api/tickets/${ticketId}`, {
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
            const response = await apiFetch(`/api/tickets/${ticketId}`, {
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
      const response = await apiFetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: user.id,
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
      <AppHeader />

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

export default function DashboardWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}
