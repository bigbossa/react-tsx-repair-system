'use client'

import { useState, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportExcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

export function ImportExcelDialog({ open, onOpenChange, onSuccess }: ImportExcelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      alert('กรุณาเลือกไฟล์')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Read Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // Read with options to include empty cells and not skip empty rows
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', // Default value for empty cells
        blankrows: false, // Skip completely blank rows
        raw: false // Convert all values to strings first
      })

      console.log(`📊 พบข้อมูลในไฟล์ Excel: ${jsonData.length} แถว`)

      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      const errors: string[] = []

      // ดึงรายการ device_name ที่มีในระบบ
      console.log('🔍 กำลังตรวจสอบ device_name ที่มีในระบบ...')
      const existingDevicesResponse = await apiFetch('/api/assets')
      const existingDevicesResult = await existingDevicesResponse.json()
      const existingDeviceNames = new Set(
        (existingDevicesResult.data || [])
          .map((a: any) => a.device_name)
          .filter((name: string) => name && name.trim() !== '' && name !== '-')
      )
      console.log(`📋 พบ device_name ในระบบ: ${existingDeviceNames.size} รายการ`)

      // Import each row
      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i]
        
        // ฟังก์ชันช่วยดึงค่าจาก row (รองรับพึงภาษาไทยและอังกฤษ)
        const getValue = (...keys: string[]) => {
          for (const key of keys) {
            const val = row[key]
            if (val !== undefined && val !== null && val !== '') {
              const strVal = String(val).trim()
              // กรองค่าที่ไม่ต้องการออก (✓, #N/A, #REF!, etc.)
              if (strVal === '✓' || strVal === '#N/A' || strVal === '#REF!' || 
                  strVal === '#VALUE!' || strVal === '#DIV/0!' || strVal === '#NAME?' ||
                  strVal === '#NUM!' || strVal === '#NULL!' || strVal === '฀') {
                continue
              }
              return strVal
            }
          }
          return ''
        }
        
        // ตรวจสอบว่าแถวนี้มีข้อมูลจริงหรือไม่
        let deviceName = getValue('device_name', 'อุปกรณ์')
        const site = getValue('site', 'สาขา')
        
        // ถ้า device_name ว่าง ให้ใส่ "-"
        if (!deviceName) {
          deviceName = '-'
        }

        // ตรวจสอบว่า device_name ซ้ำหรือไม่ (ถ้าไม่ใช่ "-")
        if (deviceName !== '-' && existingDeviceNames.has(deviceName)) {
          console.log(`⏭️ ข้ามแถวที่ ${i + 2}: device_name "${deviceName}" มีในระบบแล้ว`)
          errors.push(`แถวที่ ${i + 2} (${deviceName}): มีในระบบแล้ว`)
          skippedCount++
          continue
        }

        // Get Asset Code - if empty or '-', use null to allow duplicates
        const assetCodeRaw = getValue('asset_code')
        const assetCode = (assetCodeRaw && assetCodeRaw !== '-') ? assetCodeRaw : null
        
        try {
          // Convert cost to number if possible, otherwise null
          const costValue = getValue('cost', 'ราคา')
          let costNum: number | null = null
          if (costValue) {
            const parsed = parseFloat(costValue.replace(/,/g, ''))
            if (!isNaN(parsed)) {
              costNum = parsed
            }
          }

          // ใช้ฟังก์ชันแยกสำหรับ license เพื่อไม่ให้ซ้อนกัน
          const getLicenseValue = (key: string) => {
            const val = row[key]
            if (val !== undefined && val !== null && val !== '') {
              const strVal = String(val).trim()
              if (strVal === '✓' || strVal === '#N/A' || strVal === '#REF!' || 
                  strVal === '#VALUE!' || strVal === '#DIV/0!' || strVal === '#NAME?' ||
                  strVal === '#NUM!' || strVal === '#NULL!' || strVal === '฀' || strVal === '-') {
                return ''
              }
              return strVal
            }
            return ''
          }

          const license1Val = getLicenseValue('license1')
          const license2Val = getLicenseValue('license2')
          const license3Val = getLicenseValue('license3')
          const license4Val = getLicenseValue('license4')

          // Debug log สำหรับ row แรก
          if (i === 0) {
            console.log('🔍 ตรวจสอบ Row แรก:')
            console.log('  license1:', license1Val || '(ว่าง)')
            console.log('  license2:', license2Val || '(ว่าง)')
            console.log('  license3:', license3Val || '(ว่าง)')
            console.log('  license4:', license4Val || '(ว่าง)')
            console.log('  Column names:', Object.keys(row))
          }

          const assetData = {
            asset_code: assetCode,
            user_id: getValue('user_id') || null,
            user_name: getValue('user_name', 'ผู้ใช้งาน') || null,
            company: getValue('company', 'บริษัท'),
            site: site,
            department: getValue('department', 'แผนก'),
            device_name: deviceName,
            brand: getValue('brand', 'ยี่ห้อ'),
            cpu: getValue('cpu'),
            harddisk: getValue('harddisk'),
            ram: getValue('ram'),
            ip_address: getValue('ip_address'),
            mac_address: getValue('mac_address'),
            serial_number: getValue('serial_number'),
            number: getValue('number'),
            licenseos: getLicenseValue('licenseOS') || getLicenseValue('licenseos'),
            licensems: getLicenseValue('licenseMS') || getLicenseValue('licensems'),
            license1: license1Val,
            license2: license2Val,
            license3: license3Val,
            license4: license4Val,
            category: getValue('category', 'หมวดหมู่'),
            cost: costNum,
            purchase_date: getValue('purchase_date') || null,
            ref_devicename: getValue('ref_devicename')
          }

          console.log(`📝 กำลังเพิ่มแถวที่ ${i + 2}:`, {
            device_name: assetData.device_name || 'N/A',
            site: assetData.site || 'N/A',
            asset_code: assetData.asset_code || 'N/A'
          })

          const response = await apiFetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
          })

          // Check if response is ok before parsing
          if (!response.ok) {
            let errorMessage = 'Failed to add asset'
            try {
              const errorResult = await response.json()
              errorMessage = errorResult.error || errorResult.message || errorMessage
              console.error(`❌ Error แถวที่ ${i + 2}:`, errorResult)
            } catch (parseError) {
              // If JSON parsing fails, use status text
              errorMessage = response.statusText || errorMessage
            }
            const displayName = assetData.device_name || assetData.asset_code || `แถว ${i + 2}`
            errors.push(`แถวที่ ${i + 2} (${displayName}): ${errorMessage}`)
            failedCount++
            continue
          }

          const result = await response.json()

          if (result.success) {
            successCount++
            // เพิ่ม device_name ที่เพิ่มสำเร็จลงใน Set เพื่อป้องกันซ้ำในไฟล์เดียวกัน
            if (assetData.device_name && assetData.device_name !== '-') {
              existingDeviceNames.add(assetData.device_name)
            }
          } else {
            const displayName = assetData.device_name || assetData.asset_code || 'N/A'
            errors.push(`แถวที่ ${i + 2} (${displayName}): ${result.error || 'Failed to add asset'}`)
            failedCount++
          }
        } catch (error) {
          const deviceName = row['device_name'] || row['asset_code'] || 'N/A'
          errors.push(`แถวที่ ${i + 2} (${deviceName}): ${error instanceof Error ? error.message : 'Unknown error'}`)
          failedCount++
        }
      }

      console.log(`✅ สรุปผลการ import:`)
      console.log(`   - สำเร็จ: ${successCount} รายการ`)
      console.log(`   - ล้มเหลว: ${failedCount} รายการ`)
      console.log(`   - ข้าม: ${skippedCount} รายการ`)
      console.log(`   - รวม: ${jsonData.length} แถว`)

      setResult({ 
        success: successCount, 
        failed: failedCount, 
        errors: [
          ...errors,
          ...(skippedCount > 0 ? [`ข้ามแถวว่าง: ${skippedCount} แถว`] : [])
        ]
      })
      
      if (successCount > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error importing Excel:', error)
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            นำเข้าข้อมูลจาก Excel
          </DialogTitle>
          <DialogDescription>
            เลือกไฟล์ Excel (.xlsx, .xls) ที่มีข้อมูลทรัพย์สิน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />
            <label
              htmlFor="excel-file-input"
              className="flex-1 flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {file ? file.name : 'คลิกเพื่อเลือกไฟล์ Excel'}
              </span>
            </label>
          </div>

          {/* Column Mapping Info */}
          <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
            <div>
              <p className="font-semibold mb-2 text-blue-600">⚠️ ข้อกำหนด:</p>
              <ul className="text-xs space-y-1">
                <li>• <strong>หัวตาราง</strong>: ใช้ภาษาไทยหรืออังกฤษก็ได้</li>
                <li>• <strong>แถวที่มีข้อมูล</strong>: ต้องมีอย่างน้อย <span className="text-red-600 font-bold">สาขา/site</span> หรือ <span className="text-red-600 font-bold">อุปกรณ์/device_name</span></li>
                <li>• <strong>แถวว่าง</strong>: จะถูกข้ามโดยอัตโนมัติ</li>
                <li>• <strong>asset_code</strong>: ถ้าไม่มีหรือเป็น "-" จะบันทึกเป็น null</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">ชื่อคอลัมน์ที่รองรับ (ภาษาไทย / อังกฤษ):</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-slate-100 p-3 rounded">
                <div>• asset_code</div>
                <div>• user_id</div>
                <div>• user_name</div>
                <div>• company</div>
                <div>• <strong className="text-red-600">site</strong></div>
                <div>• department</div>
                <div>• <strong className="text-red-600">device_name</strong></div>
                <div>• brand</div>
                <div>• cpu</div>
                <div>• harddisk</div>
                <div>• ram</div>
                <div>• ip_address</div>
                <div>• mac_address</div>
                <div>• serial_number</div>
                <div>• number</div>
                <div>• licenseOS</div>
                <div>• licenseMS</div>
                <div>• license1</div>
                <div>• license2</div>
                <div>• license3</div>
                <div>• license4</div>
                <div>• category</div>
                <div>• cost</div>
                <div>• purchase_date</div>
                <div>• ref_devicename</div>
              </div>
            </div>
          </div>

          {/* Import Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">สำเร็จ: {result.success} รายการ</span>
                </div>
                {result.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">ล้มเหลว: {result.failed} รายการ</span>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="bg-destructive/10 p-3 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm font-semibold text-destructive mb-2">ข้อผิดพลาด:</p>
                  <ul className="text-xs space-y-1 text-destructive">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {result ? 'ปิด' : 'ยกเลิก'}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังนำเข้า...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  นำเข้าข้อมูล
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
