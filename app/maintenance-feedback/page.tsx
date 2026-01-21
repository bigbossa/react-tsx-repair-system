'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, CheckCircle2, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'

interface MaintenanceRecord {
  id: number
  asset_code: string
  device_name: string
  category: string
  user_name: string
  checked_by: string
  checked_at: string
  remarks: string
  checklist: any[]
  alreadySubmitted: boolean
  feedback: {
    satisfaction_level: number
    service_speed: number
    technician_rating: number
    comments: string
    submitted_at: string
  } | null
}

function MaintenanceFeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const id = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [record, setRecord] = useState<MaintenanceRecord | null>(null)
  const [error, setError] = useState('')
  
  const [satisfactionLevel, setSatisfactionLevel] = useState(0)
  const [serviceSpeed, setServiceSpeed] = useState(0)
  const [technicianRating, setTechnicianRating] = useState(0)
  const [comments, setComments] = useState('')

  useEffect(() => {
    if (token && id) {
      fetchMaintenanceRecord()
    } else {
      setError('ไม่พบข้อมูลที่ต้องการ')
      setLoading(false)
    }
  }, [token, id])

  const fetchMaintenanceRecord = async () => {
    try {
      setLoading(true)
      const response = await apiFetch(`/api/maintenance-feedback?token=${token}&id=${id}`)
      const result = await response.json()

      if (result.success) {
        setRecord(result.data)
        if (result.data.alreadySubmitted && result.data.feedback) {
          setSatisfactionLevel(result.data.feedback.satisfaction_level)
          setServiceSpeed(result.data.feedback.service_speed || 0)
          setTechnicianRating(result.data.feedback.technician_rating || 0)
          setComments(result.data.feedback.comments || '')
        }
      } else {
        setError(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err) {
      console.error('Error fetching maintenance record:', err)
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (satisfactionLevel === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาให้คะแนน',
        text: 'กรุณาให้คะแนนความพึงพอใจโดยรวม',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    try {
      setSubmitting(true)
      
      const feedbackData = {
        token,
        maintenance_record_id: record?.id,
        satisfaction_level: satisfactionLevel,
        service_speed: serviceSpeed || null,
        technician_rating: technicianRating || null,
        comments: comments.trim()
      }

      const response = await apiFetch('/api/maintenance-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      })

      const result = await response.json()

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'ส่งแบบประเมินสำเร็จ!',
          text: 'ขอบคุณสำหรับความคิดเห็นของท่าน',
          confirmButtonText: 'ตกลง'
        })
        // รีเฟรชข้อมูล
        fetchMaintenanceRecord()
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถส่งแบบประเมินได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, setRating: (rating: number) => void, disabled: boolean = false) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && setRating(star)}
            disabled={disabled}
            className={`transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSubmitted = record.alreadySubmitted

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <CardTitle className="text-2xl">แบบประเมินความพึงพอใจ</CardTitle>
              <CardDescription className="text-blue-100">
                การบำรุงรักษาอุปกรณ์ (Maintenance Service)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* ข้อมูลการบำรุงรักษา */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-lg mb-3">ข้อมูลการบำรุงรักษา</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Asset Code:</span>
                <p className="font-semibold">{record.asset_code}</p>
              </div>
              <div>
                <span className="text-gray-600">อุปกรณ์:</span>
                <p className="font-semibold">{record.device_name}</p>
              </div>
              <div>
                <span className="text-gray-600">ผู้ใช้:</span>
                <p className="font-semibold">{record.user_name}</p>
              </div>
              <div>
                <span className="text-gray-600">ผู้ตรวจสอบ:</span>
                <p className="font-semibold">{record.checked_by}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">วันที่:</span>
                <p className="font-semibold">
                  {new Date(record.checked_at).toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-semibold">
                ท่านได้ทำแบบประเมินนี้เรียบร้อยแล้ว
              </p>
              <p className="text-sm text-green-600 mt-1">
                ส่งเมื่อ: {record.feedback && new Date(record.feedback.submitted_at).toLocaleString('th-TH')}
              </p>
            </div>
          )}

          {/* แบบฟอร์มประเมิน */}
          <div className="space-y-6">
            {/* ความพึงพอใจโดยรวม */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                1. ความพึงพอใจโดยรวม <span className="text-red-500">*</span>
              </Label>
              {renderStars(satisfactionLevel, setSatisfactionLevel, isSubmitted)}
              <p className="text-sm text-gray-500 mt-2">
                {satisfactionLevel === 0 && 'กรุณาให้คะแนน'}
                {satisfactionLevel === 1 && 'ไม่พอใจมาก'}
                {satisfactionLevel === 2 && 'ไม่พอใจ'}
                {satisfactionLevel === 3 && 'ปานกลาง'}
                {satisfactionLevel === 4 && 'พอใจ'}
                {satisfactionLevel === 5 && 'พอใจมาก'}
              </p>
            </div>

            {/* ความรวดเร็วในการให้บริการ */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                2. ความรวดเร็วในการให้บริการ
              </Label>
              {renderStars(serviceSpeed, setServiceSpeed, isSubmitted)}
            </div>

            {/* การให้บริการของช่างเทคนิค */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                3. การให้บริการของช่างเทคนิค
              </Label>
              {renderStars(technicianRating, setTechnicianRating, isSubmitted)}
            </div>

            {/* ความคิดเห็นและข้อเสนอแนะ */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                4. ความคิดเห็นและข้อเสนอแนะเพิ่มเติม
              </Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="กรุณาแสดงความคิดเห็นหรือข้อเสนอแนะ..."
                rows={5}
                disabled={isSubmitted}
                className="resize-none"
              />
            </div>
          </div>

          {/* ปุ่มส่งแบบประเมิน */}
          {!isSubmitted && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={submitting || satisfactionLevel === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {submitting ? 'กำลังส่ง...' : 'ส่งแบบประเมิน'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function MaintenanceFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <MaintenanceFeedbackContent />
    </Suspense>
  )
}
