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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Monitor, Pencil, Trash2, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

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

export interface User {
  iduser: number
  userid: string
  user_login: string
  name: string
  Role: number
  site?: string
  department?: string
}

interface UsersDataTableProps {
  data: User[]
  sites: Array<{ site_code: string; site: string }>
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onViewAssets: (user: User) => void
  onManageSites: (user: User) => void
}

export function UsersDataTable({ 
  data, 
  sites, 
  onEdit, 
  onDelete, 
  onViewAssets, 
  onManageSites 
}: UsersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [filterSite, setFilterSite] = React.useState('all')
  const [filterDepartment, setFilterDepartment] = React.useState('all')
  const [filterRole, setFilterRole] = React.useState('all')

  // Get unique departments from data
  const departments = React.useMemo(() => {
    const depts = new Set<string>()
    data.forEach(user => {
      if (user.department) depts.add(user.department)
    })
    return Array.from(depts).sort()
  }, [data])

  // Filter data
  const filteredData = React.useMemo(() => {
    return data.filter(user => {
      // Site filter
      if (filterSite !== 'all' && user.site !== filterSite) return false
      // Department filter
      if (filterDepartment !== 'all' && user.department !== filterDepartment) return false
      // Role filter
      if (filterRole !== 'all') {
        if (filterRole === 'admin' && user.Role !== 0) return false
        if (filterRole === 'user' && user.Role !== 1) return false
      }
      // Global search
      if (globalFilter) {
        const search = globalFilter.toLowerCase()
        return (
          user.user_login?.toLowerCase().includes(search) ||
          user.name?.toLowerCase().includes(search) ||
          user.site?.toLowerCase().includes(search) ||
          user.department?.toLowerCase().includes(search) ||
          user.userid?.toLowerCase().includes(search)
        )
      }
      return true
    })
  }, [data, filterSite, filterDepartment, filterRole, globalFilter])

  const columns: ColumnDef<User>[] = React.useMemo(() => [
    {
      accessorKey: 'user_login',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 -ml-4"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('user_login') || '-'}</span>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 -ml-4"
        >
          ชื่อ-นามสกุล
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('name') || '-',
    },
    {
      accessorKey: 'Role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('Role') as number
        return (
          <Badge variant={role === 0 ? 'default' : 'secondary'}>
            {role === 0 ? 'Admin' : 'User'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'site',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 -ml-4"
        >
          สาขา
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const siteCode = row.getValue('site') as string
        if (!siteCode) return '-'
        const site = sites.find(s => s.site_code === siteCode || s.site === siteCode)
        return site ? site.site : siteCode
      },
    },
    {
      accessorKey: 'department',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 -ml-4"
        >
          แผนก
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue('department') || '-',
    },
    {
      id: 'assets',
      header: 'ทรัพย์สิน',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewAssets(row.original)}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          ดูทรัพย์สิน
        </Button>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end gap-1">
            {user.Role === 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageSites(user)}
                title="กำหนดสาขาที่รับผิดชอบ"
                className="text-blue-600 hover:text-blue-800"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(user)}
              title="แก้ไข"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
              title="ลบ"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [sites, onEdit, onDelete, onViewAssets, onManageSites])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="ค้นหา Username, ชื่อ, สาขา, แผนก..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={filterSite} onValueChange={setFilterSite}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ทุกสาขา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสาขา</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.site_code} value={site.site_code}>
                {site.site} ({site.site_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ทุกแผนก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกแผนก</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="ทุก Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุก Role</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

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
                    {column.id === 'user_login' ? 'Username' :
                     column.id === 'name' ? 'ชื่อ-นามสกุล' :
                     column.id === 'Role' ? 'Role' :
                     column.id === 'site' ? 'สาขา' :
                     column.id === 'department' ? 'แผนก' :
                     column.id === 'assets' ? 'ทรัพย์สิน' :
                     column.id === 'actions' ? 'Actions' :
                     column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        แสดง {table.getRowModel().rows.length} จาก {filteredData.length} รายการ
        {globalFilter && ` (ค้นหา: "${globalFilter}")`}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-primary hover:bg-primary">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-primary-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
              ))
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

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">แสดง</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">รายการต่อหน้า</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            หน้า {table.getState().pagination.pageIndex + 1} จาก{' '}
            {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
