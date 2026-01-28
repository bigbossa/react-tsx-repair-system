"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api"
import Swal from "sweetalert2"

interface Device {
  id?: number
  devices_name: string
  amount_device: number
  price: string
  detail_device?: string
}

interface DeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device?: Device | null
  onSuccess: () => void
}

export function DeviceDialog({ open, onOpenChange, device, onSuccess }: DeviceDialogProps) {
  const [formData, setFormData] = useState<Device>({
    devices_name: "",
    amount_device: 0,
    price: "",
    detail_device: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (device) {
      setFormData({
        devices_name: device.devices_name,
        amount_device: device.amount_device,
        price: device.price,
        detail_device: device.detail_device || ""
      })
    } else {
      setFormData({
        devices_name: "",
        amount_device: 0,
        price: "",
        detail_device: ""
      })
    }
  }, [device, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.devices_name || !formData.amount_device || !formData.price) {
      await Swal.fire({
        icon: "warning",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        text: "กรุณากรอกชื่ออุปกรณ์ จำนวน และราคา",
        confirmButtonText: "ตกลง"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = device ? "/api/devices" : "/api/devices"
      const method = device ? "PUT" : "POST"
      const body = device ? { ...formData, id: device.id } : formData

      const response = await apiFetch(url, {
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
          title: device ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มอุปกรณ์สำเร็จ",
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {device ? "แก้ไขข้อมูลอุปกรณ์" : "เพิ่มอุปกรณ์ใหม่"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="devices_name">
                ชื่อออุปกรณ์ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="devices_name"
                value={formData.devices_name}
                onChange={(e) => setFormData({ ...formData, devices_name: e.target.value })}
                placeholder="เช่น Mouse, Keyboard"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount_device">
                  จำนวน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount_device"
                  type="number"
                  min="0"
                  value={formData.amount_device}
                  onChange={(e) => setFormData({ ...formData, amount_device: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detail_device">รายละเอียด</Label>
              <Textarea
                id="detail_device"
                value={formData.detail_device}
                onChange={(e) => setFormData({ ...formData, detail_device: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                rows={3}
                disabled={isSubmitting}
              />
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
              {isSubmitting ? "กำลังบันทึก..." : device ? "บันทึกการแก้ไข" : "เพิ่มอุปกรณ์"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
