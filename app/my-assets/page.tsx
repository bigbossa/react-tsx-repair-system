'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, ArrowLeft, Monitor, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Asset {
  id: number
  asset_code: string
  user_id: string
  user_name: string
  site: string
  department: string
  device_name: string
  brand: string
  cpu: string
  ram: string
  harddisk: string
  ip_address: string
  mac_address: string
  serial_number: string
  number: string
  licenseOS: string
  licenseMS: string
  license1: string
  license2: string
  category: string
  cost: string
  purchase_date: string
  Detail: string
  ref_devicename: string
  created_at: string
  updated_at: string
}

export default function MyAssetsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [viewAsset, setViewAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchMyAssets()
  }, [user, router])

  const fetchMyAssets = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // ใช้ username หรือ name ในการค้นหาทรัพย์สิน
      const userId = user.username || user.name
      const response = await fetch(`/api/assets?user_id=${encodeURIComponent(userId)}&user_name=${encodeURIComponent(user.name)}`)
      const result = await response.json()
      
      if (result.success) {
        setAssets(result.data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">ระบบบำรุงรักษา</h1>
              <p className="text-sm text-muted-foreground">ทรัพย์สินของคุณ</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-6 w-6" />
                  ทรัพย์สินของคุณ
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  รายการทรัพย์สินที่ลงทะเบียนในชื่อของคุณ - ทั้งหมด {assets.length} รายการ
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">ไม่พบทรัพย์สินที่ลงทะเบียนในชื่อของคุณ</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-primary">
                      <TableHead className="text-primary-foreground">Asset Code</TableHead>
                      <TableHead className="text-primary-foreground">อุปกรณ์</TableHead>
                      <TableHead className="text-primary-foreground">ประเภท</TableHead>
                      <TableHead className="text-primary-foreground">สาขา</TableHead>
                      <TableHead className="text-primary-foreground">Serial Number</TableHead>
                      <TableHead className="text-primary-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{asset.asset_code || '-'}</Badge>
                        </TableCell>
                        <TableCell>{asset.device_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{asset.category || '-'}</Badge>
                        </TableCell>
                        <TableCell>{asset.site || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{asset.serial_number || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewAsset(asset)}
                            title="ดูรายละเอียด"
                          >
                            <Eye className="h-4 w-4" />
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
      </main>

      {/* View Asset Detail Dialog */}
      {viewAsset && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" 
          onClick={() => setViewAsset(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Monitor className="h-6 w-6 text-blue-600" />
                  รายละเอียดทรัพย์สิน
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setViewAsset(null)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* ข้อมูลพื้นฐาน */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 border-b pb-2">ข้อมูลพื้นฐาน</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">Asset Code</span>
                      <p className="font-semibold">{viewAsset.asset_code || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">ผู้ใช้งาน</span>
                      <p className="font-semibold">{viewAsset.user_name || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">สาขา</span>
                      <p className="font-semibold">{viewAsset.site || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">แผนก</span>
                      <p className="font-semibold">{viewAsset.department || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">หมวดหมู่</span>
                      <p className="font-semibold">{viewAsset.category || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลอุปกรณ์ */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600 border-b pb-2">ข้อมูลอุปกรณ์</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">อุปกรณ์</span>
                      <p className="font-semibold">{viewAsset.device_name || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">ยี่ห้อ</span>
                      <p className="font-semibold">{viewAsset.brand || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">CPU</span>
                      <p className="font-semibold">{viewAsset.cpu || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">RAM</span>
                      <p className="font-semibold">{viewAsset.ram || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">Hard Disk</span>
                      <p className="font-semibold">{viewAsset.harddisk || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">Serial Number</span>
                      <p className="font-semibold font-mono text-sm">{viewAsset.serial_number || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลเครือข่าย */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-purple-600 border-b pb-2">ข้อมูลเครือข่าย</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">IP Address</span>
                      <p className="font-semibold font-mono">{viewAsset.ip_address || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">MAC Address</span>
                      <p className="font-semibold font-mono text-sm">{viewAsset.mac_address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูล License */}
                {(viewAsset.licenseOS || viewAsset.licenseMS || viewAsset.license1 || viewAsset.license2) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-600 border-b pb-2">ข้อมูล License</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {viewAsset.licenseOS && viewAsset.licenseOS !== '-' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">License OS</span>
                          <p className="font-semibold text-sm">{viewAsset.licenseOS}</p>
                        </div>
                      )}
                      {viewAsset.licenseMS && viewAsset.licenseMS !== '-' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">License MS</span>
                          <p className="font-semibold text-sm">{viewAsset.licenseMS}</p>
                        </div>
                      )}
                      {viewAsset.license1 && viewAsset.license1 !== '-' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">License 1</span>
                          <p className="font-semibold text-sm">{viewAsset.license1}</p>
                        </div>
                      )}
                      {viewAsset.license2 && viewAsset.license2 !== '-' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-600">License 2</span>
                          <p className="font-semibold text-sm">{viewAsset.license2}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* รายละเอียดเพิ่มเติม */}
                {viewAsset.Detail && viewAsset.Detail !== '-' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">รายละเอียดเพิ่มเติม</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{viewAsset.Detail}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end border-t pt-4">
                <Button onClick={() => setViewAsset(null)}>ปิด</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
