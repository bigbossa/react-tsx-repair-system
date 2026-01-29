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
import { Loader2, UserX, AlertTriangle, FileText, RefreshCw, CheckCircle2, Eye, Pencil, Search, X } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Swal from 'sweetalert2'

export default function AssetsWithoutUsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assetsWithoutUsers, setAssetsWithoutUsers] = useState<Asset[]>([])
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
      checkAssetsWithoutUsers()
    }
  }, [user])

  // กรองข้อมูลตามเงื่อนไข
  const filteredAssets = assetsWithoutUsers.filter(asset => {
    const matchesSearch = !searchQuery ||
      (asset.asset_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.ip_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       asset.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCompany = selectedCompany === 'all' || asset.company === selectedCompany
    const matchesSite = selectedSite === 'all' || asset.site === selectedSite
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory
    const matchesDepartment = selectedDepartment === 'all' || asset.department === selectedDepartment
    
    return matchesSearch && matchesCompany && matchesSite && matchesCategory && matchesDepartment
  })

  // สร้าง arrays ของค่าที่ไม่ซ้ำกันสำหรับ filter dropdowns
  const companies = Array.from(new Set(assetsWithoutUsers.map(asset => asset.company).filter(Boolean))).sort()
  const sites = Array.from(new Set(assetsWithoutUsers.map(asset => asset.site).filter(Boolean))).sort()
  const categories = Array.from(new Set(assetsWithoutUsers.map(asset => asset.category).filter(Boolean))).sort()
  const departments = Array.from(new Set(assetsWithoutUsers.map(asset => asset.department).filter(Boolean))).sort()

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

  const checkAssetsWithoutUsers = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/repair/api/assets/export')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data) {
        setAssetsWithoutUsers([])
        return
      }

      // กรองทรัพย์สิน(ไม่มีผู้ดูแล)
      const noUserAssets = result.data.filter((asset: Asset) => {
        const userName = asset.user_name?.trim()
        return !userName || userName === '' || userName === '-' || userName === 'null'
      })

      setAssetsWithoutUsers(noUserAssets)
      setLastChecked(new Date().toLocaleString('th-TH'))
    } catch (error) {
      console.error('Error checking assets without users:', error)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชัน Export PDF
  const exportToPDF = () => {
    if (assetsWithoutUsers.length === 0) return

    const timestamp = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>รายงานทรัพย์สิน(ไม่มีผู้ดูแล)</title>
          <style>
            body { 
              font-family: 'Sarabun', Arial, sans-serif; 
              padding: 20px;
              font-size: 14px;
            }
            h1 { 
              text-align: center; 
              color: #dc2626;
              margin-bottom: 10px;
            }
            .info { 
              text-align: center; 
              color: #666; 
              margin-bottom: 20px;
              font-size: 12px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #fee2e2; 
              color: #991b1b;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            .summary {
              background-color: #fef2f2;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #dc2626;
            }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h1>📋 รายงานทรัพย์สิน(ไม่มีผู้ดูแล)</h1>
          <div class="info">
            <p>วันที่ออกรายงาน: ${timestamp}</p>
            <p>ผู้ออกรายงาน: ${user?.displayName || user?.username || '-'}</p>
          </div>
          <div class="summary">
            <strong>สรุป:</strong> พบทรัพย์สิน(ไม่มีผู้ดูแล) ${assetsWithoutUsers.length} รายการ
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">ลำดับ</th>
                <th>Asset Code</th>
                <th>รหัสพนักงาน</th>
                <th>ผู้ใช้งาน</th>
                <th>อุปกรณ์</th>
                <th>หมวดหมู่</th>
                <th>บริษัท</th>
                <th>สาขา</th>
                <th>แผนก</th>
              </tr>
            </thead>
            <tbody>
              ${assetsWithoutUsers.map((asset, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${asset.asset_code || '-'}</td>
                  <td>${asset.user_id || '-'}</td>
                  <td>${asset.user_name || '-'}</td>
                  <td>${asset.device_name || asset.ref_devicename || '-'}</td>
                  <td>${asset.category || '-'}</td>
                  <td>${asset.company || '-'}</td>
                  <td>${asset.site || '-'}</td>
                  <td>${asset.department || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleEdit = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/repair/api/assets/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const result = await response.json()

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'อัปเดตข้อมูลเรียบร้อย',
          confirmButtonText: 'ตรงไป'
        })
        setShowEditDialog(false)
        checkAssetsWithoutUsers()
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserX className="h-8 w-8 text-red-600" />
              ทรัพย์สิน(ไม่มีผู้ดูแล)
            </h1>
            <p className="text-muted-foreground mt-1">
              ตรวจสอบและจัดการทรัพย์สินที่ยังไม่มีผู้ใช้งาน
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={checkAssetsWithoutUsers} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button onClick={exportToPDF} disabled={assetsWithoutUsers.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {lastChecked && (
          <p className="text-sm text-muted-foreground mb-4">
            ตรวจสอบล่าสุด: {lastChecked}
          </p>
        )}

        <div className="space-y-6">
          {/* Filter Section */}
          <Card className="border-2 border-dashed">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={filteredAssets.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${filteredAssets.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {filteredAssets.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">ทรัพย์สิน(ไม่มีผู้ดูแล)</p>
                  {activeFiltersCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">จาก {assetsWithoutUsers.length} ทั้งหมด</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">
                    {filteredAssets.filter(a => a.asset_code?.trim()).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">มี Asset Code</p>
                  {activeFiltersCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">จาก {assetsWithoutUsers.filter(a => a.asset_code?.trim()).length} ทั้งหมด</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600">
                    {filteredAssets.filter(a => !a.asset_code?.trim() || a.asset_code === '-').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">ไม่มี Asset Code</p>
                  {activeFiltersCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">จาก {assetsWithoutUsers.filter(a => !a.asset_code?.trim() || a.asset_code === '-').length} ทั้งหมด</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
              <p className="text-lg text-muted-foreground">กำลังตรวจสอบข้อมูล...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-green-600">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <p className="text-2xl font-semibold">
                {activeFiltersCount > 0 ? 'ไม่พบข้อมูลที่ตรงกับตัวกรอง' : 'ดีมาก!'}
              </p>
              <p className="text-base text-muted-foreground mt-2">
                {activeFiltersCount > 0 ? 'ลองเปลี่ยนเงื่อนไขการกรองข้อมูล' : 'ทรัพย์สินทั้งหมดมีผู้ใช้งานครบถ้วน'}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="mt-4 gap-2">
                  <X className="h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          ) : (
            <Card className="border-red-200 shadow-sm">
              <CardHeader className="py-4 px-4 bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                      <UserX className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-red-800">
                        ไม่มีผู้ใช้งาน
                      </CardTitle>
                      <CardDescription className="text-sm">
                        แสดง {filteredAssets.length} จาก {assetsWithoutUsers.length} รายการที่ยังไม่มีการกำหนดผู้ใช้งาน
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-base px-4 py-1">
                    {filteredAssets.length} รายการ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Asset Code</TableHead>
                      <TableHead>รหัสพนักงาน</TableHead>
                      <TableHead>ผู้ใช้งาน</TableHead>
                      <TableHead>อุปกรณ์</TableHead>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead>บริษัท</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead className="w-32 text-center">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset, idx) => (
                      <TableRow key={idx} className="hover:bg-red-50">
                        <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                        <TableCell>
                          {asset.asset_code ? (
                            <Badge variant="outline">{asset.asset_code}</Badge>
                          ) : (
                            <span className="text-red-500 text-xs">ไม่มี</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.user_id ? (
                            <span className="text-sm">{asset.user_id}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.user_name ? (
                            <span className="text-sm font-medium">{asset.user_name}</span>
                          ) : (
                            <span className="text-red-500 text-xs">ไม่มีผู้ใช้งาน</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {asset.device_name || asset.ref_devicename || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {asset.category || 'ไม่ระบุ'}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.company || '-'}</TableCell>
                        <TableCell>{asset.site || '-'}</TableCell>
                        <TableCell>{asset.department || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setShowViewDialog(true)
                              }}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAsset(asset)
                                setEditForm({
                                  id: asset.id,
                                  asset_code: asset.asset_code,
                                  user_name: '',
                                  company: asset.company,
                                  site: asset.site,
                                  department: asset.department,
                                  device_name: asset.device_name,
                                  category: asset.category
                                })
                                setShowEditDialog(true)
                              }}
                              className="h-8 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>รายละเอียดทรัพย์สิน</DialogTitle>
            <DialogDescription>
              ข้อมูลทรัพย์สิน(ไม่มีผู้ดูแล)
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Asset Code</Label>
                <p className="font-medium">{selectedAsset.asset_code || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">รหัสพนักงาน</Label>
                <p className="font-medium">{selectedAsset.user_id || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ผู้ใช้งาน</Label>
                <p className="font-medium text-red-600">{selectedAsset.user_name || 'ไม่มีผู้ใช้งาน'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">อุปกรณ์</Label>
                <p className="font-medium">{selectedAsset.device_name || selectedAsset.ref_devicename || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">หมวดหมู่</Label>
                <p className="font-medium">{selectedAsset.category || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">บริษัท</Label>
                <p className="font-medium">{selectedAsset.company || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">สาขา</Label>
                <p className="font-medium">{selectedAsset.site || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">แผนก</Label>
                <p className="font-medium">{selectedAsset.department || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Serial Number</Label>
                <p className="font-medium">{selectedAsset.serial_number || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลทรัพย์สิน</DialogTitle>
            <DialogDescription>
              กำหนดผู้ใช้งานสำหรับทรัพย์สินนี้
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user_name">ผู้ใช้งาน *</Label>
              <Input
                id="user_name"
                value={editForm.user_name || ''}
                onChange={(e) => setEditForm({ ...editForm, user_name: e.target.value })}
                placeholder="ระบุชื่อผู้ใช้งาน"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset_code">Asset Code</Label>
              <Input
                id="asset_code"
                value={editForm.asset_code || ''}
                onChange={(e) => setEditForm({ ...editForm, asset_code: e.target.value })}
                placeholder="เลขทรัพย์สิน"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device_name">อุปกรณ์</Label>
              <Input
                id="device_name"
                value={editForm.device_name || ''}
                onChange={(e) => setEditForm({ ...editForm, device_name: e.target.value })}
                placeholder="ชื่ออุปกรณ์"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">บริษัท</Label>
                <Input
                  id="company"
                  value={editForm.company || ''}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="บริษัท"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="site">สาขา</Label>
                <Input
                  id="site"
                  value={editForm.site || ''}
                  onChange={(e) => setEditForm({ ...editForm, site: e.target.value })}
                  placeholder="สาขา"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">แผนก</Label>
              <Input
                id="department"
                value={editForm.department || ''}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="แผนก"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={saving || !editForm.user_name?.trim()}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
