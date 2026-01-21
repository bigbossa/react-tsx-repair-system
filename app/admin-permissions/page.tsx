'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Loader2, Shield, MapPin, Save, RefreshCw, CheckCircle2, Building2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import Swal from 'sweetalert2'

interface Admin {
  iduser: number
  userid: string
  user_login: string
  name: string
  Role: number
  site?: string
  department?: string
  assignedSites?: string[]
}

interface Site {
  site_code: string
  site: string
}

export default function AdminPermissionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [showSitesDialog, setShowSitesDialog] = useState(false)
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchAdmins()
    fetchSites()
  }, [user])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        // กรองเฉพาะ Admin (Role === 0)
        const adminUsers = result.data.filter((u: Admin) => u.Role === 0)
        
        // ดึงข้อมูลสาขาที่แต่ละ Admin รับผิดชอบ
        const adminsWithSites = await Promise.all(
          adminUsers.map(async (admin: Admin) => {
            try {
              const siteResponse = await apiFetch(`/api/admin-sites?user_id=${encodeURIComponent(admin.user_login)}`)
              const siteResult = await siteResponse.json()
              if (siteResult.success && siteResult.data) {
                admin.assignedSites = siteResult.data.map((item: any) => item.site_code)
              } else {
                admin.assignedSites = []
              }
            } catch {
              admin.assignedSites = []
            }
            return admin
          })
        )
        
        setAdmins(adminsWithSites)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await apiFetch('/api/sites')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setSites(result.data)
      }
    } catch (err) {
      console.error('Error fetching sites:', err)
    }
  }

  const handleManageSites = (admin: Admin) => {
    setSelectedAdmin(admin)
    setSelectedSites(admin.assignedSites || [])
    setShowSitesDialog(true)
  }

  const handleSaveSites = async () => {
    if (!selectedAdmin) return

    try {
      setSaving(true)
      const response = await apiFetch('/api/admin-sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedAdmin.user_login,
          site_codes: selectedSites
        })
      })

      const result = await response.json()

      if (result.success) {
        // อัปเดต state
        setAdmins(prev => prev.map(admin => {
          if (admin.user_login === selectedAdmin.user_login) {
            return { ...admin, assignedSites: selectedSites }
          }
          return admin
        }))

        setShowSitesDialog(false)
        
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `กำหนดสาขาที่รับผิดชอบ ${selectedSites.length} สาขา สำหรับ ${selectedAdmin.name}`,
          timer: 2000
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedSites.length === sites.length) {
      setSelectedSites([])
    } else {
      setSelectedSites(sites.map(s => s.site_code))
    }
  }

  const toggleSite = (siteCode: string) => {
    setSelectedSites(prev => 
      prev.includes(siteCode)
        ? prev.filter(s => s !== siteCode)
        : [...prev, siteCode]
    )
  }

  const filteredAdmins = admins.filter(admin => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      admin.user_login.toLowerCase().includes(searchLower) ||
      admin.name.toLowerCase().includes(searchLower)
    )
  })

  if (!user || user.role !== 'admin') {
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
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    สิทธิ์ Admin - กำหนดสาขาที่รับผิดชอบ
                  </CardTitle>
                  <CardDescription className="mt-1">
                    จัดการว่า Admin แต่ละคนสามารถเห็นงานซ่อมของสาขาใดได้บ้าง
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={fetchAdmins} 
                variant="outline" 
                className="gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                รีเฟรช
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา Admin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-cyan-200 bg-cyan-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-cyan-600">{admins.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Admin ทั้งหมด</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">
                      {admins.filter(a => (a.assignedSites?.length || 0) > 0).length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">กำหนดสาขาแล้ว</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{sites.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">สาขาทั้งหมด</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mb-4" />
                <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">ไม่พบ Admin</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Username</TableHead>
                      <TableHead className="font-semibold">ชื่อ-นามสกุล</TableHead>
                      <TableHead className="font-semibold">สาขาที่รับผิดชอบ</TableHead>
                      <TableHead className="font-semibold text-center w-[150px]">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.iduser} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{admin.user_login}</TableCell>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>
                          {(admin.assignedSites?.length || 0) === 0 ? (
                            <Badge variant="outline" className="text-gray-500">
                              ยังไม่ได้กำหนด
                            </Badge>
                          ) : (admin.assignedSites?.length || 0) === sites.length ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              ทุกสาขา ({sites.length})
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {admin.assignedSites?.slice(0, 3).map(siteCode => {
                                const site = sites.find(s => s.site_code === siteCode)
                                return (
                                  <Badge key={siteCode} variant="secondary" className="text-xs">
                                    {site?.site || siteCode}
                                  </Badge>
                                )
                              })}
                              {(admin.assignedSites?.length || 0) > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(admin.assignedSites?.length || 0) - 3} สาขา
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            onClick={() => handleManageSites(admin)}
                            className="gap-2 bg-cyan-500 hover:bg-cyan-600"
                          >
                            <MapPin className="h-4 w-4" />
                            กำหนดสาขา
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sites Selection Dialog */}
        <Dialog open={showSitesDialog} onOpenChange={setShowSitesDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <span>กำหนดสาขาที่รับผิดชอบ</span>
                  {selectedAdmin && (
                    <p className="text-sm font-normal text-muted-foreground mt-1">
                      สำหรับ {selectedAdmin.name} ({selectedAdmin.user_login})
                    </p>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 flex-1 overflow-hidden flex flex-col">
              {/* Select All Button */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedSites.length === sites.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                    เลือกทั้งหมด
                  </label>
                </div>
                <Badge variant="secondary">
                  เลือกแล้ว {selectedSites.length}/{sites.length} สาขา
                </Badge>
              </div>

              {/* Sites List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {sites.map((site) => (
                  <div
                    key={site.site_code}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSites.includes(site.site_code)
                        ? 'bg-cyan-50 border-cyan-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => toggleSite(site.site_code)}
                  >
                    <Checkbox
                      checked={selectedSites.includes(site.site_code)}
                      onCheckedChange={() => toggleSite(site.site_code)}
                    />
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{site.site}</p>
                      <p className="text-xs text-muted-foreground">{site.site_code}</p>
                    </div>
                    {selectedSites.includes(site.site_code) && (
                      <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowSitesDialog(false)}
              >
                ยกเลิก
              </Button>
              <Button 
                onClick={handleSaveSites}
                disabled={saving}
                className="gap-2 bg-cyan-500 hover:bg-cyan-600"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                บันทึก ({selectedSites.length} สาขา)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
