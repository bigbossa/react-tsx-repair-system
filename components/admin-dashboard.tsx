"use client"

import { useEffect, useState } from "react"
import type { Ticket } from "@/lib/types"
import { TicketCard } from "./ticket-card"
import { TicketDetail } from "./ticket-detail"
import { UserTicketForm } from "./user-ticket-form"
import { EditTicketDialog } from "./edit-ticket-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Plus, ChevronLeft, ChevronRight, Bell, AlertCircle } from "lucide-react"
import { useAuth } from "@/app/auth-context"
import Swal from "sweetalert2"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [expiringLicensesCount, setExpiringLicensesCount] = useState(0)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)
  const [editingTicket, setEditingTicket] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchTickets()
    checkExpiringLicenses()
  }, [])

  const checkExpiringLicenses = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (!response.ok) return

      const subscriptions = await response.json()
      const today = new Date()
      const expiring = subscriptions.filter((sub: any) => {
        const expiryDate = new Date(sub.expiry_date)
        const diffTime = expiryDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays < 20 // เหลือน้อยกว่า 20 วัน
      })
      setExpiringLicensesCount(expiring.length)
    } catch (error) {
      console.error('Error checking licenses:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets")
      const data = await response.json()
      setTickets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTicket = async (data: any) => {
    setIsCreatingTicket(true)
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'สร้างคำขอเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          timer: 2000
        })
        await fetchTickets()
        setShowCreateForm(false)
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถสร้างคำขอได้',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error("Failed to create ticket:", error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsCreatingTicket(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return

    // Get current and new status text
    const statusText = {
      0: "รอดำเนินการ",
      1: "กำลังดำเนินการ",
      2: "เสร็จสิ้น",
      3: "ยกเลิก",
      4: "รอการประเมิน",
    }
    
    const Swal = (await import('sweetalert2')).default
    
    const result = await Swal.fire({
      title: 'ยืนยันการเปลี่ยนสถานะ?',
      html: `เปลี่ยนสถานะเป็น: <strong>${statusText[status]}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    })
    
    if (!result.isConfirmed) return

    setIsUpdating(true)
    try {
      // Auto-set start_repair if status is 1 (in progress)
      // Auto-set finish_repair if status is 2 (completed) or 3 (cancelled)
      const updateData: any = { status }
      
      if (status === '1' && !selectedTicket.start_repair) {
        updateData.start_repair = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', ' ')
      }
      
      if ((status === '2' || status === '3') && !selectedTicket.finish_repair) {
        updateData.finish_repair = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', ' ')
      }

      // Auto-calculate total_date when setting finish_repair
      if ((status === '2' || status === '3')) {
        const startRepair = selectedTicket.start_repair || selectedTicket[' start_repair']
        if (startRepair && startRepair.trim() !== '') {
          const start = new Date(startRepair)
          const finish = updateData.finish_repair ? new Date(updateData.finish_repair) : new Date()
          const diffTime = Math.abs(finish.getTime() - start.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          updateData.total_date = `${diffDays} วัน`
        }
      }

      const response = await fetch(`/api/tickets/${selectedTicket.request_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedTicket = await response.json()
        setSelectedTicket(updatedTicket)
        setTickets(tickets.map((t) => (t.request_id === updatedTicket.request_id ? updatedTicket : t)))
        await fetchTickets() // Refresh the list
        
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัปเดตสถานะเรียบร้อยแล้ว',
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorData.error || 'ไม่สามารถอัปเดตสถานะได้',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error("Failed to update ticket:", error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      (ticket.asset_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.request_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || ticket.Status === Number(filterStatus)
    const matchesTab = activeTab === "pending"
      ? ticket.Status === 0
      : activeTab === "active" 
      ? ticket.Status === 1 && (ticket.finish_with === user?.name || ticket.finish_with === user?.username)
      : activeTab === "assessment"
      ? ticket.Status === 4 && (ticket.finish_with === user?.name || ticket.finish_with === user?.username)
      : (ticket.Status === 2 || ticket.Status === 3) && (ticket.finish_with === user?.name || ticket.finish_with === user?.username)
    return matchesSearch && matchesStatus && matchesTab
  })

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.Status === 0).length,
    inProgress: tickets.filter((t) => t.Status === 1).length,
    completed: tickets.filter((t) => t.Status === 2).length,
    cancelled: tickets.filter((t) => t.Status === 3).length,
    assessment: tickets.filter((t) => t.Status === 4).length,
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* License Expiry Alert */}
      {expiringLicensesCount > 0 && (
        <Alert 
          className="bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
          onClick={() => router.push('/subscriptions')}
        >
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-900">
                แจ้งเตือน: มี License {expiringLicensesCount} รายการที่ใกล้หมดอายุ (เหลือน้อยกว่า 10 วัน)
              </span>
            </div>
            <span className="text-sm text-orange-700 hover:underline">
              คลิกเพื่อดูรายละเอียด →
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button 
          variant="default" 
          className="gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4" />
          สร้างคำขอใหม่
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">จำนวนคำขอทั้งหมด</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">รอดำเนินการ</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">กำลังดำเนินการ</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.inProgress}</p>
        </div>
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">รอการประเมิน</p>
          <p className="text-xl sm:text-2xl font-bold text-orange-700">{stats.assessment}</p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">เสร็จสิ้น</p>
          <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">ยกเลิก</p>
          <p className="text-xl sm:text-2xl font-bold text-red-700">{stats.cancelled}</p>
        </div>

      </div>

      {/* Tab Buttons */}
      <div className="border-b overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 sm:gap-2 min-w-max">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 hover:scale-105 active:scale-95 ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            รอดำเนินการ ({tickets.filter(t => t.Status === 0).length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 hover:scale-105 active:scale-95 ${
              activeTab === "active"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            กำลังดำเนินการ ({tickets.filter(t => t.Status === 1 && (t.finish_with === user?.name || t.finish_with === user?.username)).length})
          </button>
          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 hover:scale-105 active:scale-95 ${
              activeTab === "assessment"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            รอการประเมิน ({tickets.filter(t => t.Status === 4 && (t.finish_with === user?.name || t.finish_with === user?.username)).length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-base whitespace-nowrap transition-all duration-200 border-b-2 hover:scale-105 active:scale-95 ${
              activeTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            เสร็จสิ้น/ยกเลิก ({tickets.filter(t => (t.Status === 2 || t.Status === 3) && (t.finish_with === user?.name || t.finish_with === user?.username)).length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Input
          placeholder="ค้นหา..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="flex-1 text-sm"
        />
        <Select value={filterStatus} onValueChange={(value) => {
          setFilterStatus(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full sm:w-[140px] text-sm">
            <SelectValue placeholder="สถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สถานะทั้งหมด</SelectItem>
            {activeTab === "pending" ? (
              <>
                <SelectItem value="0">รอดำเนินการ</SelectItem>
              </>
            ) : activeTab === "active" ? (
              <>
                <SelectItem value="1">กำลังดำเนินการ</SelectItem>              </>
            ) : activeTab === "assessment" ? (
              <>                <SelectItem value="4">รอการประเมิน</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="2">เสร็จสิ้น</SelectItem>
                <SelectItem value="3">ยกเลิก</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
          setItemsPerPage(Number(value))
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full sm:w-[120px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 รายการ</SelectItem>
            <SelectItem value="20">20 รายการ</SelectItem>
            <SelectItem value="30">30 รายการ</SelectItem>
            <SelectItem value="40">40 รายการ</SelectItem>
            <SelectItem value="50">50 รายการ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="space-y-3 w-full">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Loading tickets...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No tickets found</p>
        ) : (
          currentTickets.map((ticket) => (
            <div key={ticket.request_id} className="relative w-full">
              {ticket.Status === 0 && (
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 flex flex-wrap gap-1 sm:gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md text-xs sm:text-sm"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const Swal = (await import('sweetalert2')).default
                      const result = await Swal.fire({
                        title: 'รับเรื่อง?',
                        text: 'ต้องการเปลี่ยนสถานะเป็น "กำลังดำเนินการ" หรือไม่?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'รับเรื่อง',
                        cancelButtonText: 'ยกเลิก',
                        confirmButtonColor: '#2563eb',
                        cancelButtonColor: '#6b7280'
                      })
                      
                      if (result.isConfirmed) {
                        setIsUpdating(true)
                        try {
                          const updateData: any = { 
                            status: '1',
                            start_repair: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }).replace(' ', ' '),
                            finish_with: user?.name || user?.username || 'Admin'
                          }
                          
                          const response = await fetch(`/api/tickets/${ticket.request_id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updateData),
                          })

                          if (response.ok) {
                            await fetchTickets()
                            await Swal.fire({
                              icon: 'success',
                              title: 'รับเรื่องสำเร็จ!',
                              text: 'เปลี่ยนสถานะเป็น "กำลังดำเนินการ" แล้ว',
                              timer: 2000,
                              showConfirmButton: false
                            })
                          } else {
                            throw new Error('Failed to update')
                          }
                        } catch (error) {
                          await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถรับเรื่องได้',
                            confirmButtonText: 'ตกลง'
                          })
                        } finally {
                          setIsUpdating(false)
                        }
                      }
                    }}
                  >
                    รับเรื่อง
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white hover:bg-gray-50 shadow-md text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTicket(ticket)
                    }}
                  >
                    <span className="hidden xs:inline">ดู</span>รายละเอียด
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shadow-md text-xs sm:text-sm"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const Swal = (await import('sweetalert2')).default
                      const result = await Swal.fire({
                        title: 'ยกเลิกคำขอ?',
                        text: 'ต้องการยกเลิกคำขอนี้หรือไม่?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'ยกเลิกคำขอ',
                        cancelButtonText: 'ไม่ยกเลิก',
                        confirmButtonColor: '#dc2626',
                        cancelButtonColor: '#6b7280'
                      })
                      
                      if (result.isConfirmed) {
                        setIsUpdating(true)
                        try {
                          const response = await fetch(`/api/tickets/${ticket.request_id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ Status: 3, cancel_whit: user?.username }),
                          })

                          if (response.ok) {
                            await fetchTickets()
                            await Swal.fire({
                              icon: 'success',
                              title: 'ยกเลิกสำเร็จ!',
                              text: 'เปลี่ยนสถานะเป็น "ยกเลิก" แล้ว',
                              timer: 2000,
                              showConfirmButton: false
                            })
                          } else {
                            throw new Error('Failed to update')
                          }
                        } catch (error) {
                          await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถยกเลิกได้',
                            confirmButtonText: 'ตกลง'
                          })
                        } finally {
                          setIsUpdating(false)
                        }
                      }
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              )}
              {ticket.Status === 1 && (
                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white hover:bg-gray-50 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTicket(ticket)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    รายละเอียดการซ่อม
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="shadow-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTicket(ticket)
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shadow-md"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const Swal = (await import('sweetalert2')).default
                      const result = await Swal.fire({
                        title: 'ยกเลิกคำขอ?',
                        text: 'ต้องการยกเลิกคำขอนี้หรือไม่?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'ยกเลิกคำขอ',
                        cancelButtonText: 'ไม่ยกเลิก',
                        confirmButtonColor: '#dc2626',
                        cancelButtonColor: '#6b7280'
                      })
                      
                      if (result.isConfirmed) {
                        setIsUpdating(true)
                        try {
                          const response = await fetch(`/api/tickets/${ticket.request_id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ Status: 3, cancel_whit: user?.username }),
                          })

                          if (response.ok) {
                            await fetchTickets()
                            await Swal.fire({
                              icon: 'success',
                              title: 'ยกเลิกสำเร็จ!',
                              text: 'เปลี่ยนสถานะเป็น "ยกเลิก" แล้ว',
                              timer: 2000,
                              showConfirmButton: false
                            })
                          } else {
                            throw new Error('Failed to update')
                          }
                        } catch (error) {
                          await Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถยกเลิกได้',
                            confirmButtonText: 'ตกลง'
                          })
                        } finally {
                          setIsUpdating(false)
                        }
                      }
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              )}
              {(ticket.Status === 2 || ticket.Status === 3 || ticket.Status === 4) && (
                <div className="absolute bottom-4 right-4 z-10">
                  <Button
                    size="sm"
                    variant="default"
                    className="shadow-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTicket(ticket)
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                </div>
              )}
              <TicketCard ticket={ticket} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            แสดง {startIndex + 1} - {Math.min(endIndex, filteredTickets.length)} จาก {filteredTickets.length} รายการ
            {tickets.length !== filteredTickets.length && ` (กรองจากทั้งหมด ${tickets.length} รายการ)`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === totalPages || 
                         (page >= currentPage - 1 && page <= currentPage + 1)
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  </div>
                ))
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TicketDetail
              ticket={selectedTicket}
              isAdmin={true}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedTicket(null)}
              isUpdating={isUpdating}
              onUpdate={fetchTickets}
            />
          </div>
        </div>
      )}

      {/* Create Ticket Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">สร้างคำขอใหม่</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isCreatingTicket}
                >
                  ✕
                </Button>
              </div>
              <UserTicketForm 
                onSubmit={handleCreateTicket} 
                isLoading={isCreatingTicket} 
                userName={user?.name || ""} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Dialog */}
      {editingTicket && (
        <EditTicketDialog
          ticket={editingTicket}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setEditingTicket(null)
          }}
          onSuccess={fetchTickets}
        />
      )}
    </div>
  )
}
