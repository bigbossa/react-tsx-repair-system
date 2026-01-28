"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import type { Ticket, Asset } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditTicketDialog } from "./edit-ticket-dialog"
import { FeedbackDialog } from "./feedback-dialog"
import { Pencil, Eye } from "lucide-react"
import Swal from "sweetalert2"
import { formatDateThai, formatDateTimeThai } from "@/lib/utils"

interface TicketDetailProps {
  ticket: any
  isAdmin?: boolean
  onStatusChange?: (status: string) => void
  onClose?: () => void
  isUpdating?: boolean
  onUpdate?: () => void
}

const statusColors = {
  0: "bg-yellow-100 text-yellow-800 border-yellow-300",
  1: "bg-blue-100 text-blue-800 border-blue-300",
  2: "bg-green-100 text-green-800 border-green-300",
  3: "bg-red-100 text-red-800 border-red-300",
  4: "bg-orange-100 text-orange-800 border-orange-300",
}

const statusText = {
  0: "รอดำเนินการ",
  1: "กำลังดำเนินการ",
  2: "เสร็จสิ้น",
  3: "ยกเลิก",
  4: "รอการประเมิน",
}

export function TicketDetail({
  ticket,
  isAdmin = false,
  onStatusChange,
  onClose,
  isUpdating = false,
  onUpdate,
}: TicketDetailProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [assetData, setAssetData] = useState<Asset | null>(null)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
  const [isLoadingAsset, setIsLoadingAsset] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [isSurveyOpen, setIsSurveyOpen] = useState(false)
  const [surveyData, setSurveyData] = useState({
    rating: 0,
    comment: ""
  })
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState<any>(null)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const status = (ticket.Status ?? 0) as 0 | 1 | 2 | 3 | 4

  // ตรวจสอบว่ามีการประเมินแล้วหรือยัง
  const checkExistingFeedback = async () => {
    setIsLoadingFeedback(true)
    try {
      const response = await apiFetch(`/api/feedback?request_id=${ticket.request_id}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setExistingFeedback(data[0])
        } else {
          setExistingFeedback(null)
        }
      }
    } catch (error) {
      console.error('Failed to check feedback:', error)
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  // โหลดข้อมูล feedback เมื่อ component mount หรือเมื่อ ticket เปลี่ยน
  useEffect(() => {
    checkExistingFeedback()
  }, [ticket.request_id])

  const handleViewAsset = async () => {
    if (!ticket.asset_id) {
      await Swal.fire({
        icon: 'warning',
        title: 'ไม่พบรหัสทรัพย์สิน',
        text: 'ไม่มีรหัสทรัพย์สินในคำขอนี้',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    setIsLoadingAsset(true)
    try {
      // ค้นหาโดยตรงด้วย asset_code หรือ device_name
      const response = await apiFetch(`/api/assets?search=${encodeURIComponent(ticket.asset_id)}`)
      if (!response.ok) throw new Error('Failed to fetch assets')
      
      const result = await response.json()
      const assets: Asset[] = result.data || result
      
      // Find asset where device_name or asset_code matches ticket.asset_id
      const foundAsset = assets.find(asset => 
        asset.device_name === ticket.asset_id || 
        asset.asset_code === ticket.asset_id
      )
      
      if (foundAsset) {
        setAssetData(foundAsset)
        setIsAssetDialogOpen(true)
      } else {
        await Swal.fire({
          icon: 'info',
          title: 'ไม่พบข้อมูลทรัพย์สิน',
          text: `ไม่พบทรัพย์สินที่มีรหัส "${ticket.asset_id}" ในระบบ`,
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error('Failed to fetch asset:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลทรัพย์สินได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsLoadingAsset(false)
    }
  }

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (surveyData.rating === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาให้คะแนน',
        text: 'กรุณาเลือกคะแนนความพึงพอใจ',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    // ถ้าให้คะแนนไม่ผ่าน (< 3) ต้องกรอกเหตุผล
    if (surveyData.rating < 3 && (!surveyData.comment || surveyData.comment.trim() === '')) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาระบุเหตุผล',
        text: 'เมื่อประเมินไม่ผ่าน กรุณาระบุเหตุผลที่ไม่ผ่านการประเมิน',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    setIsSubmittingSurvey(true)
    try {
      const response = await apiFetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: ticket.request_id,
          rating: surveyData.rating,
          comment: surveyData.comment || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      await Swal.fire({
        icon: 'success',
        title: 'ขอบคุณสำหรับการประเมิน!',
        text: 'บันทึกความพึงพอใจเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        timer: 2000
      })

      setIsSurveyOpen(false)
      setSurveyData({ rating: 0, comment: "" })
      // โหลดข้อมูล feedback ใหม่หลังบันทึกสำเร็จ
      await checkExistingFeedback()
    } catch (error) {
      console.error('Failed to submit survey:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsSubmittingSurvey(false)
    }
  }
  
  return (
    <Card className="relative">
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-gray-100"
        >
          <span className="text-xl font-semibold text-gray-500 hover:text-gray-700">✕</span>
        </Button>
      )}
      <CardHeader className="pb-4 border-b pr-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg sm:text-xl font-bold break-all">{ticket.request_id}</CardTitle>
            <Badge variant="outline" className={(ticket.form_type === 'request') ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-blue-50 text-blue-700 border-blue-300'}>
              {ticket.form_type === 'request' ? 'แบบเบิกอุปกรณ์' : 'แจ้งซ่อมอุปกรณ์'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground break-all">รหัสทรัพย์สิน: {ticket.asset_id}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewAsset}
              disabled={isLoadingAsset}
              title="ดูข้อมูลทรัพย์สิน"
              className="text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">ดูข้อมูล</span>ทรัพย์สิน
            </Button>
            {ticket.img && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsMediaDialogOpen(true)}
                title="ดูรูปภาพ/วิดีโอ"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                ดูรูป/VDO
              </Button>
            )}
            {!isAdmin && status === 2 && !existingFeedback && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsSurveyOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                disabled={isLoadingFeedback}
              >
                ⭐ <span className="hidden xs:inline">ประเมิน</span>ความพึงพอใจ
              </Button>
            )}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="text-xs sm:text-sm">
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">รายละเอียด</span>การซ่อม
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 space-y-4 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">สถานะ</p>
            {isAdmin && onStatusChange ? (
              <Select value={String(status)} onValueChange={onStatusChange} disabled={isUpdating}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">รอดำเนินการ</SelectItem>
                  <SelectItem value="1">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="4">รอการประเมิน</SelectItem>
                  <SelectItem value="2">เสร็จสิ้น</SelectItem>
                  <SelectItem value="3">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={`${statusColors[status]} mt-1`}>{statusText[status]}</Badge>
            )}
          </div>

          {/* Assessment Actions for Users */}
          {!isAdmin && status === 4 && onStatusChange && (
            <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setIsFeedbackDialogOpen(true)} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                disabled={isUpdating}
              >
                ✓ ยืนยันการประเมิน (เสร็จสิ้น)
              </Button>
              <Button 
                onClick={() => onStatusChange("0")} 
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                disabled={isUpdating}
              >
                ✗ ไม่ผ่านการประเมิน
              </Button>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">วันที่แจ้ง</p>
            <p className="text-sm mt-1">
              {formatDateTimeThai(ticket.created_at)}
            </p>
          </div>

          {ticket.finish_with && ticket.finish_with.trim() !== '' && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">ผู้รับเรื่อง</p>
              <p className="text-sm mt-1 font-medium text-purple-700">{ticket.finish_with}</p>
            </div>
          )}

          {ticket.start_repair && ticket.start_repair.trim() !== '' && (
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">วันที่เริ่มซ่อม</p>
              <p className="text-xs sm:text-sm mt-1 font-medium text-blue-700">{ticket.start_repair}</p>
            </div>
          )}

          {(() => {
            const startDate = ticket.start_repair && ticket.start_repair.trim() !== '' 
              ? new Date(ticket.start_repair)
              : ticket.created_at ? new Date(ticket.created_at) : null
            
            if (!startDate) return null
            
            const endDate = ticket.finish_repair && ticket.finish_repair.trim() !== '' 
              ? new Date(ticket.finish_repair) 
              : (status === 2 ? null : new Date())
            
            if (!endDate) return null
            
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
            const diffDays = Math.floor(diffHours / 24)
            const remainingHours = diffHours % 24
            
            let timeText = ''
            if (diffHours < 24) {
              // น้อยกว่า 24 ชั่วโมง แสดงเป็นชั่วโมง
              timeText = `${diffHours} ชั่วโมง`
            } else {
              // มากกว่า 24 ชั่วโมง แสดงเป็นวัน + ชั่วโมง
              if (remainingHours > 0) {
                timeText = `${diffDays} วัน ${remainingHours} ชั่วโมง`
              } else {
                timeText = `${diffDays} วัน`
              }
            }
            
            return (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">ระยะเวลา{status === 2 ? 'การซ่อม' : ''}</p>
                <p className="text-sm mt-1 font-semibold text-orange-700">{timeText}</p>
              </div>
            )
          })()}
        </div>

        <div className="border-t pt-3 sm:pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ผู้แจ้ง</p>
          <p className="text-xs sm:text-sm font-medium break-words">{ticket.username || '-'}</p>
        </div>

        {ticket.asset_id && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">รหัสทรัพย์สิน</p>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-medium text-blue-700 break-all">{ticket.asset_id}</p>
              {/* <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewAsset}
                disabled={isLoadingAsset}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isLoadingAsset ? 'กำลังโหลด...' : 'ดูข้อมูลทรัพย์สิน'}
              </Button> */}
            </div>
          </div>
        )}

        {ticket.device_name && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ชื่ออุปกรณ์</p>
            <p className="text-xs sm:text-sm font-medium break-words">{ticket.device_name}</p>
          </div>
        )}

        {ticket.type_of_work && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ประเภทของงาน</p>
            <p className="text-xs sm:text-sm font-medium text-purple-700">{ticket.type_of_work}</p>
          </div>
        )}

        {ticket.work && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ชนิดของงาน</p>
            <p className="text-xs sm:text-sm font-medium text-indigo-700">[{ticket.work}]</p>
          </div>
        )}

        {ticket.detail_work && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">รายละเอียดงาน</p>
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words bg-purple-50 p-2 sm:p-3 rounded-md">
              {(() => {
                try {
                  const details = JSON.parse(ticket.detail_work)
                  return `บริษัท: ${details.company || '-'}, สาขา: ${details.branch || '-'}, อุปกรณ์: ${details.device || ticket.asset_id || '-'}`
                } catch {
                  return ticket.detail_work
                }
              })()}
            </p>
          </div>
        )}

        {ticket.Ref && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">อาการ/ปัญหาที่แจ้ง</p>
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">[{ticket.Ref}]</p>
          </div>
        )}

        {ticket.img && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">รูปภาพ/วิดีโอประกอบ</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMediaDialogOpen(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4 mr-1" />
              คลิกเพื่อดูรูป/วิดีโอ
            </Button>
          </div>
        )}

        {(ticket.Rep_info || ticket.Re_Rep1 || ticket.Re_Rep2) && (
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">รายละเอียดการซ่อม</p>
            <div className="space-y-2">
              {ticket.Rep_info && (
                <div className="bg-blue-50 p-2 sm:p-3 rounded-md border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-700 mb-1">รอบปัจจุบัน</p>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{ticket.Rep_info}</p>
                </div>
              )}
              {ticket.Re_Rep1 && (
                <div className="bg-blue-50/60 p-2 sm:p-3 rounded-md border-l-4 border-blue-400">
                  <p className="text-xs font-semibold text-blue-600 mb-1">รอบที่ 2</p>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words text-gray-700">{ticket.Re_Rep1}</p>
                </div>
              )}
              {ticket.Re_Rep2 && (
                <div className="bg-blue-50/40 p-2 sm:p-3 rounded-md border-l-4 border-blue-300">
                  <p className="text-xs font-semibold text-blue-500 mb-1">รอบที่ 3</p>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words text-gray-600">{ticket.Re_Rep2}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {ticket.cost && ticket.cost !== "0" && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ค่าใช้จ่าย</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700">{ticket.cost} บาท</span>
                {ticket.price_type !== null && ticket.price_type !== undefined && (
                  <Badge variant="outline" className={ticket.price_type === 0 ? "border-blue-500 text-blue-700 bg-blue-50" : "border-purple-500 text-purple-700 bg-purple-50"}>
                    {ticket.price_type === 0 ? "เบิกจ่าย" : "สั่งซื้อ"}
                  </Badge>
                )}
              </div>
              {ticket.description_price && (
                <div className="bg-green-50 p-2 sm:p-3 rounded-md border-l-4 border-green-500">
                  <p className="text-xs font-semibold text-green-700 mb-1">รายละเอียด</p>
                  <p className="text-xs sm:text-sm text-gray-700">{ticket.description_price}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {ticket.repair_count !== null && ticket.repair_count !== undefined && ticket.repair_count > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">จำนวนรอบการซ่อม</p>
            <p className="text-sm font-semibold text-orange-700">{ticket.repair_count} รอบ</p>
          </div>
        )}

        {(ticket.Comment_re || ticket.Comment_re2 || ticket.Comment_re3) && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">เหตุผลที่ไม่ผ่านการประเมิน</p>
            <div className="space-y-2">
              {ticket.Comment_re && (
                <div className="bg-red-50 p-3 rounded-md border-l-4 border-red-500">
                  <p className="text-xs font-semibold text-red-700 mb-1">ครั้งล่าสุด</p>
                  <p className="text-sm whitespace-pre-wrap text-red-700">{ticket.Comment_re}</p>
                </div>
              )}
              {ticket.Comment_re2 && (
                <div className="bg-red-50/60 p-3 rounded-md border-l-4 border-red-400">
                  <p className="text-xs font-semibold text-red-600 mb-1">ครั้งที่ 2</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{ticket.Comment_re2}</p>
                </div>
              )}
              {ticket.Comment_re3 && (
                <div className="bg-red-50/40 p-3 rounded-md border-l-4 border-red-300">
                  <p className="text-xs font-semibold text-red-500 mb-1">ครั้งที่ 3</p>
                  <p className="text-sm whitespace-pre-wrap text-gray-600">{ticket.Comment_re3}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {ticket.cancel_whit && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ยกเลิกโดย</p>
            <p className="text-sm font-semibold text-red-600">{ticket.cancel_whit}</p>
          </div>
        )}

        {ticket.start_repair && ticket.start_repair.trim() !== '' && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">วันที่เริ่มซ่อม (start_repair)</p>
            <p className="text-sm font-medium text-blue-700">{ticket.start_repair}</p>
          </div>
        )}

        {ticket.finish_repair && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">วันที่ซ่อมเสร็จ/ยกเลิก (finish_repair)</p>
            <p className="text-sm font-medium text-green-700">
              {formatDateTimeThai(ticket.finish_repair)}
            </p>
          </div>
        )}

        {/* แสดงผลการประเมินความพึงพอใจ */}
        {existingFeedback && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ผลการประเมินความพึงพอใจ</p>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">ระดับความพึงพอใจ</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`text-2xl ${parseInt(existingFeedback.form_status) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      {existingFeedback.form_status === '5' && 'พึงพอใจมากที่สุด'}
                      {existingFeedback.form_status === '4' && 'พึงพอใจมาก'}
                      {existingFeedback.form_status === '3' && 'พึงพอใจปานกลาง'}
                      {existingFeedback.form_status === '2' && 'พึงพอใจน้อย'}
                      {existingFeedback.form_status === '1' && 'ไม่พึงพอใจ'}
                    </span>
                  </div>
                </div>
                
                {existingFeedback.form_description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">หมายเหตุ / ข้อเสนอแนะ</p>
                    <p className="text-sm bg-white p-3 rounded border whitespace-pre-wrap">
                      {existingFeedback.form_description}
                    </p>
                  </div>
                )}
                
                {existingFeedback.created_at && (
                  <div>
                    <p className="text-xs text-gray-500">
                      ประเมินเมื่อ: {formatDateTimeThai(existingFeedback.created_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {ticket.total_date && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">วันที่ใช้ดำเนินการ (total_date)</p>
            <p className="text-sm font-medium text-purple-700">{ticket.total_date}</p>
          </div>
        )}

        {ticket.updated_at && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">อัปเดตล่าสุด</p>
            <p className="text-sm">
              {formatDateTimeThai(ticket.updated_at)}
            </p>
          </div>
        )}
      </CardContent>
      
      {isAdmin && (
        <EditTicketDialog 
          ticket={ticket}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            if (onUpdate) onUpdate()
          }}
        />
      )}

      {/* Satisfaction Survey Dialog */}
      <Dialog open={isSurveyOpen} onOpenChange={setIsSurveyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{existingFeedback ? 'ผลการประเมินความพึงพอใจ' : 'ประเมินความพึงพอใจ'}</DialogTitle>
          </DialogHeader>
          
          {existingFeedback ? (
            // แสดงผลการประเมินที่มีอยู่แล้ว
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ระดับความพึงพอใจ</label>
                <div className="space-y-2">
                  {[
                    { value: 5, label: "พึงพอใจมากที่สุด" },
                    { value: 4, label: "พึงพอใจมาก" },
                    { value: 3, label: "พึงพอใจปานกลาง" },
                    { value: 2, label: "พึงพอใจน้อย" },
                    { value: 1, label: "ไม่พึงพอใจ" },
                  ].map((option) => {
                    const rating = parseInt(existingFeedback.form_description?.match(/Rating: (\d+)/)?.[1] || '0')
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
                          rating === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          checked={rating === option.value}
                          disabled
                          className="h-4 w-4 text-blue-600"
                        />
                        <label className="flex-1 font-medium select-none">
                          {option.label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">หมายเหตุ / ข้อเสนอแนะ</label>
                <div className="p-3 rounded-md border bg-gray-50 text-sm min-h-[100px]">
                  {existingFeedback.form_description?.split(' - ')[1] || '-'}
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <p>ประเมินเมื่อ: {formatDateTimeThai(existingFeedback.created_at)}</p>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={() => setIsSurveyOpen(false)}
              >
                ปิด
              </Button>
            </div>
          ) : (
            // ฟอร์มประเมินใหม่
            <form onSubmit={handleSubmitSurvey} className="space-y-6 py-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">ระดับความพึงพอใจ <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {[
                    { value: 5, label: "พึงพอใจมากที่สุด" },
                    { value: 4, label: "พึงพอใจมาก" },
                    { value: 3, label: "พึงพอใจปานกลาง" },
                    { value: 2, label: "พึงพอใจน้อย" },
                    { value: 1, label: "ไม่พึงพอใจ" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        surveyData.rating === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setSurveyData({ ...surveyData, rating: option.value })
                      }
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={surveyData.rating === option.value}
                        onChange={(e) =>
                          setSurveyData({
                            ...surveyData,
                            rating: parseInt(e.target.value),
                          })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="flex-1 cursor-pointer font-medium select-none">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  หมายเหตุ / ข้อเสนอแนะ
                  {surveyData.rating < 3 && surveyData.rating > 0 && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {surveyData.rating < 3 && surveyData.rating > 0 && (
                  <p className="text-xs text-red-600">
                    * กรุณาระบุเหตุผลที่ไม่ผ่านการประเมิน
                  </p>
                )}
                <textarea
                  placeholder={
                    surveyData.rating < 3 && surveyData.rating > 0
                      ? "กรุณาระบุเหตุผลที่ไม่ผ่านการประเมิน (บังคับกรอก)"
                      : "แสดงความคิดเห็นเพิ่มเติม (ถ้ามี)"
                  }
                  value={surveyData.comment}
                  onChange={(e) => setSurveyData({ ...surveyData, comment: e.target.value })}
                  rows={4}
                  className={`w-full rounded-md border ${
                    surveyData.rating < 3 && surveyData.rating > 0 && !surveyData.comment.trim()
                      ? "border-red-500"
                      : "border-input"
                  } bg-background px-3 py-2 text-sm`}
                  required={surveyData.rating < 3 && surveyData.rating > 0}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsSurveyOpen(false)
                    setSurveyData({ rating: 0, comment: "" })
                  }}
                  disabled={isSubmittingSurvey}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSubmittingSurvey}
                >
                  {isSubmittingSurvey ? 'กำลังบันทึก...' : 'ส่งการประเมิน'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ข้อมูลทรัพย์สิน</DialogTitle>
          </DialogHeader>
          {assetData && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Asset Code</p>
                <p className="text-sm font-semibold">{assetData.asset_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ผู้ใช้งาน</p>
                <p className="text-sm">{assetData.user_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">สาขา</p>
                <p className="text-sm">{assetData.site || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">แผนก</p>
                <p className="text-sm">{assetData.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">อุปกรณ์</p>
                <p className="text-sm font-semibold text-blue-700">{assetData.device_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ยี่ห้อ</p>
                <p className="text-sm">{assetData.brand || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU</p>
                <p className="text-sm">{assetData.cpu || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">RAM</p>
                <p className="text-sm">{assetData.ram || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Harddisk</p>
                <p className="text-sm">{assetData.harddisk || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="text-sm font-mono">{assetData.ip_address || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">MAC Address</p>
                <p className="text-sm font-mono">{assetData.mac_address || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                <p className="text-sm font-mono">{assetData.serial_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมายเลข</p>
                <p className="text-sm">{assetData.number || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">License</p>
                <p className="text-sm break-all">{assetData.license || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">หมวดหมู่</p>
                <Badge variant="secondary">{assetData.category || '-'}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ราคา</p>
                <p className="text-sm font-semibold text-green-700">{assetData.cost || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">วันที่ซื้อ</p>
                <p className="text-sm">{assetData.purchase_date || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ref Device</p>
                <p className="text-sm">{assetData.ref_devicename || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media (Image/Video) Dialog */}
      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>รูปภาพ / วิดีโอประกอบ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {ticket.img && (
              <div className="flex justify-center items-center">
                {(() => {
                  // เพิ่ม basePath ให้กับ path ที่ไม่ใช่ base64 หรือ data URL
                  const imageSrc = ticket.img.startsWith('data:') || ticket.img.startsWith('http') 
                    ? ticket.img 
                    : ticket.img.startsWith('/repair/') 
                      ? ticket.img 
                      : `/repair${ticket.img.startsWith('/') ? ticket.img : '/' + ticket.img}`
                  
                  return ticket.img.toLowerCase().includes('.mp4') || 
                   ticket.img.toLowerCase().includes('.mov') || 
                   ticket.img.toLowerCase().includes('.webm') || 
                   ticket.img.toLowerCase().includes('.avi') || 
                   ticket.img.toLowerCase().includes('.mkv') || 
                   ticket.img.startsWith('data:video/') ? (
                    <video 
                      src={imageSrc} 
                      controls 
                      preload="metadata"
                      className="max-w-full max-h-[70vh] rounded-lg border"
                    >
                      <source src={imageSrc} type="video/mp4" />
                      <source src={imageSrc} type="video/webm" />
                      <source src={imageSrc} type="video/quicktime" />
                      เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                    </video>
                  ) : (
                    <img 
                      src={imageSrc} 
                      alt="Ticket media" 
                      className="max-w-full max-h-[70vh] rounded-lg border object-contain"
                    />
                  )
                })()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog - แสดงเมื่อยืนยันการประเมิน */}
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        requestId={ticket.request_id}
        onSuccess={() => {
          // Refresh ticket data หลังจากส่งผลประเมินสำเร็จ
          if (onUpdate) onUpdate()
        }}
      />
    </Card>
  )
}
