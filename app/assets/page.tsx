'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Loader2, Monitor, Plus, FileUp, FileDown, ArrowLeft, Settings, Pencil, Trash2, Copy, AlertTriangle, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { AddAssetDialog } from '@/components/add-asset-dialog'
import { ImportExcelDialog } from '@/components/import-excel-dialog'
import { AssetsDataTable } from '@/components/assets-data-table'
import { AppHeader } from '@/components/app-header'

export default function AssetsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [filterSite, setFilterSite] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [departments, setDepartments] = useState<string[]>([])
  const [sites, setSites] = useState<Array<{ site_code: string; site: string }>>([])
  const [loadingSites, setLoadingSites] = useState(true)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('categories')
  const [editingSite, setEditingSite] = useState<{ site_code: string; site: string } | null>(null)
  const [showAddSiteDialog, setShowAddSiteDialog] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: number; category: string }>>([])
  const [editingCategory, setEditingCategory] = useState<{ id: number; category: string } | null>(null)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [companies, setCompanies] = useState<Array<{ id: number; company_code: string; company_name: string }>>([])
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportSiteFilter, setExportSiteFilter] = useState('all')
  const [allAssets, setAllAssets] = useState<Asset[]>([]) // เก็บข้อมูลทั้งหมดสำหรับการส่งออก
  const [loadingAllAssets, setLoadingAllAssets] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalAssets, setTotalAssets] = useState(0)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateAssets, setDuplicateAssets] = useState<{ asset_code: string; count: number; items: Asset[] }[]>([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)

  const handleExportExcel = async (selectedSite: string = 'all') => {
    try {
      console.log('Starting export with site filter:', selectedSite)
      
      // ดึงข้อมูลทั้งหมดจาก API โดยไม่ผ่าน filter
      const response = await fetch('/repair/api/assets/export')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Export result:', result)
      
      if (!result.success || !result.data || result.data.length === 0) {
        alert('ไม่มีข้อมูลที่จะ export')
        return
      }

      // กรองข้อมูลตามสาขาที่เลือก
      let filteredData = result.data
      if (selectedSite !== 'all') {
        filteredData = result.data.filter((a: Asset) => a.site === selectedSite)
        if (filteredData.length === 0) {
          alert(`ไม่มีข้อมูลสำหรับสาขา "${selectedSite}"`)
          return
        }
      }

      // เลือกฟิลด์ทั้งหมดสำหรับ export ตาม Database Schema
      const exportData = filteredData.map((a: Asset) => ({
        'asset_code': a.asset_code || '',
        'user_id': a.user_id || '',
        'user_name': a.user_name || '',
        'company': a.company || '',
        'site': a.site || '',
        'department': a.department || '',
        'device_name': a.device_name || '',
        'brand': a.brand || '',
        'cpu': a.cpu || '',
        'harddisk': a.harddisk || '',
        'ram': a.ram || '',
        'ip_address': a.ip_address || '',
        'mac_address': a.mac_address || '',
        'serial_number': a.serial_number || '',
        'number': a.number || '',
        'licenseOS': a.licenseos || a.licenseOS || '',
        'licenseMS': a.licensems || a.licenseMS || '',
        'license1': a.license1 || '',
        'license2': a.license2 || '',
        'license3': a.license3 || '',
        'license4': a.license4 || '',
        'category': a.category || '',
        'cost': a.cost || '',
        'purchase_date': a.purchase_date || '',
        'ref_devicename': a.ref_devicename || '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets')
      
      // สร้างชื่อไฟล์พร้อม timestamp และสาขา
      const timestamp = new Date().toISOString().split('T')[0]
      const siteName = selectedSite === 'all' ? 'all' : selectedSite.replace(/\s+/g, '_')
      XLSX.writeFile(workbook, `assets_${siteName}_${timestamp}.xlsx`)
      
      setShowExportDialog(false)
      setExportSiteFilter('all')
      alert(`Export สำเร็จ! ข้อมูล ${exportData.length} รายการ${selectedSite !== 'all' ? ` (สาขา: ${selectedSite})` : ''}`)
    } catch (error) {
      console.error('Error exporting:', error)
      alert(`เกิดข้อผิดพลาดในการ export: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ฟังก์ชันตรวจสอบ Asset Code ที่ซ้ำกัน
  const checkDuplicateAssetCodes = async () => {
    try {
      setCheckingDuplicates(true)
      
      // ดึงข้อมูลทั้งหมด
      const response = await fetch('/repair/api/assets/export')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data) {
        alert('ไม่สามารถดึงข้อมูลได้')
        return
      }

      // นับจำนวน Asset Code ที่ซ้ำกัน (ยกเว้น Monitor ที่สามารถซ้ำได้)
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
        .sort((a, b) => b.count - a.count) // เรียงตามจำนวนที่ซ้ำมากที่สุด

      setDuplicateAssets(duplicates)
      setShowDuplicateDialog(true)
    } catch (error) {
      console.error('Error checking duplicates:', error)
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCheckingDuplicates(false)
    }
  }

  // ฟังก์ชัน Export PDF สำหรับข้อมูลที่ซ้ำกัน
  const exportDuplicatesToPDF = () => {
    if (duplicateAssets.length === 0) return

    // สร้าง HTML content สำหรับ PDF
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
            <span><strong>${duplicateAssets.reduce((sum, d) => sum + d.count, 0)}</strong> รายการ</span>
          </div>
        </div>

        <div class="note">
          <strong>หมายเหตุ:</strong> หมวดหมู่ Monitor จะไม่ถูกนับรวม เนื่องจากสามารถใช้ Asset Code ร่วมกันได้
        </div>
    `

    duplicateAssets.forEach((dup, idx) => {
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

    // เปิดหน้าต่างใหม่และพิมพ์
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // รอให้โหลดเสร็จแล้วค่อยพิมพ์
      printWindow.onload = () => {
        printWindow.print()
      }
      
      // Fallback สำหรับบาง browser
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } else {
      alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต popup')
    }
  }

  const fetchAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterCompany !== 'all') params.append('company', filterCompany)
      if (filterSite !== 'all') params.append('site', filterSite)
      if (filterCategory !== 'all') params.append('category', filterCategory)
      if (filterDepartment !== 'all') params.append('department', filterDepartment)
      params.append('page', page.toString())
      params.append('pageSize', pageSize.toString())
      
      console.log('Fetching assets with filters:', {
        search,
        filterCompany,
        filterSite,
        filterCategory,
        filterDepartment,
        page,
        pageSize,
        params: params.toString()
      })
      
      const response = await fetch(`/repair/api/assets?${params.toString()}`)
      const result = await response.json()
      
      console.log('Assets fetched:', {
        success: result.success,
        count: result.data?.length,
        total: result.total,
        sample: result.data?.slice(0, 3)
      })
      
      if (result.success) {
        setAssets(result.data)
        setTotalAssets(result.total || result.data.length)
      } else {
        setError(result.error || 'Failed to fetch assets')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllAssets = async () => {
    try {
      setLoadingAllAssets(true)
      // ใช้ API export ที่ดึงข้อมูลทั้งหมดโดยไม่มี pagination
      const response = await fetch('/repair/api/assets/export')
      const result = await response.json()
      if (result.success) {
        console.log('All assets loaded:', result.data.length)
        console.log('Sample sites:', result.data.slice(0, 5).map((a: Asset) => a.site))
        setAllAssets(result.data)
      }
    } catch (err) {
      console.error('Error fetching all assets:', err)
    } finally {
      setLoadingAllAssets(false)
    }
  }

  const handleOpenExportDialog = async () => {
    setShowExportDialog(true)
    if (allAssets.length === 0) {
      await fetchAllAssets()
    }
  }

  useEffect(() => {
    setPage(1) // Reset to page 1 when filters change
  }, [filterCompany, filterSite, filterCategory, filterDepartment])

  useEffect(() => {
    fetchAssets()
  }, [page, filterCompany, filterSite, filterCategory, filterDepartment, search])

  useEffect(() => {
    fetchAllAssets()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/repair/api/assets?distinct=department')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setDepartments(result.data)
      }
    } catch (err) {
      console.error('Error fetching departments:', err)
    }
  }

  const fetchSites = async () => {
    try {
      setLoadingSites(true)
      const response = await fetch('/repair/api/sites')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setSites(result.data)
      }
    } catch (err) {
      console.error('Error fetching sites:', err)
    } finally {
      setLoadingSites(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/repair/api/categories')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        // เรียง ID จากน้อยไปมาก
        const sortedData = result.data.sort((a: { id: number }, b: { id: number }) => a.id - b.id)
        setCategories(sortedData)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/repair/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchSites()
    fetchCategories()
    fetchCompanies()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAssets()
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-6 w-6" />
                  รายการทรัพย์สิน (Assets)
                </CardTitle>
                <CardDescription className="mt-1">
                  ข้อมูลทรัพย์สินจากฐานข้อมูล Assets - ทั้งหมด {assets.length} รายการ
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" size="icon" title="ตั้งค่า" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={checkDuplicateAssetCodes} 
                  variant="outline" 
                  className="gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                  disabled={checkingDuplicates}
                >
                  {checkingDuplicates ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  เช็คซ้ำ
                </Button>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  เพิ่มข้อมูล
                </Button>
                <Button 
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '/repair/Frome-Req.xlsx'
                    link.download = 'Template_Assets.xlsx'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }} 
                  variant="outline" 
                  className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <FileDown className="h-4 w-4" />
                  Template
                </Button>
                <Button onClick={() => setShowImportDialog(true)} variant="outline" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  นำเข้าจาก Excel
                </Button>
                <Button onClick={handleOpenExportDialog} variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  ส่งออกเป็น Excel
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <AssetsDataTable 
                data={assets} 
                filterCompany={filterCompany}
                filterSite={filterSite}
                filterCategory={filterCategory}
                filterDepartment={filterDepartment}
                search={search}
                departments={departments}
                sites={sites}
                categories={categories}
                companies={companies}
                onFilterCompanyChange={setFilterCompany}
                onFilterSiteChange={setFilterSite}
                onFilterCategoryChange={setFilterCategory}
                onFilterDepartmentChange={setFilterDepartment}
                onSearchChange={setSearch}
              />
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    แสดง {pageSize === totalAssets ? 'ทั้งหมด' : `${((page - 1) * pageSize) + 1} - ${Math.min(page * pageSize, totalAssets)}`} จาก {totalAssets} รายการ
                  </p>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      const newSize = value === 'all' ? totalAssets : parseInt(value)
                      setPageSize(newSize)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 รายการ</SelectItem>
                      <SelectItem value="100">100 รายการ</SelectItem>
                      <SelectItem value="200">200 รายการ</SelectItem>
                      <SelectItem value="500">500 รายการ</SelectItem>
                      <SelectItem value="all">แสดงทั้งหมด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || pageSize >= totalAssets}
                  >
                    ก่อนหน้า
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">หน้า {pageSize >= totalAssets ? '1 / 1' : `${page} / ${Math.ceil(totalAssets / pageSize)}`}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(totalAssets / pageSize) || pageSize >= totalAssets}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AddAssetDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchAssets}
        departments={departments}
        sites={sites}
        categories={categories}
        companies={companies}
      />

      <ImportExcelDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={fetchAssets}
      />

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ตั้งค่าระบบ
            </DialogTitle>
            <DialogDescription>
              จัดการข้อมูลประเภททรัพย์สิน
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full mt-4">

              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setShowAddCategoryDialog(true)}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มประเภท
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">ประเภท</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-t hover:bg-muted/30">
                          <td className="p-3">{category.id}</td>
                          <td className="p-3">{category.category}</td>
                          <td className="p-3 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCategory(category)
                                setShowAddCategoryDialog(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (!confirm(`ต้องการลบประเภท "${category.category}" หรือไม่?`)) return
                                
                                try {
                                  const response = await fetch(`/repair/api/categories/${category.id}`, {
                                    method: 'DELETE'
                                  })
                                  const result = await response.json()
                                  
                                  if (result.success) {
                                    alert('ลบประเภทสำเร็จ')
                                    fetchCategories()
                                  } else {
                                    alert('ไม่สามารถลบได้: ' + (result.error || 'Unknown error'))
                                  }
                                } catch (error) {
                                  console.error('Error deleting category:', error)
                                  alert('เกิดข้อผิดพลาดในการลบประเภท')
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSiteDialog} onOpenChange={(open) => {
        setShowAddSiteDialog(open)
        if (!open) setEditingSite(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSite ? 'แก้ไขสาขา' : 'เพิ่มสาขาใหม่'}
            </DialogTitle>
            <DialogDescription>
              {editingSite ? 'แก้ไขข้อมูลสาขา' : 'กรอกข้อมูลสาขาใหม่ที่ต้องการเพิ่ม'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const siteCode = (formData.get('site_code') as string)?.trim()
            const siteName = (formData.get('site_name') as string)?.trim()
            
            console.log('Form submitted:', { siteCode, siteName, editingSite })
            
            if (!siteCode || !siteName) {
              alert('กรุณากรอกข้อมูลให้ครบถ้วน')
              return
            }

            try {
              if (editingSite) {
                // แก้ไขสาขา - ใช้รหัสสาขาเก่าเป็น URL parameter
                const response = await fetch(`/repair/api/sites/${editingSite.site_code}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    site_code: siteCode,  // รหัสสาขาใหม่ (อาจเปลี่ยนหรือเหมือนเดิม)
                    site: siteName 
                  })
                })
                
                const result = await response.json()
                
                if (result.success) {
                  alert(`แก้ไขสาขา "${siteName}" สำเร็จ`)
                  setShowAddSiteDialog(false)
                  setEditingSite(null)
                  fetchSites()
                } else {
                  alert('เกิดข้อผิดพลาด: ' + result.error)
                }
              } else {
                // เพิ่มสาขาใหม่
                const response = await fetch('/repair/api/sites', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ site_code: siteCode, site: siteName })
                })
                
                const result = await response.json()
                
                if (result.success) {
                  alert(`เพิ่มสาขา "${siteName}" สำเร็จ`)
                  setShowAddSiteDialog(false)
                  fetchSites()
                } else {
                  alert('เกิดข้อผิดพลาด: ' + result.error)
                }
              }
            } catch (error) {
              console.error('Error saving site:', error)
              alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
            }
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">รหัสสาขา</label>
                <Input 
                  name="site_code" 
                  placeholder="เช่น Y5, Y1" 
                  defaultValue={editingSite?.site_code}
                  required
                />
                {editingSite && (
                  <p className="text-xs text-muted-foreground">
                    หมายเหตุ: การแก้ไขรหัสสาขาจะส่งผลกระทบต่อข้อมูลที่อ้างอิงถึงรหัสนี้
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ชื่อสาขา</label>
                <Input 
                  name="site_name" 
                  placeholder="เช่น ท่าม่วง, วังสารภี" 
                  defaultValue={editingSite?.site}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddSiteDialog(false)
                setEditingSite(null)
              }}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingSite ? 'บันทึก' : 'เพิ่ม'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={(open) => {
        setShowAddCategoryDialog(open)
        if (!open) setEditingCategory(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'แก้ไขประเภท' : 'เพิ่มประเภท'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const categoryName = formData.get('category') as string

            try {
              const url = editingCategory 
                ? `/repair/api/categories/${editingCategory.id}`
                : '/repair/api/categories'
              
              const response = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: categoryName })
              })
              
              const result = await response.json()
              
              if (result.success) {
                alert(editingCategory ? 'แก้ไขประเภทสำเร็จ' : 'เพิ่มประเภทสำเร็จ')
                setShowAddCategoryDialog(false)
                setEditingCategory(null)
                fetchCategories()
                fetchAssets()
              } else {
                alert('ไม่สามารถบันทึกได้: ' + (result.error || 'Unknown error'))
              }
            } catch (error) {
              console.error('Error saving category:', error)
              alert('เกิดข้อผิดพลาดในการบันทึก')
            }
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ชื่อประเภท</label>
                <Input 
                  name="category" 
                  placeholder="เช่น Computer, Notebook, Printer" 
                  defaultValue={editingCategory?.category}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddCategoryDialog(false)
                setEditingCategory(null)
              }}>
                ยกเลิก
              </Button>
              <Button type="submit">
                {editingCategory ? 'บันทึก' : 'เพิ่ม'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-blue-600" />
              ส่งออกข้อมูลเป็น Excel
            </DialogTitle>
            <DialogDescription>
              เลือกสาขาที่ต้องการส่งออก หรือเลือก "ทั้งหมด" เพื่อส่งออกทุกสาขา
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {loadingAllAssets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    เลือกสาขา
                  </label>
                  <Select value={exportSiteFilter} onValueChange={setExportSiteFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกสาขา..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span className="font-semibold">ทั้งหมด</span>
                          <Badge variant="secondary" className="ml-2">
                            {allAssets.length} รายการ
                          </Badge>
                        </div>
                      </SelectItem>
                      {sites.map((site) => {
                        const siteCount = allAssets.filter(a => a.site === site.site_code).length
                        return (
                          <SelectItem key={site.site_code} value={site.site_code}>
                            <div className="flex items-center justify-between gap-2">
                              <span>{site.site} ({site.site_code})</span>
                              <Badge variant="outline" className="ml-2">
                                {siteCount} รายการ
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {exportSiteFilter === 'all' 
                      ? `จะส่งออกข้อมูลทั้งหมด ${allAssets.length} รายการ`
                      : (() => {
                          const selectedSite = sites.find(s => s.site_code === exportSiteFilter)
                          const count = allAssets.filter(a => a.site === exportSiteFilter).length
                          return `จะส่งออกข้อมูลสาขา "${selectedSite?.site || exportSiteFilter}" ${count} รายการ`
                        })()
                    }
                  </p>
                </div>

                {/* <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ข้อมูลที่จะส่งออก
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• รหัสทรัพย์สิน, ผู้ใช้งาน, สาขา, แผนก</li>
                    <li>• รายละเอียดอุปกรณ์ (CPU, RAM, HDD)</li>
                    <li>• ข้อมูลเครือข่าย (IP, MAC Address)</li>
                    <li>• License และข้อมูลการจัดซื้อ</li>
                  </ul>
                </div> */}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowExportDialog(false)
                setExportSiteFilter('all')
              }}
              disabled={loadingAllAssets}
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={() => handleExportExcel(exportSiteFilter)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={loadingAllAssets || allAssets.length === 0}
            >
              <FileDown className="h-4 w-4" />
              ส่งออก Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicate Asset Code Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${duplicateAssets.length > 0 ? 'bg-orange-100' : 'bg-green-100'}`}>
                {duplicateAssets.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                ) : (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <span>ผลการตรวจสอบ Asset Code ซ้ำ</span>
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  {duplicateAssets.length > 0 
                    ? `พบ ${duplicateAssets.length} Asset Code ที่มีข้อมูลซ้ำกัน (รวม ${duplicateAssets.reduce((sum, d) => sum + d.count, 0)} รายการ)`
                    : 'ไม่พบ Asset Code ที่ซ้ำกัน ✓'}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {duplicateAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-green-600">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold">ไม่พบ Asset Code ซ้ำ!</p>
                <p className="text-base text-muted-foreground mt-2">ข้อมูลทั้งหมดไม่มี Asset Code ที่ซ้ำกัน</p>
                <p className="text-sm text-muted-foreground mt-1">* หมวดหมู่ Monitor จะไม่ถูกนับรวม</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">* หมวดหมู่ Monitor จะไม่ถูกนับรวม เนื่องจากสามารถใช้ Asset Code ร่วมกันได้</p>
                {duplicateAssets.map((dup, idx) => (
                  <Card key={idx} className="border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="py-3 px-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
                            <Copy className="h-4 w-4 text-orange-600" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-orange-800">
                            {dup.asset_code}
                          </CardTitle>
                        </div>
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1">
                          ซ้ำ {dup.count} รายการ
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[50px] text-center font-semibold">#</TableHead>
                              <TableHead className="font-semibold min-w-[120px]">ผู้ใช้งาน</TableHead>
                              <TableHead className="font-semibold min-w-[80px]">บริษัท</TableHead>
                              <TableHead className="font-semibold min-w-[80px]">สาขา</TableHead>
                              <TableHead className="font-semibold min-w-[100px]">แผนก</TableHead>
                              <TableHead className="font-semibold min-w-[120px]">อุปกรณ์</TableHead>
                              <TableHead className="font-semibold min-w-[120px]">IP Address</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dup.items.map((item, itemIdx) => (
                              <TableRow key={itemIdx} className="hover:bg-orange-50/50">
                                <TableCell className="text-center font-medium">{itemIdx + 1}</TableCell>
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
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {duplicateAssets.length > 0 && (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  กรุณาตรวจสอบและแก้ไขข้อมูลที่ซ้ำกัน
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {duplicateAssets.length > 0 && (
                <Button 
                  onClick={() => exportDuplicatesToPDF()} 
                  variant="outline" 
                  size="lg" 
                  className="px-6 gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              )}
              <Button onClick={() => setShowDuplicateDialog(false)} size="lg" className="px-8">
                ปิด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  )
}
