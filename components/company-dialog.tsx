"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Swal from "sweetalert2"

interface Company {
  id?: number
  company_code: string
  company_name: string
}

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company | null
  onSuccess: () => void
}

export function CompanyDialog({ open, onOpenChange, company, onSuccess }: CompanyDialogProps) {
  const [formData, setFormData] = useState<Company>({
    company_code: "",
    company_name: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        company_code: company.company_code,
        company_name: company.company_name
      })
    } else {
      setFormData({
        company_code: "",
        company_name: ""
      })
    }
  }, [company, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.company_code || !formData.company_name) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณากรอกรหัสและชื่อบริษัท",
        timer: 1000,
        showConfirmButton: false
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = company ? "/api/company" : "/api/company"
      const method = company ? "PUT" : "POST"
      const body = company ? { ...formData, id: company.id } : formData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: company ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มบริษัทสำเร็จ",
          text: result.message,
          timer: 1000,
          showConfirmButton: false
        })
        onOpenChange(false)
        onSuccess()
      } else {
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: result.error || "ไม่สามารถบันทึกข้อมูลได้",
          confirmButtonText: "ตกลง"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        confirmButtonText: "ตกลง"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {company ? "แก้ไขข้อมูลบริษัท" : "เพิ่มบริษัทใหม่"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company_code">
                  รหัสบริษัท <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_code"
                  value={formData.company_code}
                  onChange={(e) => setFormData({ ...formData, company_code: e.target.value })}
                  placeholder="เช่น COMP001"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company_name">
                  ชื่อบริษัท <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : company ? "บันทึกการแก้ไข" : "เพิ่มบริษัท"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
