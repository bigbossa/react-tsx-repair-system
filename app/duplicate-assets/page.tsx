'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Copy, AlertTriangle, FileText, RefreshCw, CheckCircle2, Eye, Pencil, Search, X } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type DuplicateAsset = {
  asset_code: string
  count: number
  items: Asset[]
}

export default function DuplicateAssetsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [duplicateAssets, setDuplicateAssets] = useState<DuplicateAsset[]>([])
  const [totalDuplicateItems, setTotalDuplicateItems] = useState(0)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Asset>>({})
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedSite, setSelectedSite] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  useEffect(() => {
    if (user) {
      checkDuplicates()
    }
  }, [user])

  // กรองข้อมูล Duplicate Assets ตามเงื่อนไข
  const filteredDuplicates = duplicateAssets.filter(dup => {
    // กรองตาม items ที่ตรงกับเงื่อนไข
    const filteredItems = dup.items.filter(item => {
      const matchesSearch = !searchQuery || 
        (item.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCompany = selectedCompany === 'all' || item.company === selectedCompany
      const matchesSite = selectedSite === 'all' || item.site === selectedSite
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment
      
      return matchesSearch && matchesCompany && matchesSite && matchesCategory && matchesDepartment
    })
    
    // เก็บเฉพาะ duplicate group ที่มี items ที่ผ่านการกรอง
    return filteredItems.length > 0
  }).map(dup => ({
    ...dup,
    items: dup.items.filter(item => {
      const matchesSearch = !searchQuery || 
        (item.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCompany = selectedCompany === 'all' || item.company === selectedCompany
      const matchesSite = selectedSite === 'all' || item.site === selectedSite
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment
      
      return matchesSearch && matchesCompany && matchesSite && matchesCategory && matchesDepartment
    }),
    count: dup.items.filter(item => {
      const matchesSearch = !searchQuery || 
        (item.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category?.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCompany = selectedCompany === 'all' || item.company === selectedCompany
      const matchesSite = selectedSite === 'all' || item.site === selectedSite
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment
      
      return matchesSearch && matchesCompany && matchesSite && matchesCategory && matchesDepartment
    }).length
  }))

  // สร้าง arrays ของค่าที่ไม่ซ้ำกันสำหรับ filter dropdowns
  const allItems = duplicateAssets.flatMap(dup => dup.items)
  const companies = Array.from(new Set(allItems.map(item => item.company).filter(Boolean))).sort()
  const sites = Array.from(new Set(allItems.map(item => item.site).filter(Boolean))).sort()
  const categories = Array.from(new Set(allItems.map(item => item.category).filter(Boolean))).sort()
  const departments = Array.from(new Set(allItems.map(item => item.department).filter(Boolean))).sort()

  const filteredTotalDuplicateItems = filteredDuplicates.reduce((sum, d) => sum + d.count, 0)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCompany('all')
    setSelectedSite('all')
    setSelectedCategory('all')
    setSelectedDepartment('all')
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCompany !== 'all',
    selectedSite !== 'all',
    selectedCategory !== 'all',
    selectedDepartment !== 'all'
  ].filter(Boolean).length

  const checkDuplicates = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/repair/api/assets/export')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data) {
        setDuplicateAssets([])
        return
      }

      // นับจำนวน Asset Code ที่ซ้ำกัน (ยกเว้น Monitor)
      const assetCodeCount: Record<string, Asset[]> = {}
      result.data.forEach((asset: Asset) => {
        const code = asset.asset_code?.trim()
        const category = (asset.category || '').toLowerCase()
        
        // ข้าม Monitor เพราะ Monitor สามารถซ้ำ Asset Code ได้
        if (category === 'monitor' || category === 'จอ monitor' || category === 'จอmonitor') {
          return
        }
        
        if (code) {
          if (!assetCodeCount[code]) {
            assetCodeCount[code] = []
          }
          assetCodeCount[code].push(asset)
        }
      })

      // หา Asset Code ที่ซ้ำกัน (มากกว่า 1)
      const duplicates = Object.entries(assetCodeCount)
        .filter(([_, items]) => items.length > 1)
        .map(([asset_code, items]) => ({
          asset_code,
          count: items.length,
          items
        }))
        .sort((a, b) => b.count - a.count)

      setDuplicateAssets(duplicates)
      setTotalDuplicateItems(duplicates.reduce((sum, d) => sum + d.count, 0))
      setLastChecked(new Date().toLocaleString('th-TH'))
    } catch (error) {
      console.error('Error checking duplicates:', error)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชัน Export PDF
  const exportToPDF = () => {
    if (duplicateAssets.length === 0) return

    const timestamp = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>รายงาน Asset Code ที่ซ้ำกัน</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { font-family: 'Sarabun', 'Tahoma', sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 15px; }
          .header h1 { color: #ea580c; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          .summary { background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fed7aa; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .asset-card { margin-bottom: 20px; border: 1px solid #fed7aa; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
          .asset-header { background: linear-gradient(to right, #fff7ed, #ffedd5); padding: 12px 15px; border-bottom: 1px solid #fed7aa; display: flex; justify-content: space-between; align-items: center; }
          .asset-code { font-size: 16px; font-weight: bold; color: #c2410c; }
          .badge { background: #f97316; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 10px 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; font-size: 11px; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          tr:nth-child(even) { background: #fafafa; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 10px; }
          .note { background: #fef3c7; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔍 รายงาน Asset Code ที่ซ้ำกัน</h1>
          <p>วันที่ออกรายงาน: ${timestamp}</p>
        </div>
        
        <div class="summary">
          <div class="summary-row">
            <span><strong>จำนวน Asset Code ที่ซ้ำ:</strong></span>
            <span><strong>${duplicateAssets.length}</strong> รายการ</span>
          </div>
          <div class="summary-row">
            <span><strong>จำนวนข้อมูลที่ซ้ำทั้งหมด:</strong></span>
            <span><strong>${totalDuplicateItems}</strong> รายการ</span>
          </div>
        </div>

        <div class="note">
          <strong>หมายเหตุ:</strong> หมวดหมู่ Monitor จะไม่ถูกนับรวม เนื่องจากสามารถใช้ Asset Code ร่วมกันได้
        </div>
    `

    duplicateAssets.forEach((dup) => {
      htmlContent += `
        <div class="asset-card">
          <div class="asset-header">
            <span class="asset-code">📋 ${dup.asset_code}</span>
            <span class="badge">ซ้ำ ${dup.count} รายการ</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Asset Code</th>
                <th>รหัสพนักงาน</th>
                <th>ผู้ใช้งาน</th>
                <th>บริษัท</th>
                <th>สาขา</th>
                <th>แผนก</th>
                <th>อุปกรณ์</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
      `

      dup.items.forEach((item, itemIdx) => {
        htmlContent += `
          <tr>
            <td style="text-align: center;">${itemIdx + 1}</td>
            <td><strong>${item.asset_code || '-'}</strong></td>
            <td>${item.user_id || '-'}</td>
            <td>${item.user_name || '-'}</td>
            <td>${item.company || '-'}</td>
            <td>${item.site || '-'}</td>
            <td>${item.department || '-'}</td>
            <td>${item.device_name || '-'}</td>
            <td><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${item.ip_address || '-'}</code></td>
          </tr>
        `
      })

      htmlContent += `
            </tbody>
          </table>
        </div>
      `
    })

    htmlContent += `
        <div class="footer">
          <p>รายงานนี้สร้างจากระบบบำรุงรักษา | ระบบจัดการทรัพย์สิน (Assets Management)</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
      }
      
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } else {
      alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต popup')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${duplicateAssets.length > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                  {duplicateAssets.length > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Copy className="h-6 w-6 text-orange-600" />
                    ทรัพย์สินที่ซ้ำกัน
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ตรวจสอบ Asset Code ที่มีข้อมูลซ้ำกันในระบบ
                    {lastChecked && <span className="ml-2 text-xs">• อัปเดตล่าสุด: {lastChecked}</span>}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={checkDuplicates} 
                  variant="outline" 
                  className="gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  ตรวจสอบใหม่
                </Button>
                {duplicateAssets.length > 0 && (
                  <Button 
                    onClick={exportToPDF} 
                    variant="outline" 
                    className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Section */}
            <Card className="mb-6 border-2 border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    ตัวกรองข้อมูล
                  </span>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      ล้างตัวกรอง ({activeFiltersCount})
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ค้นหา</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาทุกฟิลด์..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Company Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">บริษัท</label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="ทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Site Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">สาขา</label>
                    <Select value={selectedSite} onValueChange={setSelectedSite}>
                      <SelectTrigger>
                        <SelectValue placeholder="ทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {sites.map((site) => (
                          <SelectItem key={site} value={site}>
                            {site}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">หมวดหมู่</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="ทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">แผนก</label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="ทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Summary */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">ตัวกรองที่ใช้งาน:</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        ค้นหา: {searchQuery}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                      </Badge>
                    )}
                    {selectedCompany !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        บริษัท: {selectedCompany}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCompany('all')} />
                      </Badge>
                    )}
                    {selectedSite !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        สาขา: {selectedSite}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSite('all')} />
                      </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        หมวดหมู่: {selectedCategory}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                      </Badge>
                    )}
                    {selectedDepartment !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        แผนก: {selectedDepartment}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDepartment('all')} />
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className={filteredDuplicates.length > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${filteredDuplicates.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {filteredDuplicates.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Asset Code ที่ซ้ำ</p>
                    {activeFiltersCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">จาก {duplicateAssets.length} ทั้งหมด</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{filteredTotalDuplicateItems}</p>
                    <p className="text-sm text-muted-foreground mt-1">รายการที่ซ้ำทั้งหมด</p>
                    {activeFiltersCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">จาก {totalDuplicateItems} ทั้งหมด</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">หมายเหตุ</p>
                    <p className="text-xs text-gray-600">หมวดหมู่ Monitor ไม่ถูกนับรวม</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
                <p className="text-lg text-muted-foreground">กำลังตรวจสอบข้อมูล...</p>
              </div>
            ) : filteredDuplicates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-green-600">
                <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <p className="text-2xl font-semibold">
                  {activeFiltersCount > 0 ? 'ไม่พบข้อมูลที่ตรงกับตัวกรอง' : 'ไม่พบ Asset Code ซ้ำ!'}
                </p>
                <p className="text-base text-muted-foreground mt-2">
                  {activeFiltersCount > 0 ? 'ลองเปลี่ยนเงื่อนไขการกรองข้อมูล' : 'ข้อมูลทั้งหมดไม่มี Asset Code ที่ซ้ำกัน'}
                </p>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4 gap-2">
                    <X className="h-4 w-4" />
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDuplicates.map((dup, idx) => (
                  <Card key={idx} className="border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="py-4 px-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center">
                            <Copy className="h-5 w-5 text-orange-600" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-orange-800">
                            {dup.asset_code}
                          </CardTitle>
                        </div>
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 text-sm">
                          ซ้ำ {dup.count} รายการ
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[60px] text-center font-semibold">#</TableHead>
                              <TableHead className="font-semibold min-w-[120px]">Asset Code</TableHead>
                              <TableHead className="font-semibold min-w-[100px]">รหัสพนักงาน</TableHead>
                              <TableHead className="font-semibold min-w-[150px]">ผู้ใช้งาน</TableHead>
                              <TableHead className="font-semibold min-w-[100px]">บริษัท</TableHead>
                              <TableHead className="font-semibold min-w-[100px]">สาขา</TableHead>
                              <TableHead className="font-semibold min-w-[120px]">แผนก</TableHead>
                              <TableHead className="font-semibold min-w-[150px]">อุปกรณ์</TableHead>
                              <TableHead className="font-semibold min-w-[130px]">IP Address</TableHead>
                              <TableHead className="font-semibold w-[100px] text-center">จัดการ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dup.items.map((item, itemIdx) => (
                              <TableRow key={itemIdx} className="hover:bg-orange-50/50">
                                <TableCell className="text-center font-medium">{itemIdx + 1}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">{item.asset_code || '-'}</Badge>
                                </TableCell>
                                <TableCell>{item.user_id || '-'}</TableCell>
                                <TableCell className="font-medium">{item.user_name || '-'}</TableCell>
                                <TableCell>{item.company || '-'}</TableCell>
                                <TableCell>{item.site || '-'}</TableCell>
                                <TableCell>{item.department || '-'}</TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm">
                                    {item.device_name || '-'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <code className="px-2 py-1 rounded bg-gray-100 text-sm font-mono">
                                    {item.ip_address || '-'}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      onClick={() => {
                                        setSelectedAsset(item)
                                        setShowViewDialog(true)
                                      }}
                                      title="ดูรายละเอียด"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                      onClick={() => {
                                        setSelectedAsset(item)
                                        setEditForm(item)
                                        setShowEditDialog(true)
                                      }}
                                      title="แก้ไข"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Asset Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                รายละเอียดทรัพย์สิน
              </DialogTitle>
              <DialogDescription>
                {selectedAsset?.asset_code}
              </DialogDescription>
            </DialogHeader>
            
            {selectedAsset && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Asset Code</p>
                  <p className="font-medium">{selectedAsset.asset_code || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">รหัสพนักงาน</p>
                  <p className="font-medium">{selectedAsset.user_id || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">ชื่อผู้ใช้งาน</p>
                  <p className="font-medium">{selectedAsset.user_name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">บริษัท</p>
                  <p className="font-medium">{selectedAsset.company || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">สาขา</p>
                  <p className="font-medium">{selectedAsset.site || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">แผนก</p>
                  <p className="font-medium">{selectedAsset.department || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">ชื่ออุปกรณ์</p>
                  <p className="font-medium">{selectedAsset.device_name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">หมวดหมู่</p>
                  <p className="font-medium">{selectedAsset.category || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">ยี่ห้อ</p>
                  <p className="font-medium">{selectedAsset.brand || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="font-medium">{selectedAsset.cpu || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">RAM</p>
                  <p className="font-medium">{selectedAsset.ram || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Harddisk</p>
                  <p className="font-medium">{selectedAsset.harddisk || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <code className="font-medium bg-gray-100 px-2 py-1 rounded">{selectedAsset.ip_address || '-'}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">MAC Address</p>
                  <code className="font-medium bg-gray-100 px-2 py-1 rounded">{selectedAsset.mac_address || '-'}</code>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground">Serial Number</p>
                  <p className="font-medium">{selectedAsset.serial_number || '-'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowViewDialog(false)
                  setSelectedAsset(selectedAsset)
                  setEditForm(selectedAsset || {})
                  setShowEditDialog(true)
                }}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                แก้ไข
              </Button>
              <Button onClick={() => setShowViewDialog(false)}>
                ปิด
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Asset Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-orange-600" />
                แก้ไขทรัพย์สิน
              </DialogTitle>
              <DialogDescription>
                {editForm.asset_code}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset_code">Asset Code</Label>
                <Input
                  id="asset_code"
                  value={editForm.asset_code || ''}
                  onChange={(e) => setEditForm({...editForm, asset_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_id">รหัสพนักงาน</Label>
                <Input
                  id="user_id"
                  value={editForm.user_id || ''}
                  onChange={(e) => setEditForm({...editForm, user_id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_name">ชื่อผู้ใช้งาน</Label>
                <Input
                  id="user_name"
                  value={editForm.user_name || ''}
                  onChange={(e) => setEditForm({...editForm, user_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">บริษัท</Label>
                <Input
                  id="company"
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site">สาขา</Label>
                <Input
                  id="site"
                  value={editForm.site || ''}
                  onChange={(e) => setEditForm({...editForm, site: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">แผนก</Label>
                <Input
                  id="department"
                  value={editForm.department || ''}
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device_name">ชื่ออุปกรณ์</Label>
                <Input
                  id="device_name"
                  value={editForm.device_name || ''}
                  onChange={(e) => setEditForm({...editForm, device_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Input
                  id="category"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">ยี่ห้อ</Label>
                <Input
                  id="brand"
                  value={editForm.brand || ''}
                  onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu">CPU</Label>
                <Input
                  id="cpu"
                  value={editForm.cpu || ''}
                  onChange={(e) => setEditForm({...editForm, cpu: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input
                  id="ram"
                  value={editForm.ram || ''}
                  onChange={(e) => setEditForm({...editForm, ram: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harddisk">Harddisk</Label>
                <Input
                  id="harddisk"
                  value={editForm.harddisk || ''}
                  onChange={(e) => setEditForm({...editForm, harddisk: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={editForm.ip_address || ''}
                  onChange={(e) => setEditForm({...editForm, ip_address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  value={editForm.mac_address || ''}
                  onChange={(e) => setEditForm({...editForm, mac_address: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={editForm.serial_number || ''}
                  onChange={(e) => setEditForm({...editForm, serial_number: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={async () => {
                  if (!selectedAsset?.id) return
                  
                  try {
                    setSaving(true)
                    const response = await fetch(`/repair/api/assets/${selectedAsset.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editForm)
                    })
                    
                    const result = await response.json()
                    if (result.success) {
                      setShowEditDialog(false)
                      checkDuplicates() // Refresh data
                      alert('บันทึกสำเร็จ!')
                    } else {
                      alert(`เกิดข้อผิดพลาด: ${result.error}`)
                    }
                  } catch (error) {
                    alert('เกิดข้อผิดพลาดในการบันทึก')
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="gap-2 bg-orange-500 hover:bg-orange-600"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                บันทึก
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
