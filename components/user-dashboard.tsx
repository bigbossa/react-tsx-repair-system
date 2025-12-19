"use client"

import { useEffect, useState } from "react"
import type { Ticket } from "@/lib/types"
import { UserTicketForm } from "./user-ticket-form"
import { TicketCard } from "./ticket-card"
import { TicketDetail } from "./ticket-detail"
import { useAuth } from "@/app/auth-context"
import Swal from "sweetalert2"

export function UserDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "assessment" | "completed">("active")

  useEffect(() => {
    if (user?.name) {
      fetchTickets()
    }
  }, [user?.name])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets")
      const data = await response.json()
      // Filter tickets by current user's username
      const dataArray = Array.isArray(data) ? data : []
      const userTickets = dataArray.filter((ticket: any) => ticket.username === user?.name)
      setTickets(userTickets)
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
      setTickets([])
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return

    let comment_re = ""

    // If rejecting assessment (status 0), require comment
    if (status === "0") {
      const result = await Swal.fire({
        title: 'ไม่ผ่านการประเมิน',
        text: "กรุณาระบุเหตุผลที่ไม่ผ่านการประเมิน",
        input: 'textarea',
        inputPlaceholder: 'ระบุเหตุผล...',
        inputAttributes: {
          'aria-label': 'ระบุเหตุผล'
        },
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        inputValidator: (value) => {
          if (!value) {
            return 'กรุณาระบุเหตุผล!'
          }
        }
      })

      if (!result.isConfirmed || !result.value) return
      comment_re = result.value
    } else {
      // Confirm for status 2 (completed)
      const result = await Swal.fire({
        title: 'ยืนยันการเปลี่ยนสถานะ?',
        text: "ยืนยันว่าการซ่อมเสร็จสมบูรณ์",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
      })

      if (!result.isConfirmed) return
    }

    setIsUpdating(true)
    try {
      const updateData: any = { Status: parseInt(status) }
      
      if (comment_re) {
        updateData.Comment_re = comment_re
        // Increment repair_count when rejecting assessment
        updateData.repair_count = (selectedTicket.repair_count || 0) + 1
      }

      // When approving assessment (status 2), set finish_repair and calculate total_date
      if (status === "2") {
        const currentDate = new Date().toISOString().split('T')[0]
        updateData.finish_repair = currentDate

        // Calculate total_date if start_repair exists
        const startRepair = selectedTicket.start_repair || selectedTicket[' start_repair']
        if (startRepair && startRepair.trim() !== '') {
          const start = new Date(startRepair)
          const finish = new Date(currentDate)
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
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เปลี่ยนสถานะเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          timer: 2000
        })
        await fetchTickets()
        setSelectedTicket(null)
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเปลี่ยนสถานะได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitTicket = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newTicket = await response.json()
        setTickets([newTicket, ...tickets])
        setSelectedTicket(null)
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'บันทึกคำขอซ่อมเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
          timer: 3000
        })
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อวูลได้',
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
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <UserTicketForm onSubmit={handleSubmitTicket} isLoading={isLoading} userName={user?.name || ""} userId={user?.id || ""} />
        </div>

        {/* Tickets */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">คำขอของคุณ</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "active"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  กำลังดำเนินการ ({tickets.filter(t => t.Status === 0 || t.Status === 1).length})
                </button>
                <button
                  onClick={() => setActiveTab("assessment")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "assessment"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  รอการประเมิน ({tickets.filter(t => t.Status === 4).length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "completed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  เสร็จสิ้น/ยกเลิก ({tickets.filter(t => t.Status === 2 || t.Status === 3).length})
                </button>
              </div>
            </div>
            
            {tickets.length === 0 ? (
              <p className="text-muted-foreground">ยังไม่มีคำขอ</p>
            ) : (
              <>
                {activeTab === "active" ? (
                  tickets.filter(t => t.Status === 0 || t.Status === 1).length === 0 ? (
                    <p className="text-muted-foreground">ไม่มีคำขอที่กำลังดำเนินการ</p>
                  ) : (
                    tickets
                      .filter(t => t.Status === 0 || t.Status === 1)
                      .map((ticket) => (
                        <div key={ticket.request_id} className="relative">
                          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                            <button
                              className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTicket(ticket)
                              }}
                            >
                              ดูรายละเอียด
                            </button>
                            {ticket.Status === 0 && (
                              <button
                                className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md transition-colors"
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
                                    try {
                                      const response = await fetch(`/api/tickets/${ticket.request_id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ Status: 3, cancel_whit: ticket.username }),
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
                                    }
                                  }
                                }}
                              >
                                ยกเลิก
                              </button>
                            )}
                          </div>
                          <TicketCard ticket={ticket} />
                        </div>
                      ))
                  )
                ) : activeTab === "assessment" ? (
                  tickets.filter(t => t.Status === 4).length === 0 ? (
                    <p className="text-muted-foreground">ไม่มีคำขอที่รอการประเมิน</p>
                  ) : (
                    tickets
                      .filter(t => t.Status === 4)
                      .map((ticket) => (
                        <div key={ticket.request_id} className="relative">
                          <div className="absolute bottom-4 right-4 z-10">
                            <button
                              className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTicket(ticket)
                              }}
                            >
                              ดูรายละเอียด
                            </button>
                          </div>
                          <TicketCard ticket={ticket} />
                        </div>
                      ))
                  )
                ) : (
                  tickets.filter(t => t.Status === 2 || t.Status === 3).length === 0 ? (
                    <p className="text-muted-foreground">ไม่มีคำขอที่เสร็จสิ้น</p>
                  ) : (
                    tickets
                      .filter(t => t.Status === 2 || t.Status === 3)
                      .map((ticket) => (
                        <div key={ticket.request_id} className="relative">
                          <div className="absolute bottom-4 right-4 z-10">
                            <button
                              className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTicket(ticket)
                              }}
                            >
                              ดูรายละเอียด
                            </button>
                          </div>
                          <TicketCard ticket={ticket} />
                        </div>
                      ))
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TicketDetail 
              ticket={selectedTicket} 
              onClose={() => setSelectedTicket(null)}
              onStatusChange={handleStatusChange}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      )}
    </div>
  )
}
