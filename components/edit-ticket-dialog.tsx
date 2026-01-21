"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Swal from "sweetalert2"

interface EditTicketDialogProps {
  ticket: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditTicketDialog({ ticket, isOpen, onClose, onSuccess }: EditTicketDialogProps) {
  // Set finish_repair to today's date in Thailand timezone
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' })
  
  const [formData, setFormData] = useState({
    Status: ticket.Status ?? 0,
    start_repair: ticket.start_repair || "",
    finish_repair: today,
    cost: ticket.cost || "",
    total_date: ticket.total_date || "",
    Rep_info: ticket.Rep_info || "",
    type_of_work: ticket.type_of_work || "",
    work: ticket.work || "",
    detail_work: ticket.detail_work || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCost, setHasCost] = useState<boolean>(ticket.cost && ticket.cost !== "0" ? true : false)
  const [costType, setCostType] = useState<"withdraw" | "purchase" | "">("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [equipmentPrice, setEquipmentPrice] = useState<string>("")
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [purchaseDescription, setPurchaseDescription] = useState<string>("")
  const [equipmentList, setEquipmentList] = useState<any[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null)

  // ดึงข้อมูลอุปกรณ์จาก API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await apiFetch('/api/devices')
        if (response.ok) {
          const data = await response.json()
          // กรองเฉพาะอุปกรณ์ที่มีจำนวนเหลือ
          const availableDevices = data.filter((device: any) => device.amount_device > 0)
          setEquipmentList(availableDevices)
        }
      } catch (error) {
        console.error('Error fetching devices:', error)
      }
    }
    
    if (isOpen) {
      fetchDevices()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ตรวจสอบการกรอกข้อมูล
    if (hasCost) {
      if (!costType) {
        await Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกประเภทค่าใช้จ่าย',
          text: 'กรุณาเลือกว่าเป็นการเบิกจ่าย หรือสั่งซื้อ',
          timer: 1000,
          showConfirmButton: false
        })
        return
      }

      if (costType === "withdraw" && !selectedEquipment) {
        await Swal.fire({
          icon: 'warning',
          title: 'กรุณาเลือกอุปกรณ์',
          text: 'กรุณาเลือกอุปกรณ์ที่ต้องการเบิกจ่าย',
          timer: 1000,
          showConfirmButton: false
        })
        return
      }

      if (costType === "purchase") {
        if (!purchasePrice || purchasePrice === "0") {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกราคา',
            text: 'กรุณากรอกราคาสินค้าที่ต้องการสั่งซื้อ',
            timer: 1000,
            showConfirmButton: false
          })
          return
        }
        if (!purchaseDescription || purchaseDescription.trim() === "") {
          await Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกรายละเอียด',
            text: 'กรุณากรอกรายละเอียดสินค้าที่ต้องการสั่งซื้อ',
            timer: 1000,
            showConfirmButton: false
          })
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      // Prepare cost data
      let finalCost = "0"
      let priceType = null
      let descriptionPrice = null
      
      if (hasCost) {
        if (costType === "withdraw" && selectedEquipment) {
          finalCost = equipmentPrice
          priceType = 0 // เบิกจ่าย
          descriptionPrice = selectedEquipment
        } else if (costType === "purchase" && purchasePrice) {
          finalCost = purchasePrice
          priceType = 1 // สั่งซื้อ
          descriptionPrice = purchaseDescription
        }
      }

      const submitData = {
        Rep_info: formData.Rep_info,
        cost: finalCost,
        price_type: priceType, // 0 = เบิกจ่าย, 1 = สั่งซื้อ, null = ไม่มีค่าใช้จ่าย
        description_price: descriptionPrice, // คำอธิบาย/รายละเอียด
        type_of_work: formData.type_of_work,
        work: formData.work,
        detail_work: formData.detail_work,
        finish_repair: formData.finish_repair,
        status: '4', // เปลี่ยนสถานะเป็นรอการประเมิน
      }

      const response = await apiFetch(`/api/tickets/${ticket.request_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        // ถ้าเลือกเบิกจ่ายอุปกรณ์ ให้ลดจำนวนอุปกรณ์
        if (hasCost && costType === 'withdraw' && selectedDeviceId) {
          try {
            const device = equipmentList.find(d => d.id === selectedDeviceId)
            if (device) {
              await apiFetch('/api/devices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: selectedDeviceId,
                  devices_name: device.devices_name,
                  amount_device: device.amount_device - 1,
                  price: device.price,
                  detail_device: device.detail_device
                })
              })
            }
          } catch (error) {
            console.error('Error updating device quantity:', error)
          }
        }

        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลเรียบร้อยแล้ว สถานะเปลี่ยนเป็น "รอการประเมิน"',
          timer: 2000,
          showConfirmButton: false
        })
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorData.error || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error('Submit Error:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>รายละเอียดการซ่อม - {ticket.request_id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ชนิดของงาน */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ชนิดของงาน</label>
            <Input
              placeholder="เช่น Hardware, Software, Network"
              value={formData.work}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>
          {/* ประเภทของงาน */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ประเภทของงาน</label>
            <Input
              placeholder="เช่น ซ่อม, ติดตั้ง, บำรุงรักษา"
              value={formData.type_of_work}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          {/* รายละเอียดงาน */}
          {formData.detail_work && (
            <div className="space-y-2">
              <label className="text-sm font-medium">รายละเอียดงาน</label>
              <textarea
                placeholder="รายละเอียดเพิ่มเติม"
                value={formData.detail_work}
                disabled
                rows={3}
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* อาการ/ปัญหาที่แจ้ง */}
          {ticket.Ref && (
            <div className="space-y-2">
              <label className="text-sm font-medium">อาการ/ปัญหาที่แจ้ง</label>
              <textarea
                placeholder="อาการหรือปัญหาที่ผู้ใช้แจ้งเข้ามา"
                value={ticket.Ref}
                disabled 
                rows={3}
                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>
          )}

          {/* รายละเอียดการซ่อม */}
          <div className="space-y-2">
            <label className="text-sm font-medium">รายละเอียดการซ่อม <span className="text-red-500">*</span></label>
            <textarea
              placeholder="ระบุรายละเอียดวิธีการซ่อม อะไหล่ที่เปลี่ยน..."
              value={formData.Rep_info}
              onChange={(e) => setFormData({ ...formData, Rep_info: e.target.value })}
              required
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* วันที่ซ่อมเสร็จ */}
          <div className="space-y-2">
            <label className="text-sm font-medium">วันที่ซ่อมเสร็จ</label>
            <Input
              type="date"
              value={formData.finish_repair}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">วันที่ถูกกำหนดเป็นวันนี้โดยอัตโนมัติ</p>
          </div>

          {/* Cost Management Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">มีค่าใช้จ่ายหรือไม่</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasCost"
                    checked={hasCost === false}
                    onChange={() => {
                      setHasCost(false)
                      setCostType("")
                      setSelectedEquipment("")
                      setEquipmentPrice("")
                      setPurchasePrice("")
                      setPurchaseDescription("")
                      setFormData({ ...formData, cost: "0" })
                    }}
                    className="w-4 h-4"
                  />
                  <span>ไม่มีค่าใช้จ่าย</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasCost"
                    checked={hasCost === true}
                    onChange={() => setHasCost(true)}
                    className="w-4 h-4"
                  />
                  <span>มีค่าใช้จ่าย</span>
                </label>
              </div>
            </div>

            {hasCost && (
              <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                <div className="space-y-3">
                  <label className="text-sm font-medium">ค่าใช้จ่าย</label>
                  <Select
                    value={costType}
                    onValueChange={(value: "withdraw" | "purchase") => {
                      setCostType(value)
                      setSelectedEquipment("")
                      setEquipmentPrice("")
                      setPurchasePrice("")
                      setPurchaseDescription("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ระบุค่าใช้จ่าย (ถ้าไม่กรอกหน้า 0)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="withdraw">เบิกจ่าย</SelectItem>
                      <SelectItem value="purchase">สั่งซื้อ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {costType === "withdraw" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">เลือกอุปกรณ์ <span className="text-red-500">*</span></label>
                      <Select
                        value={selectedEquipment}
                        onValueChange={(value) => {
                          setSelectedEquipment(value)
                          const equipment = equipmentList.find(e => e.devices_name === value)
                          if (equipment) {
                            setEquipmentPrice(equipment.price)
                            setSelectedDeviceId(equipment.id)
                          }
                        }}
                        required={hasCost && costType === "withdraw"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกอุปกรณ์ (ที่มีในคลัง)" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentList.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              ไม่มีอุปกรณ์ในคลัง
                            </div>
                          ) : (
                            equipmentList.map((equipment) => (
                              <SelectItem key={equipment.id} value={equipment.devices_name}>
                                {equipment.devices_name} - ฿{equipment.price} (คงเหลือ: {equipment.amount_device})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedEquipment && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">ราคา:</span>
                          <span className="text-lg font-bold text-blue-600">฿{equipmentPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium">คงเหลือหลังเบิก:</span>
                          <span className="text-sm font-semibold text-orange-600">
                            {equipmentList.find(e => e.id === selectedDeviceId)?.amount_device - 1 || 0} ชิ้น
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {costType === "purchase" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">ราคา (บาท) <span className="text-red-500">*</span></label>
                      <Input
                        type="number"
                        placeholder="กรอกราคา"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        required={hasCost && costType === "purchase"}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">คำอธิบาย <span className="text-red-500">*</span></label>
                      <textarea
                        placeholder="ระบุรายละเอียดการสั่งซื้อ..."
                        value={purchaseDescription}
                        onChange={(e) => setPurchaseDescription(e.target.value)}
                        required={hasCost && costType === "purchase"}
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter >
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
