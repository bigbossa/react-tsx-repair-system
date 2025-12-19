"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DeviceDialog } from "@/components/device-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react"
import Swal from "sweetalert2"

interface Device {
  id: number
  devices_name: string
  amount_device: number
  price: string
  detail_device?: string
  created_at: string
  updated_at: string
}

export default function DevicesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchDevices()
  }, [user, authLoading, router])

  useEffect(() => {
    // Filter devices based on search query
    if (searchQuery.trim() === "") {
      setFilteredDevices(devices)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = devices.filter(device => 
        device.devices_name.toLowerCase().includes(query) ||
        device.detail_device?.toLowerCase().includes(query) ||
        device.price.includes(query)
      )
      setFilteredDevices(filtered)
    }
  }, [searchQuery, devices])

  const fetchDevices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/devices")
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
        setFilteredDevices(data)
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
        confirmButtonText: "ตกลง"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDevice = () => {
    setSelectedDevice(null)
    setIsDialogOpen(true)
  }

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device)
    setIsDialogOpen(true)
  }

  const handleDeleteDevice = async (device: Device) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `คุณต้องการลบอุปกรณ์ "${device.devices_name}" ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444"
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/devices?id=${device.id}`, {
          method: "DELETE"
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: data.message,
            confirmButtonText: "ตกลง"
          })
          fetchDevices()
        } else {
          await Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถลบข้อมูลได้",
            confirmButtonText: "ตกลง"
          })
        }
      } catch (error) {
        console.error("Error deleting device:", error)
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          confirmButtonText: "ตกลง"
        })
      }
    }
  }

  const totalDevices = devices.length
  const totalAmount = devices.reduce((sum, device) => sum + device.amount_device, 0)
  const totalValue = devices.reduce((sum, device) => {
    const price = parseFloat(device.price) || 0
    return sum + (price * device.amount_device)
  }, 0)

  if (authLoading || (isLoading && devices.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold truncate">จัดการอุปกรณ์เบิกจ่าย</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
              <span className="text-sm sm:hidden">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">รายการอุปกรณ์ทั้งหมด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalDevices}</div>
              <p className="text-xs text-muted-foreground">ชนิดอุปกรณ์</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จำนวนทั้งหมด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalAmount}</div>
              <p className="text-xs text-muted-foreground">ชิ้น</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มูลค่ารวม</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">บาท</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add Button */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาอุปกรณ์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleAddDevice} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มอุปกรณ์
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Devices Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "ไม่พบอุปกรณ์ที่ค้นหา" : "ยังไม่มีอุปกรณ์ในระบบ"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">ชื่ออุปกรณ์</th>
                      <th className="text-center p-4 font-semibold">จำนวน</th>
                      <th className="text-right p-4 font-semibold">ราคา/หน่วย</th>
                      <th className="text-right p-4 font-semibold">มูลค่ารวม</th>
                      <th className="text-left p-4 font-semibold">รายละเอียด</th>
                      <th className="text-center p-4 font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device) => {
                      const price = parseFloat(device.price) || 0
                      const totalPrice = price * device.amount_device
                      
                      return (
                        <tr key={device.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{device.devices_name}</div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              {device.amount_device} ชิ้น
                            </Badge>
                          </td>
                          <td className="p-4 text-right font-medium text-green-700">
                            {price.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                          </td>
                          <td className="p-4 text-right font-semibold text-green-700">
                            {totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                            {device.detail_device || "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDevice(device)}
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDevice(device)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Dialog */}
      <DeviceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        device={selectedDevice}
        onSuccess={fetchDevices}
      />
    </div>
  )
}
