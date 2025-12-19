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
import { Search, Loader2, Monitor, Plus, FileUp, FileDown, ArrowLeft, Settings, Pencil, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { AddAssetDialog } from '@/components/add-asset-dialog'
import { ImportExcelDialog } from '@/components/import-excel-dialog'
import { AssetsDataTable } from '@/components/assets-data-table'

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

  const handleExportExcel = async (selectedSite: string = 'all') => {
    try {
      console.log('Starting export with site filter:', selectedSite)
      
      // ดึงข้อมูลทั้งหมดจาก API โดยไม่ผ่าน filter
      const response = await fetch('/api/assets/export')
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
        'Asset Code': a.asset_code || '',
        'User ID': a.user_id || '',
        'User Name': a.user_name || '',
        'Company': a.company || '',
        'Site': a.site || '',
        'Department': a.department || '',
        'Device Name': a.device_name || '',
        'Brand': a.brand || '',
        'CPU': a.cpu || '',
        'Harddisk': a.harddisk || '',
        'RAM': a.ram || '',
        'IP Address': a.ip_address || '',
        'MAC Address': a.mac_address || '',
        'Serial Number': a.serial_number || '',
        'Number': a.number || '',
        'License OS': a.licenseOS || '',
        'License MS': a.licenseMS || '',
        'License 1': a.license1 || '',
        'License 2': a.license2 || '',
        'Category': a.category || '',
        'Cost': a.cost || '',
        'Purchase Date': a.purchase_date || '',
        'Detail': a.Detail || '',
        'Ref Device Name': a.ref_devicename || '',
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
      
      const response = await fetch(`/api/assets?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setAssets(result.data)
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
      const response = await fetch('/api/assets')
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
    fetchAssets()
  }, [filterCompany, filterSite, filterCategory, filterDepartment])

  useEffect(() => {
    fetchAllAssets()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/assets?distinct=department')
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
      const response = await fetch('/api/sites')
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
      const response = await fetch('/api/categories')
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
      const response = await fetch('/api/company')
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
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">ระบบบำรุงรักษา</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-sm">{user?.name || user?.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" title="ตั้งค่า" onClick={() => setShowSettingsDialog(true)}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  เพิ่มข้อมูล
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
            <AssetsDataTable 
              data={assets} 
              filterCompany={filterCompany}
              filterSite={filterSite}
              filterCategory={filterCategory}
              filterDepartment={filterDepartment}
              departments={departments}
              sites={sites}
              categories={categories}
              companies={companies}
              onFilterCompanyChange={setFilterCompany}
              onFilterSiteChange={setFilterSite}
              onFilterCategoryChange={setFilterCategory}
              onFilterDepartmentChange={setFilterDepartment}
            />
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
                                  const response = await fetch(`/api/categories/${category.id}`, {
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
                const response = await fetch(`/api/sites/${editingSite.site_code}`, {
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
                const response = await fetch('/api/sites', {
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
                ? `/api/categories/${editingCategory.id}`
                : '/api/categories'
              
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

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    ข้อมูลที่จะส่งออก
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• รหัสทรัพย์สิน, ผู้ใช้งาน, สาขา, แผนก</li>
                    <li>• รายละเอียดอุปกรณ์ (CPU, RAM, HDD)</li>
                    <li>• ข้อมูลเครือข่าย (IP, MAC Address)</li>
                    <li>• License และข้อมูลการจัดซื้อ</li>
                  </ul>
                </div>
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
      </main>
    </div>
  )
}
