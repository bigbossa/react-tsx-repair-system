'use client'

import { useState, useEffect } from 'react'
import { Asset } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, Monitor, Plus } from 'lucide-react'
import { AddAssetDialog } from './add-asset-dialog'

export default function AssetsTable() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const fetchAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
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

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAssets()
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-6 w-6" />
            รายการทรัพย์สิน (Assets)
          </CardTitle>
          <CardDescription>
            ข้อมูลทรัพย์สินจากฐานข้อมูล RepairRequest - ทั้งหมด {assets.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาจาก asset code, user, device, brand, serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหา'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSearch('')
                  fetchAssets()
                }}
              >
                ล้าง
              </Button>
            </form>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              เพิ่มข้อมูล
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Asset Code</TableHead>
                    <TableHead>ผู้ใช้งาน</TableHead>
                    <TableHead>สาขา</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>อุปกรณ์</TableHead>
                    <TableHead>ยี่ห้อ</TableHead>
                    <TableHead>CPU</TableHead>
                    <TableHead>RAM</TableHead>
                    <TableHead>HDD</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>หมายเลข</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ราคา</TableHead>
                    <TableHead>วันที่ซื้อ</TableHead>
                    <TableHead>Ref Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={18} className="text-center py-8 text-muted-foreground">
                        ไม่พบข้อมูล
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset.asset_code}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{asset.asset_code}</Badge>
                        </TableCell>
                        <TableCell>{asset.user_name}</TableCell>
                        <TableCell>{asset.site}</TableCell>
                        <TableCell>{asset.department}</TableCell>
                        <TableCell>{asset.device_name}</TableCell>
                        <TableCell>{asset.brand}</TableCell>
                        <TableCell className="text-sm">{asset.cpu}</TableCell>
                        <TableCell className="text-sm">{asset.ram}</TableCell>
                        <TableCell className="text-sm">{asset.harddisk}</TableCell>
                        <TableCell className="font-mono text-xs">{asset.ip_address}</TableCell>
                        <TableCell className="font-mono text-xs">{asset.mac_address}</TableCell>
                        <TableCell className="font-mono text-xs">{asset.serial_number}</TableCell>
                        <TableCell>{asset.number}</TableCell>
                        <TableCell className="text-sm">{asset.license}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{asset.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{asset.cost}</TableCell>
                        <TableCell>{asset.purchase_date}</TableCell>
                        <TableCell>{asset.ref_devicename}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddAssetDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchAssets}
      />
    </div>
  )
}
