"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import Swal from "sweetalert2"

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  onSuccess: () => void
}

export function FeedbackDialog({ isOpen, onClose, requestId, onSuccess }: FeedbackDialogProps) {
  const [rating, setRating] = useState<string>("")
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingLabels: { [key: number]: string } = {
    1: "ไม่พึงพอใจ",
    2: "พึงพอใจน้อย",
    3: "พึงพอใจปานกลาง",
    4: "พึงพอใจมาก",
    5: "พึงพอใจมากที่สุด"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    if (!rating) {
      await Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกระดับความพึงพอใจ',
        text: 'โปรดเลือกระดับความพึงพอใจก่อนส่งแบบประเมิน',
        confirmButtonText: 'ตกลง',
        allowOutsideClick: true,
        allowEscapeKey: true
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log('=== Starting feedback submission ===')
      console.log('Request ID:', requestId)
      console.log('Rating:', rating)
      
      // บันทึก feedback
      const feedbackResponse = await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          form_status: rating,
          form_description: comment.trim() || null
        })
      })

      console.log('Feedback response status:', feedbackResponse.status, feedbackResponse.ok)

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Feedback error:', errorData)
        
        // แสดง error message ที่เป็นมิตรกับผู้ใช้
        let errorMessage = 'ไม่สามารถบันทึกแบบประเมินได้'
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        }
        throw new Error(errorMessage)
      }

      const feedbackResult = await feedbackResponse.json()
      console.log('Feedback saved:', feedbackResult)

      // เปลี่ยนสถานะเป็น "เสร็จสิ้น" (Status = 2) - ใช้ตัวใหญ่
      console.log('=== Updating ticket status ===')
      console.log('URL:', `/api/tickets/${requestId}`)
      
      const statusResponse = await apiFetch(`/api/tickets/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 2, status: 2 })  // ส่งทั้ง 2แบบมือถือและตัวใหญ่
      })

      console.log('Status response:', statusResponse.status, statusResponse.ok)
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Status update error:', errorData)
        
        // แสดง error message ที่เป็นมิตรกับผู้ใช้
        let errorMessage = 'ไม่สามารถเปลี่ยนสถานะได้'
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ'
        }
        throw new Error(errorMessage)
      }
      
      const statusResult = await statusResponse.json()
      console.log('Status updated successfully:', statusResult)

      console.log('=== All done, showing success message ===')
      
      // แสดง success message
      await Swal.fire({
        icon: 'success',
        title: 'ขอบคุณสำหรับการประเมิน!',
        text: 'บันทึกผลการประเมินเรียบร้อยแล้ว งานเสร็จสิ้น',
        timer: 1500,
        showConfirmButton: false,
        allowOutsideClick: false
      })
      
      console.log('Success message closed, reloading page...')
      
      // รอให้ database commit ข้อมูล แล้วรีเฟรชหน้า
      setTimeout(() => {
        window.location.href = window.location.href
      }, 500)
    } catch (error) {
      console.error('Submit Error:', error)
      
      // แสดง error message อย่างชัดเจน
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'
      
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
        allowOutsideClick: false,
        allowEscapeKey: false
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ประเมินความพึงพอใจ</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ระดับความพึงพอใจ - Star Rating */}
          <div className="space-y-3">
            <Label className="text-base">
              ระดับความพึงพอใจ <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star.toString())}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || parseInt(rating) || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground h-5">
                {rating ? ratingLabels[parseInt(rating)] : (hoverRating ? ratingLabels[hoverRating] : "คลิกเพื่อให้คะแนน")}
              </p>
            </div>
          </div>

          {/* หมายเหตุ/ข้อเสนอแนะ */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base">หมายเหตุ / ข้อเสนอแนะ</Label>
            <textarea
              id="comment"
              placeholder="แสดงความคิดเห็นหรือข้อเสนอแนะ (ถ้ามี)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งการประเมิน"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
