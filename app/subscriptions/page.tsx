"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { apiFetch } from '@/lib/api'
import { AppHeader } from '@/components/app-header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Bell, Calendar, Phone, Eye, RefreshCw } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import Swal from "sweetalert2"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.min.css"
import "./flatpickr-custom.css"
import { Thai } from "flatpickr/dist/l10n/th"

interface Subscription {
  id: number
  expiry_date: string
  alert_date: string
  payment_due_date: string
  program_name: string
  sub_name: string
  contact_name: string
  phone: string
  company_name: string
  description: string
  status: string
  renewed_months?: number
}

export default function SubscriptionsPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Array<{code: string, name: string}>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState({
    expiry_date: '',
    alert_date: '',
    payment_due_date: '',
    program_name: '',
    sub_name: '',
    contact_name: '',
    phone: '',
    company_name: '',
    description: '',
    status: 'renewed',
    renewed_months: 0
  })

  // Refs for flatpickr instances
  const expiryDateRef = useRef<HTMLInputElement>(null)
  const alertDateRef = useRef<HTMLInputElement>(null)
  const expiryPickerRef = useRef<flatpickr.Instance | null>(null)

  // Helper functions for date formatting
  const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateToYYYYMMDD = (ddmmyyyy: string) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  useEffect(() => {
    if (isLoading) return // รอจนโหลดเสร็จก่อน
    
    if (!user) {
      router.push("/")
      return
    }
    
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [user, router, isLoading])

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSubscriptions()
      fetchCompanies()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    try {
      const response = await apiFetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await apiFetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        // Map company data to dropdown format
        const mappedData = data.map((company: any) => ({
          code: company.company_code || company.id,
          name: company.company_name
        }))
        setCompanies(mappedData)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const openDialog = (subscription?: Subscription) => {
    if (subscription) {
      setEditingSubscription(subscription)
      setFormData({
        expiry_date: subscription.expiry_date?.split('T')[0] || '',
        alert_date: subscription.alert_date?.split('T')[0] || '',
        payment_due_date: subscription.payment_due_date?.split('T')[0] || '',
        program_name: subscription.program_name || '',
        sub_name: subscription.sub_name || '',
        contact_name: subscription.contact_name || '',
        phone: subscription.phone || '',
        company_name: subscription.company_name || '',
        description: subscription.description || '',
        status: subscription.status || 'renewed',
        renewed_months: subscription.renewed_months || 0
      })
    } else {
      setEditingSubscription(null)
      setFormData({
        expiry_date: '',
        alert_date: '',
        payment_due_date: '',
        program_name: '',
        sub_name: '',
        contact_name: '',
        phone: '',
        company_name: '',
        description: '',
        status: 'renewed',
        renewed_months: 0
      })
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingSubscription(null)
    // Destroy flatpickr instances
    if (expiryPickerRef.current) {
      expiryPickerRef.current.destroy()
      expiryPickerRef.current = null
    }
  }

  const openViewDialog = (subscription: Subscription) => {
    setViewingSubscription(subscription)
    setIsViewDialogOpen(true)
  }

  // Initialize flatpickr when dialog opens
  useEffect(() => {
    if (!isDialogOpen) return

    const timer = setTimeout(() => {
      if (expiryDateRef.current && !expiryPickerRef.current) {
        // Expiry date picker
        expiryPickerRef.current = flatpickr(expiryDateRef.current, {
          dateFormat: "d/m/Y",
          locale: Thai,
          allowInput: true,
          clickOpens: true,
          altInput: false,
          static: true,
          disableMobile: true,
          parseDate: (datestr) => {
            // Parse Thai date format DD/MM/YYYY
            const parts = datestr.split('/')
            if (parts.length === 3) {
              return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
            }
            return new Date(datestr)
          },
          onChange: (selectedDates) => {
            if (selectedDates.length > 0) {
              const selected = selectedDates[0]
              const isoDate = selected.toISOString().split('T')[0]
              
              // Calculate alert date (-20 days)
              const alertDate = new Date(selected)
              alertDate.setDate(alertDate.getDate() - 20)
              const alertIso = alertDate.toISOString().split('T')[0]
              
              setFormData(prev => ({
                ...prev,
                expiry_date: isoDate,
                alert_date: alertIso,
                payment_due_date: alertIso
              }))

              // Update alert date display
              if (alertDateRef.current) {
                alertDateRef.current.value = formatDateToDDMMYYYY(alertIso)
              }
            }
          }
        })

        // Set initial value if editing
        if (formData.expiry_date) {
          expiryPickerRef.current.setDate(formData.expiry_date, false)
        }
      }

      // Update alert date display
      if (formData.alert_date && alertDateRef.current) {
        alertDateRef.current.value = formatDateToDDMMYYYY(formData.alert_date)
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      if (expiryPickerRef.current) {
        expiryPickerRef.current.destroy()
        expiryPickerRef.current = null
      }
    }
  }, [isDialogOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.expiry_date || !formData.program_name || !formData.contact_name || !formData.payment_due_date) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        text: 'ต้องกรอก: วันหมดอายุ, ชื่อโปรแกรม, ผู้ติดต่อ, และกำหนดชำระ',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    try {
      const url = editingSubscription 
        ? `/api/subscriptions?id=${editingSubscription.id}`
        : '/api/subscriptions'
      
      const method = editingSubscription ? 'PUT' : 'POST'

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: editingSubscription ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        })
        closeDialog()
        fetchSubscriptions()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Submit error:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้',
        confirmButtonText: 'ตกลง'
      })
    }
  }

  const handleRenewStatus = async (subscription: Subscription) => {
    const result = await Swal.fire({
      title: 'ตัวเลือกการต่ออายุ',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 16px;"><strong>${subscription.program_name}</strong></p>
          <p style="color: #666;">กรุณาเลือกสถานะสำหรับ License นี้:</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'ต่ออายุแล้ว',
      denyButtonText: 'ยังไม่ได้ต่ออายุ',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#f59e0b'
    })

    if (result.isConfirmed) {
      // ถ้าเลือกต่ออายุแล้ว ให้เลือกระยะเวลา
      const periodResult = await Swal.fire({
        title: 'ต่ออายุกี่เดือน?',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 16px;"><strong>${subscription.program_name}</strong></p>
            <p style="color: #666; margin-bottom: 12px;">เลือกระยะเวลาที่ต่ออายุ:</p>
          </div>
        `,
        icon: 'question',
        input: 'select',
        inputOptions: {
          '1': '1 เดือน',
          '2': '2 เดือน',
          '3': '3 เดือน',
          '6': '6 เดือน',
          '12': '1 ปี (12 เดือน)',
          'custom': 'ระบุเอง'
        },
        inputPlaceholder: 'เลือกระยะเวลา',
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#10b981',
        inputValidator: (value) => {
          if (!value) {
            return 'กรุณาเลือกระยะเวลา!'
          }
        }
      })

      if (periodResult.isConfirmed) {
        let months = 0

        if (periodResult.value === 'custom') {
          // ให้ผู้ใช้ระบุจำนวนเดือนเอง
          const customResult = await Swal.fire({
            title: 'ระบุจำนวนเดือน',
            input: 'number',
            inputLabel: 'จำนวนเดือนที่ต่ออายุ',
            inputPlaceholder: 'กรอกจำนวนเดือน (เช่น 6)',
            inputAttributes: {
              min: '1',
              max: '120',
              step: '1'
            },
            inputValue: '1',
            showCancelButton: true,
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            inputValidator: (value) => {
              if (!value || parseInt(value) <= 0) {
                return 'กรุณากรอกจำนวนเดือนที่มากกว่า 0!'
              }
              if (parseInt(value) > 120) {
                return 'จำนวนเดือนต้องไม่เกิน 120 เดือน (10 ปี)'
              }
            }
          })

          if (!customResult.isConfirmed) return
          months = parseInt(customResult.value)
        } else {
          months = parseInt(periodResult.value)
        }

        // คำนวณวันหมดอายุใหม่
        const currentExpiryDate = new Date(subscription.expiry_date)
        const newExpiryDate = new Date(currentExpiryDate)
        newExpiryDate.setMonth(newExpiryDate.getMonth() + months)

        // คำนวณวันแจ้งเตือนใหม่ (-20 วัน)
        const newAlertDate = new Date(newExpiryDate)
        newAlertDate.setDate(newAlertDate.getDate() - 20)

        try {
          const response = await apiFetch(`/api/subscriptions?id=${subscription.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expiry_date: newExpiryDate.toISOString().split('T')[0],
              alert_date: newAlertDate.toISOString().split('T')[0],
              payment_due_date: newAlertDate.toISOString().split('T')[0],
              program_name: subscription.program_name,
              sub_name: subscription.sub_name,
              contact_name: subscription.contact_name,
              phone: subscription.phone,
              company_name: subscription.company_name,
              description: subscription.description,
              status: 'renewed',
              renewed_months: months
            })
          })

          if (response.ok) {
            await Swal.fire({
              icon: 'success',
              title: 'ต่ออายุเรียบร้อย!',
              html: `
                <p>ต่ออายุ <strong>${months}</strong> เดือนเรียบร้อยแล้ว</p>
                <p style="color: #666; margin-top: 8px;">วันหมดอายุใหม่: ${formatDate(newExpiryDate.toISOString())}</p>
              `,
              timer: 2000,
              showConfirmButton: false
            })
            fetchSubscriptions()
          } else {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update')
          }
        } catch (error) {
          console.error('Renew error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: `ไม่สามารถอัปเดตสถานะได้: ${errorMessage}`,
            confirmButtonText: 'ตกลง'
          })
        }
      }
    } else if (result.isDenied) {
      // ถ้าเลือกยังไม่ได้ต่ออายุ
      try {
        const response = await apiFetch(`/api/subscriptions?id=${subscription.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expiry_date: subscription.expiry_date.split('T')[0],
            alert_date: subscription.alert_date.split('T')[0],
            payment_due_date: subscription.payment_due_date.split('T')[0],
            program_name: subscription.program_name,
            sub_name: subscription.sub_name,
            contact_name: subscription.contact_name,
            phone: subscription.phone,
            company_name: subscription.company_name,
            description: subscription.description,
            status: 'pending',
            renewed_months: subscription.renewed_months || 0
          })
        })

        if (response.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'อัปเดตสถานะเรียบร้อย',
            text: 'เปลี่ยนเป็นยังไม่ได้ต่ออายุ',
            timer: 1500,
            showConfirmButton: false
          })
          fetchSubscriptions()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอัปเดตสถานะได้',
          confirmButtonText: 'ตกลง'
        })
      }
    }
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบข้อมูลนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      try {
        const response = await apiFetch(`/api/subscriptions?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลเรียบร้อย',
            timer: 1500,
            showConfirmButton: false
          })
          fetchSubscriptions()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบข้อมูลได้',
          confirmButtonText: 'ตกลง'
        })
      }
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate)
    if (days < 0) {
      return <Badge variant="destructive">หมดอายุแล้ว</Badge>
    } else if (days <= 7) {
      return <Badge className="bg-red-500">เหลือ {days} วัน</Badge>
    } else if (days <= 30) {
      return <Badge className="bg-orange-500">เหลือ {days} วัน</Badge>
    } else if (days <= 60) {
      return <Badge className="bg-yellow-500">เหลือ {days} วัน</Badge>
    } else {
      return <Badge className="bg-green-500">เหลือ {days} วัน</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">รายการ License</h2>
            <p className="text-sm text-muted-foreground">จัดการและติดตามการหมดอายุของ License</p>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่ม License
          </Button>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{subscription.program_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subscription.sub_name}</p>
                  </div>
                  {getStatusBadge(subscription.expiry_date)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">วันหมดอายุ</p>
                      <p className="font-medium">{formatDate(subscription.expiry_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">ผู้ติดต่อ</p>
                      <p className="font-medium">{subscription.contact_name}</p>
                      <p className="text-xs text-muted-foreground">{subscription.phone}</p>
                    </div>
                  </div>

                  {subscription.company_name && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">บริษัท</p>
                      <p className="font-medium">{subscription.company_name}</p>
                    </div>
                  )}

                  {subscription.description && (
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">รายละเอียด</p>
                      <p className="text-sm line-clamp-2">{subscription.description}</p>
                    </div>
                  )}

                  {/* ปุ่มต่ออายุ (แสดงเมื่อวันเหลือ < 20) */}
                  {getDaysUntilExpiry(subscription.expiry_date) >= 0 && getDaysUntilExpiry(subscription.expiry_date) < 20 && (
                    <div className="mb-2">
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        size="sm"
                        onClick={() => handleRenewStatus(subscription)}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        ตัวเลือกการต่ออายุ
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openViewDialog(subscription)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      ดู
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDialog(subscription)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      แก้ไข
                    </Button> */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subscription.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีข้อมูล License</p>
              <Button onClick={() => openDialog()} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                เพิ่ม License
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? 'แก้ไขข้อมูล License' : 'เพิ่ม License ใหม่'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program_name">ชื่อโปรแกรม *</Label>
                <Input
                  id="program_name"
                  value={formData.program_name}
                  onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub_name">Supplier</Label>
                <Input
                  id="sub_name"
                  value={formData.sub_name}
                  onChange={(e) => setFormData({ ...formData, sub_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry_date">วันหมดอายุ *</Label>
                <Input
                  ref={expiryDateRef}
                  id="expiry_date"
                  type="text"
                  placeholder="เลือกวันที่"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert_date">วันแจ้งเตือน</Label>
                <Input
                  ref={alertDateRef}
                  id="alert_date"
                  type="text"
                  placeholder="อัตโนมัติ -20 วัน"
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_due_date">กำหนดชำระ *</Label>
                <Input
                  id="payment_due_date"
                  type="text"
                  value={formatDateToDDMMYYYY(formData.payment_due_date)}
                  placeholder="อัตโนมัติจากวันแจ้งเตือน"
                  readOnly
                  className="bg-gray-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_name">ผู้ติดต่อ *</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">บริษัท</Label>
              <Select
                value={formData.company_name}
                onValueChange={(value) => setFormData({ ...formData, company_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.code} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingSubscription ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              รายละเอียด License
            </DialogTitle>
          </DialogHeader>
          {viewingSubscription && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{viewingSubscription.program_name}</h3>
                  {viewingSubscription.sub_name && (
                    <p className="text-muted-foreground">{viewingSubscription.sub_name}</p>
                  )}
                </div>
                {getStatusBadge(viewingSubscription.expiry_date)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* วันหมดอายุ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">วันหมดอายุ</span>
                  </div>
                  <p className="text-lg font-medium pl-6">{formatDate(viewingSubscription.expiry_date)}</p>
                </div>

                {/* วันแจ้งเตือน */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bell className="h-4 w-4" />
                    <span className="font-semibold">วันแจ้งเตือน</span>
                  </div>
                  <p className="text-lg font-medium pl-6">{formatDate(viewingSubscription.alert_date)}</p>
                </div>

                {/* กำหนดชำระ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">กำหนดชำระ</span>
                  </div>
                  <p className="text-lg font-medium pl-6">{formatDate(viewingSubscription.payment_due_date)}</p>
                </div>

                {/* ผู้ติดต่อ */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">ผู้ติดต่อ</span>
                  </div>
                  <p className="text-lg font-medium pl-6">{viewingSubscription.contact_name}</p>
                  {viewingSubscription.phone && (
                    <p className="text-sm text-muted-foreground pl-6">{viewingSubscription.phone}</p>
                  )}
                </div>
              </div>

              {/* บริษัท */}
              {viewingSubscription.company_name && (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">บริษัท</span>
                  <p className="text-lg font-medium">{viewingSubscription.company_name}</p>
                </div>
              )}

              {/* รายละเอียด */}
              {viewingSubscription.description && (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">รายละเอียดเพิ่มเติม</span>
                  <p className="text-base bg-gray-50 p-4 rounded-md">{viewingSubscription.description}</p>
                </div>
              )}

              {/* Days remaining info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">สถานะ:</span> {getDaysUntilExpiry(viewingSubscription.expiry_date) < 0 
                    ? 'หมดอายุแล้ว'
                    : `เหลืออีก ${getDaysUntilExpiry(viewingSubscription.expiry_date)} วัน`
                  }
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              ปิด
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (viewingSubscription) {
                openDialog(viewingSubscription)
              }
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
