'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Eye, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Asset } from '@/lib/types'
import { formatDateThai, formatDateTimeThai } from '@/lib/utils'

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: 'asset_code',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
        >
          Asset Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const assetCode = row.getValue('asset_code') as string
      return <Badge variant="outline">{assetCode || '-'}</Badge>
    },
  },
  {
    accessorKey: 'user_id',
    header: 'รหัสพนักงาน',
    cell: ({ row }) => row.getValue('user_id') || '-',
  },
  {
    accessorKey: 'user_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
        >
          ผู้ใช้งาน
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.getValue('user_name') || '-',
  },
  {
    accessorKey: 'company',
    header: 'บริษัท',
    cell: ({ row }) => row.getValue('company') || '-',
  },
  {
    accessorKey: 'site',
    header: 'สาขา',
    cell: ({ row }) => row.getValue('site') || '-',
  },
  {
    accessorKey: 'department',
    header: 'แผนก',
    cell: ({ row }) => row.getValue('department') || '-',
  },
  {
    accessorKey: 'device_name',
    header: 'อุปกรณ์',
    cell: ({ row }) => row.getValue('device_name') || '-',
  },
  {
    accessorKey: 'brand',
    header: 'ยี่ห้อ',
    cell: ({ row }) => row.getValue('brand') || '-',
  },
  {
    accessorKey: 'cpu',
    header: 'CPU',
    cell: ({ row }) => <div className="text-sm">{row.getValue('cpu') || '-'}</div>,
  },
  {
    accessorKey: 'ram',
    header: 'RAM',
    cell: ({ row }) => <div className="text-sm">{row.getValue('ram') || '-'}</div>,
  },
  {
    accessorKey: 'harddisk',
    header: 'HDD',
    cell: ({ row }) => <div className="text-sm">{row.getValue('harddisk') || '-'}</div>,
  },
  {
    accessorKey: 'ip_address',
    header: 'IP Address',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('ip_address') || '-'}</div>,
  },
  {
    accessorKey: 'mac_address',
    header: 'MAC Address',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('mac_address') || '-'}</div>,
  },
  {
    accessorKey: 'serial_number',
    header: 'Serial Number',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('serial_number') || '-'}</div>,
  },
  {
    accessorKey: 'number',
    header: 'หมายเลข',
    cell: ({ row }) => row.getValue('number') || '-',
  },
  {
    accessorKey: 'license',
    header: 'License',
    cell: ({ row }) => {
      const license = row.getValue('license') as string
      return (
        <div className="max-w-[150px] truncate text-sm" title={license || '-'}>
          {license || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'หมวดหมู่',
    cell: ({ row }) => <Badge variant="secondary">{row.getValue('category') || '-'}</Badge>,
  },
  {
    accessorKey: 'cost',
    header: 'ราคา',
    cell: ({ row }) => <div className="text-right">{row.getValue('cost') || '-'}</div>,
  },
  {
    accessorKey: 'purchase_date',
    header: 'วันที่ซื้อ',
    cell: ({ row }) => formatDateThai(row.getValue('purchase_date')),
  },
  {
    accessorKey: 'ref_devicename',
    header: 'Ref Device',
    cell: ({ row }) => row.getValue('ref_devicename') || '-',
  },
]

const ActionsCell = ({ asset, onView, onEdit }: { asset: Asset, onView: (asset: Asset) => void, onEdit: (asset: Asset) => void }) => {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onView(asset)}
        title="ดู"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(asset)}
        title="แก้ไข"
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface AssetsDataTableProps {
  data: Asset[]
  filterSite: string
  filterCategory: string
  filterDepartment: string
  filterCompany: string
  search?: string
  departments?: string[]
  sites?: Array<{ site_code: string; site: string }>
  categories?: Array<{ id: number; category: string }>
  companies?: Array<{ id: number; company_code: string; company_name: string }>
  onFilterSiteChange: (value: string) => void
  onFilterCategoryChange: (value: string) => void
  onFilterDepartmentChange: (value: string) => void
  onFilterCompanyChange: (value: string) => void
  onSearchChange?: (value: string) => void
}

export function AssetsDataTable({ data, filterSite, filterCategory, filterDepartment, filterCompany, search = '', departments = [], sites = [], categories = [], companies = [], onFilterSiteChange, onFilterCategoryChange, onFilterDepartmentChange, onFilterCompanyChange, onSearchChange }: AssetsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchInput, setSearchInput] = React.useState(search)

  // Update local search input when prop changes
  React.useEffect(() => {
    setSearchInput(search)
  }, [search])

  // Debounce search to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && searchInput !== search) {
        onSearchChange(searchInput)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput, search, onSearchChange])
  
  // Create columns with access to sites
  const columnsWithSites = React.useMemo(() => {
    return columns.map(col => {
      if (col.accessorKey === 'site') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            const siteCode = row.getValue('site') as string
            if (!siteCode || siteCode === '-') return '-'
            const site = sites.find(s => s.site_code === siteCode)
            return site ? site.site : siteCode
          }
        }
      }
      return col
    })
  }, [sites])

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    // แสดงเฉพาะคอลัมน์หลักบนหน้าเว็บ
    asset_code: true,      // Asset Code
    user_id: true,         // รหัสพนักงาน (TI)
    user_name: true,       // ผู้ใช้งาน
    site: true,            // สาขา
    department: true,      // แผนก
    device_name: true,     // อุปกรณ์
    ip_address: true,      // IP Address
    mac_address: true,     // MAC Address
    // ซ่อนคอลัมน์เสริม (บันทึกใน DB แต่ไม่แสดงบนหน้าเว็บ)
    brand: false,
    cpu: false,
    harddisk: false,
    ram: false,
    serial_number: false,
    number: false,
    license: false,
    category: false,
    cost: false,
    purchase_date: false,
    ref_devicename: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [viewAsset, setViewAsset] = React.useState<Asset | null>(null)
  const [editAsset, setEditAsset] = React.useState<Asset | null>(null)

  // Use departments from props (fetched via API distinct), fallback to unique from data
  const departmentsFromData = React.useMemo(() => {
    if (departments.length > 0) {
      return [...departments].sort((a, b) => a.localeCompare(b))
    }
    const set = new Set<string>()
    data.forEach(asset => {
      const dept = (asset.department || '').trim()
      if (dept) set.add(dept)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [departments, data])

  const editDepartments = React.useMemo(() => {
    const dept = (editAsset?.department || '').trim()
    if (dept && !departmentsFromData.includes(dept)) {
      return [dept, ...departmentsFromData]
    }
    return departmentsFromData
  }, [departmentsFromData, editAsset])

  const columnsWithSitesAndActions = React.useMemo(
    () => [
      ...columnsWithSites,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ActionsCell
            asset={row.original}
            onView={setViewAsset}
            onEdit={setEditAsset}
          />
        ),
      },
    ],
    [columnsWithSites]
  )

  const table = useReactTable({
    data,
    columns: columnsWithSitesAndActions,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filterCompany} onValueChange={onFilterCompanyChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="กรองตามบริษัท">
              {filterCompany === 'all' 
                ? 'บริษัททั้งหมด' 
                : companies.find(c => c.company_code === filterCompany)?.company_name || filterCompany}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">บริษัททั้งหมด</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.company_code}>
                {company.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSite} onValueChange={onFilterSiteChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="กรองตามสาขา">
              {filterSite === 'all' 
                ? 'สาขาทั้งหมด' 
                : sites.find(s => s.site_code === filterSite)?.site || filterSite}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สาขาทั้งหมด</SelectItem>
            {sites.map(site => (
              <SelectItem key={site.site_code} value={site.site_code}>
                {site.site}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="กรองตามหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.category}>{category.category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDepartment} onValueChange={onFilterDepartmentChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="กรองตามแผนก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">แผนกทั้งหมด</SelectItem>
            {departmentsFromData.map(department => (
              <SelectItem key={department} value={department}>{department}</SelectItem>
            ))}
            {departmentsFromData.length === 0 && (
              <SelectItem value="none" disabled>ไม่มีข้อมูลแผนก</SelectItem>
            )}
          </SelectContent>
        </Select>

        {(filterCompany !== 'all' || filterSite !== 'all' || filterCategory !== 'all' || filterDepartment !== 'all' || searchInput) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              onFilterCompanyChange('all')
              onFilterSiteChange('all')
              onFilterCategoryChange('all')
              onFilterDepartmentChange('all')
              setSearchInput('')
              onSearchChange?.('')
            }}
          >
            ล้างตัวกรอง
          </Button>
        )}
        
        <Input
          placeholder="ค้นหา Asset Code, ผู้ใช้งาน, อุปกรณ์, IP, MAC, Serial..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="flex-1 max-w-md"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              คอลัมน์ <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-primary">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-primary-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const asset = row.original
                const hasUserId = asset.user_id && asset.user_id.trim() !== '' && asset.user_id !== '-'
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={!hasUserId ? 'bg-red-50 hover:bg-red-100' : ''}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="px-2 py-2">
        <div className="text-sm text-muted-foreground">
          แสดง {table.getFilteredRowModel().rows.length} รายการในหน้านี้
        </div>
      </div>

      {/* View Asset Dialog */}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">รายละเอียดทรัพย์สิน</h2>
                <Button variant="ghost" size="icon" onClick={() => setViewAsset(null)}>
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold">Asset Code:</span> {viewAsset.asset_code || '-'}</div>
                <div><span className="font-semibold">รหัสพนักงาน:</span> {viewAsset.user_id || '-'}</div>
                <div><span className="font-semibold">ผู้ใช้งาน:</span> {viewAsset.user_name || '-'}</div>
                <div><span className="font-semibold">บริษัท:</span> {viewAsset.company || '-'}</div>
                <div><span className="font-semibold">สาขา:</span> {viewAsset.site || '-'}</div>
                <div><span className="font-semibold">แผนก:</span> {viewAsset.department || '-'}</div>
                <div><span className="font-semibold">อุปกรณ์:</span> {viewAsset.device_name || '-'}</div>
                <div><span className="font-semibold">ยี่ห้อ:</span> {viewAsset.brand || '-'}</div>
                <div><span className="font-semibold">CPU:</span> {viewAsset.cpu || '-'}</div>
                <div><span className="font-semibold">RAM:</span> {viewAsset.ram || '-'}</div>
                <div><span className="font-semibold">HDD:</span> {viewAsset.harddisk || '-'}</div>
                <div><span className="font-semibold">IP Address:</span> {viewAsset.ip_address || '-'}</div>
                <div><span className="font-semibold">MAC Address:</span> {viewAsset.mac_address || '-'}</div>
                <div><span className="font-semibold">Serial Number:</span> {viewAsset.serial_number || '-'}</div>
                <div><span className="font-semibold">หมายเลข:</span> {viewAsset.number || '-'}</div>
                <div><span className="font-semibold">License OS:</span> {viewAsset.licenseos || viewAsset.licenseOS || '-'}</div>
                <div><span className="font-semibold">License MS:</span> {viewAsset.licensems || viewAsset.licenseMS || '-'}</div>
                <div><span className="font-semibold">License 1:</span> {viewAsset.license1 || '-'}</div>
                <div><span className="font-semibold">License 2:</span> {viewAsset.license2 || '-'}</div>
                <div><span className="font-semibold">License 3:</span> {viewAsset.license3 || '-'}</div>
                <div><span className="font-semibold">License 4:</span> {viewAsset.license4 || '-'}</div>
                <div><span className="font-semibold">หมวดหมู่:</span> {viewAsset.category || '-'}</div>
                <div><span className="font-semibold">ราคา:</span> {viewAsset.cost || '-'}</div>
                <div><span className="font-semibold">วันที่ซื้อ:</span> {formatDateThai(viewAsset.purchase_date)}</div>
                <div><span className="font-semibold">Ref Device:</span> {viewAsset.ref_devicename || '-'}</div>
                <div className="col-span-2 text-xs text-gray-500 border-t pt-2">
                  <span className="font-semibold">สร้างเมื่อ:</span> {formatDateTimeThai(viewAsset.created_at)}
                  {' | '}
                  <span className="font-semibold">แก้ไขล่าสุด:</span> {formatDateTimeThai(viewAsset.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Dialog */}
      {editAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              // แปลงวันที่จาก พ.ศ. (วว/ดด/ปปปป) เป็น ค.ศ. (YYYY-MM-DD)
              const purchaseDateThai = formData.get('purchase_date') as string
              let purchaseDateISO = ''
              if (purchaseDateThai && purchaseDateThai.includes('/')) {
                const [day, month, yearBE] = purchaseDateThai.split('/')
                const yearAD = parseInt(yearBE) - 543
                purchaseDateISO = `${yearAD}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
              } else {
                purchaseDateISO = purchaseDateThai
              }
              
              const updatedAsset = {
                asset_code: formData.get('asset_code') as string,
                user_id: formData.get('user_id') as string,
                user_name: formData.get('user_name') as string,
                site: formData.get('site') as string,
                department: formData.get('department') as string,
                device_name: formData.get('device_name') as string,
                brand: formData.get('brand') as string,
                cpu: formData.get('cpu') as string,
                ram: formData.get('ram') as string,
                harddisk: formData.get('harddisk') as string,
                ip_address: formData.get('ip_address') as string,
                mac_address: formData.get('mac_address') as string,
                serial_number: formData.get('serial_number') as string,
                number: formData.get('number') as string,
                licenseos: formData.get('licenseos') as string,
                licensems: formData.get('licensems') as string,
                license1: formData.get('license1') as string,
                license2: formData.get('license2') as string,
                license3: formData.get('license3') as string,
                license4: formData.get('license4') as string,
                category: formData.get('category') as string,
                cost: formData.get('cost') as string,
                purchase_date: purchaseDateISO,
                ref_devicename: formData.get('ref_devicename') as string,
              }
              
              try {
                const response = await fetch(`/repair/api/assets/${editAsset.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedAsset)
                })
                
                const result = await response.json()
                
                if (result.success) {
                  alert('อัพเดทข้อมูลสำเร็จ')
                  setEditAsset(null)
                  window.location.reload()
                } else {
                  alert('เกิดข้อผิดพลาด: ' + result.error)
                }
              } catch (error) {
                console.error('Error updating asset:', error)
                alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล')
              }
            }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">แก้ไขทรัพย์สิน</h2>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditAsset(null)}>
                    ✕
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Asset Code</label>
                    <Input name="asset_code" defaultValue={editAsset.asset_code} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">รหัสพนักงาน</label>
                    <Input name="user_id" defaultValue={editAsset.user_id} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ผู้ใช้งาน</label>
                    <Input name="user_name" defaultValue={editAsset.user_name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">สาขา</label>
                    <Select name="site" defaultValue={editAsset.site}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site.site_code} value={site.site_code}>{site.site} ({site.site_code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">แผนก</label>
                    <Select name="department" defaultValue={editAsset.department}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {editDepartments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                        {editDepartments.length === 0 && (
                          <SelectItem value="none" disabled>ไม่มีข้อมูลแผนก</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">อุปกรณ์</label>
                    <Input name="device_name" defaultValue={editAsset.device_name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ยี่ห้อ</label>
                    <Input name="brand" defaultValue={editAsset.brand} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">CPU</label>
                    <Input name="cpu" defaultValue={editAsset.cpu} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">RAM</label>
                    <Input name="ram" defaultValue={editAsset.ram} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">HDD</label>
                    <Input name="harddisk" defaultValue={editAsset.harddisk} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">IP Address</label>
                    <Input name="ip_address" defaultValue={editAsset.ip_address} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">MAC Address</label>
                    <Input name="mac_address" defaultValue={editAsset.mac_address} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Serial Number</label>
                    <Input name="serial_number" defaultValue={editAsset.serial_number} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">หมายเลข</label>
                    <Input name="number" defaultValue={editAsset.number} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License OS</label>
                    <Input name="licenseos" defaultValue={editAsset.licenseos || editAsset.licenseOS} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License MS Office</label>
                    <Input name="licensems" defaultValue={editAsset.licensems || editAsset.licenseMS} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License 1</label>
                    <Input name="license1" defaultValue={editAsset.license1} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License 2</label>
                    <Input name="license2" defaultValue={editAsset.license2} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License 3</label>
                    <Input name="license3" defaultValue={editAsset.license3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">License 4</label>
                    <Input name="license4" defaultValue={editAsset.license4} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">หมวดหมู่</label>
                    <Select name="category" defaultValue={editAsset.category}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.category}>{cat.category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">ราคา</label>
                    <Input name="cost" defaultValue={editAsset.cost} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">วันที่ซื้อ (วว/ดด/ปปปป)</label>
                    <Input 
                      name="purchase_date" 
                      type="date"
                      defaultValue={formatDateThai(editAsset.purchase_date)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ref Device Name</label>
                    <Input name="ref_devicename" defaultValue={editAsset.ref_devicename} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setEditAsset(null)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">
                    บันทึก
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
