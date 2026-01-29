'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'

interface AddAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  departments?: string[]
  sites?: Array<{ site_code: string; site: string }>
  categories?: Array<{ id: number; category: string }>
  companies?: Array<{ id: number; company_code: string; company_name: string }>
}

export function AddAssetDialog({ open, onOpenChange, onSuccess, departments = [], sites = [], categories = [], companies = [] }: AddAssetDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    asset_code: '',
    user_id: '',
    user_name: '',
    company: '',
    site: '',
    department: '',
    device_name: '',
    brand: '',
    cpu: '',
    harddisk: '',
    ram: '',
    ip_address: '',
    mac_address: '',
    serial_number: '',
    number: '',
    licenseos: '',
    licensems: '',
    license1: '',
    license2: '',
    license3: '',
    license4: '',
    category: '',
    cost: '',
    purchase_date: '',
    ref_devicename: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiFetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        alert('เพิ่มข้อมูลสำเร็จ')
        onSuccess()
        onOpenChange(false)
        // Reset form
        setFormData({
          asset_code: '',
          user_id: '',
          user_name: '',
          company: '',
          site: '',
          department: '',
          device_name: '',
          brand: '',
          cpu: '',
          harddisk: '',
          ram: '',
          ip_address: '',
          mac_address: '',
          serial_number: '',
          number: '',
          licenseos: '',
          licensems: '',
          license1: '',
          license2: '',
          license3: '',
          license4: '',
          category: '',
          cost: '',
          purchase_date: '',
          ref_devicename: ''
        })
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding asset:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerateCode = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = String(now.getFullYear())
      const prefix = `IT${month}${year}`

      // Query existing assets with the same prefix
      const response = await apiFetch(`/api/assets?search=${prefix}&limit=1000`)
      const result = await response.json()

      let sequence = 1
      if (result.success && result.data && result.data.length > 0) {
        // Find the highest sequence number
        const sequences = result.data
          .filter((asset: any) => asset.asset_code?.startsWith(prefix))
          .map((asset: any) => {
            const match = asset.asset_code?.match(/\d{3}$/)
            return match ? parseInt(match[0], 10) : 0
          })
          .filter((seq: number) => !isNaN(seq))
        
        if (sequences.length > 0) {
          sequence = Math.max(...sequences) + 1
        }
      }

      const newCode = `${prefix}${String(sequence).padStart(3, '0')}`
      handleChange('asset_code', newCode)
    } catch (error) {
      console.error('Error generating asset code:', error)
      alert('เกิดข้อผิดพลาดในการสร้างรหัสทรัพย์สิน')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มข้อมูลทรัพย์สิน</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลทรัพย์สินใหม่ลงในตาราง RepairRequest
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asset_code">Asset Code *</Label>
              <div className="flex gap-2">
                <Input
                  id="asset_code"
                  value={formData.asset_code}
                  onChange={(e) => handleChange('asset_code', e.target.value)}
                  required
                  placeholder="IT012026001"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id">รหัสพนักงาน</Label>
              <Input
                id="user_id"
                value={formData.user_id}
                onChange={(e) => handleChange('user_id', e.target.value)}
                placeholder="เช่น Y510106"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_name">ผู้ใช้งาน</Label>
              <Input
                id="user_name"
                value={formData.user_name}
                onChange={(e) => handleChange('user_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">บริษัท</Label>
              <Select
                value={formData.company}
                onValueChange={(value) => handleChange('company', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.company_code}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                  {companies.length === 0 && (
                    <SelectItem value="none" disabled>ไม่มีข้อมูลบริษัท</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">สาขา</Label>
              <Select
                value={formData.site}
                onValueChange={(value) => handleChange('site', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.site_code} value={site.site_code}>
                      {site.site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">แผนก</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแผนก" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                  {departments.length === 0 && (
                    <SelectItem value="none" disabled>ไม่มีข้อมูลแผนก</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device_name">ชื่ออุปกรณ์</Label>
              <Input
                id="device_name"
                value={formData.device_name}
                onChange={(e) => handleChange('device_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">ยี่ห้อ</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpu">CPU</Label>
              <Input
                id="cpu"
                value={formData.cpu}
                onChange={(e) => handleChange('cpu', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ram">RAM</Label>
              <Input
                id="ram"
                value={formData.ram}
                onChange={(e) => handleChange('ram', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="harddisk">Hard Disk</Label>
              <Input
                id="harddisk"
                value={formData.harddisk}
                onChange={(e) => handleChange('harddisk', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleChange('ip_address', e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => handleChange('mac_address', e.target.value)}
                placeholder="00:00:00:00:00:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => handleChange('serial_number', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">หมายเลข</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseos">License OS</Label>
              <Input
                id="licenseos"
                value={formData.licenseos}
                onChange={(e) => handleChange('licenseos', e.target.value)}
                placeholder="Windows, Linux, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensems">License MS Office</Label>
              <Input
                id="licensems"
                value={formData.licensems}
                onChange={(e) => handleChange('licensems', e.target.value)}
                placeholder="Office 365, Office 2019, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license1">License 1</Label>
              <Input
                id="license1"
                value={formData.license1}
                onChange={(e) => handleChange('license1', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license2">License 2</Label>
              <Input
                id="license2"
                value={formData.license2}
                onChange={(e) => handleChange('license2', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license3">License 3</Label>
              <Input
                id="license3"
                value={formData.license3}
                onChange={(e) => handleChange('license3', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license4">License 4</Label>
              <Input
                id="license4"
                value={formData.license4}
                onChange={(e) => handleChange('license4', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">ราคา</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">วันที่ซื้อ</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref_devicename">Ref Device Name</Label>
              <Input
                id="ref_devicename"
                value={formData.ref_devicename}
                onChange={(e) => handleChange('ref_devicename', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'บันทึก'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
