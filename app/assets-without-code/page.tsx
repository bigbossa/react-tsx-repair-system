'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Hash, AlertTriangle, FileText, RefreshCw, CheckCircle2, Eye, Pencil, Search } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Swal from 'sweetalert2'

export default function AssetsWithoutCodePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assetsWithoutCode, setAssetsWithoutCode] = useState<Asset[]>([])
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Asset>>({})
  const [saving, setSaving] = useState(false)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [selectedSite, setSelectedSite] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')

  useEffect(() => {
    if (user) {
      checkAssetsWithoutCode()
    }
  }, [user])

  const checkAssetsWithoutCode = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/repair/api/assets/export')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data) {
        setAssetsWithoutCode([])
        return
      }

      // กรองทรัพย์สินที่ไม่มีรหัสทรัพย์สิน
      const noCodeAssets = result.data.filter((asset: Asset) => {
        const assetCode = asset.asset_code?.trim()
        return !assetCode || assetCode === '' || assetCode === '-' || assetCode === 'null'
      })

      setAssetsWithoutCode(noCodeAssets)
      setLastChecked(new Date().toLocaleString('th-TH'))
    } catch (error) {
      console.error('Error checking assets without code:', error)
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันกรองข้อมูล
  const filteredAssets = assetsWithoutCode.filter((asset) => {
    // กรองตามบริษัท
    if (selectedCompany !== 'all' && asset.company !== selectedCompany) {
      return false
    }

    // กรองตามสาขา
    if (selectedSite !== 'all' && asset.site !== selectedSite) {
      return false
    }

    // กรองตามหมวดหมู่
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
      return false
    }

    // กรองตามแผนก
    if (selectedDepartment !== 'all' && asset.department !== selectedDepartment) {
      return false
    }

    // ค้นหา
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        asset.asset_code?.toLowerCase().includes(query) ||
        asset.user_name?.toLowerCase().includes(query) ||
        asset.userid?.toLowerCase().includes(query) ||
        asset.device_name?.toLowerCase().includes(query) ||
        asset.ref_devicename?.toLowerCase().includes(query) ||
        asset.category?.toLowerCase().includes(query) ||
        asset.company?.toLowerCase().includes(query) ||
        asset.site?.toLowerCase().includes(query) ||
        asset.department?.toLowerCase().includes(query)
      )
    }

    return true
  })

  // ดึงข้อมูล unique values สำหรับ filters
  const companies = Array.from(new Set(assetsWithoutCode.map(a => a.company).filter(Boolean))).sort()
  const sites = Array.from(new Set(assetsWithoutCode.map(a => a.site).filter(Boolean))).sort()
  const categories = Array.from(new Set(assetsWithoutCode.map(a => a.category).filter(Boolean))).sort()
  const departments = Array.from(new Set(assetsWithoutCode.map(a => a.department).filter(Boolean))).sort()

  // ฟังก์ชัน Export PDF
  const exportToPDF = () => {
    if (assetsWithoutCode.length === 0) return

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
          <title>รายงานทรัพย์สินที่ไม่มีรหัสทรัพย์สิน</title>
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
          <h1>📋 รายงานทรัพย์สินที่ไม่มีรหัสทรัพย์สิน (Asset Code)</h1>
          <div class="info">
            <p>วันที่ออกรายงาน: ${timestamp}</p>
            <p>ผู้ออกรายงาน: ${user?.displayName || user?.username || '-'}</p>
          </div>
          <div class="summary">
            <strong>สรุป:</strong> พบทรัพย์สินที่ไม่มีรหัสทรัพย์สิน ${assetsWithoutCode.length} รายการ
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
              ${assetsWithoutCode.map((asset, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${asset.asset_code || '-'}</td>
                  <td>${asset.userid || '-'}</td>
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
          confirmButtonText: 'ตกลง'
        })
        setShowEditDialog(false)
        checkAssetsWithoutCode()
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
              <Hash className="h-8 w-8 text-red-600" />
              ทรัพย์สินที่ไม่มีรหัสทรัพย์สิน
            </h1>
            <p className="text-muted-foreground mt-1">
              ตรวจสอบและจัดการทรัพย์สินที่ยังไม่มี Asset Code
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={checkAssetsWithoutCode} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button onClick={exportToPDF} disabled={assetsWithoutCode.length === 0}>
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

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <Label className="text-xs font-medium mb-2 block">ค้นหา</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหา Asset Code, ผู้ใช้งาน, อุปกรณ์..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Company Filter */}
              <div>
                <Label className="text-xs font-medium mb-2 block">บริษัท</Label>
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
              <div>
                <Label className="text-xs font-medium mb-2 block">สาขา</Label>
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
              <div>
                <Label className="text-xs font-medium mb-2 block">หมวดหมู่</Label>
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
              <div>
                <Label className="text-xs font-medium mb-2 block">แผนก</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Summary */}
            {(searchQuery || selectedCompany !== 'all' || selectedSite !== 'all' || selectedCategory !== 'all' || selectedDepartment !== 'all') && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">ตัวกรองที่ใช้:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    ค้นหา: {searchQuery}
                  </Badge>
                )}
                {selectedCompany !== 'all' && (
                  <Badge variant="secondary">บริษัท: {selectedCompany}</Badge>
                )}
                {selectedSite !== 'all' && (
                  <Badge variant="secondary">สาขา: {selectedSite}</Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary">หมวดหมู่: {selectedCategory}</Badge>
                )}
                {selectedDepartment !== 'all' && (
                  <Badge variant="secondary">แผนก: {selectedDepartment}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCompany('all')
                    setSelectedSite('all')
                    setSelectedCategory('all')
                    setSelectedDepartment('all')
                  }}
                  className="h-6 text-xs"
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={filteredAssets.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${filteredAssets.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {filteredAssets.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">ไม่มีรหัสทรัพย์สิน</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">
                    {filteredAssets.filter(a => a.user_name?.trim()).length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">มีผู้ใช้งาน</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-orange-600">
                    {filteredAssets.filter(a => !a.user_name?.trim() || a.user_name === '-').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">ไม่มีผู้ใช้งาน</p>
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
              <p className="text-2xl font-semibold">ยอดเยี่ยม!</p>
              <p className="text-base text-muted-foreground mt-2">
                {assetsWithoutCode.length === 0 
                  ? 'ทรัพย์สินทั้งหมดมีรหัสทรัพย์สินครบถ้วน' 
                  : 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'}
              </p>
            </div>
          ) : (
            <Card className="border-red-200 shadow-sm">
              <CardHeader className="py-4 px-4 bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-red-800">
                        ไม่มีรหัสทรัพย์สิน (Asset Code)
                      </CardTitle>
                      <CardDescription className="text-sm">
                        แสดง {filteredAssets.length} จาก {assetsWithoutCode.length} รายการ
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
                          {asset.userid ? (
                            <span className="text-sm">{asset.userid}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.user_name ? (
                            <span>{asset.user_name}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">ไม่มี</span>
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
                                  asset_code: '',
                                  user_name: asset.user_name,
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
              ข้อมูลทรัพย์สินที่ไม่มีรหัสทรัพย์สิน
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Asset Code</Label>
                <p className="font-medium text-red-600">{selectedAsset.asset_code || 'ไม่มีรหัสทรัพย์สิน'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">รหัสพนักงาน</Label>
                <p className="font-medium">{selectedAsset.userid || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">ผู้ใช้งาน</Label>
                <p className="font-medium">{selectedAsset.user_name || '-'}</p>
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
              กำหนดรหัสทรัพย์สิน (Asset Code) สำหรับทรัพย์สินนี้
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset_code">รหัสทรัพย์สิน (Asset Code) *</Label>
              <Input
                id="asset_code"
                value={editForm.asset_code || ''}
                onChange={(e) => setEditForm({ ...editForm, asset_code: e.target.value })}
                placeholder="ระบุรหัสทรัพย์สิน เช่น 00-1503-2021-0001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user_name">ผู้ใช้งาน</Label>
              <Input
                id="user_name"
                value={editForm.user_name || ''}
                onChange={(e) => setEditForm({ ...editForm, user_name: e.target.value })}
                placeholder="ชื่อผู้ใช้งาน"
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
            <Button onClick={handleEdit} disabled={saving || !editForm.asset_code?.trim()}>
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
