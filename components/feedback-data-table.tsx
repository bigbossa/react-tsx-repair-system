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
import { ArrowUpDown, ChevronDown } from 'lucide-react'

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

interface Feedback {
  form_id: number
  form_name: string
  form_status: string
  form_description: string
  is_active: boolean
  created_at: string
}

const getRatingBadge = (rating: string) => {
  const r = parseInt(rating)
  switch (r) {
    case 5: return "bg-green-100 text-green-800 border-green-300"
    case 4: return "bg-blue-100 text-blue-800 border-blue-300"
    case 3: return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case 2: return "bg-orange-100 text-orange-800 border-orange-300"
    case 1: return "bg-red-100 text-red-800 border-red-300"
    default: return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

const getRatingLabel = (rating: string) => {
  const r = parseInt(rating)
  switch (r) {
    case 5: return "ดีเยี่ยม"
    case 4: return "ดี"
    case 3: return "ปานกลาง"
    case 2: return "พอใช้"
    case 1: return "ไม่พอใจ"
    default: return "-"
  }
}

export const columns: ColumnDef<Feedback>[] = [
  {
    accessorKey: 'form_id',
    header: 'ลำดับ',
    cell: ({ row }) => {
      return <div className="font-medium">{row.index + 1}</div>
    },
  },
  {
    accessorKey: 'form_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          เลขที่คำขอ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const requestId = row.getValue('form_name') as string
      return <span className="font-mono text-blue-600 font-semibold">{requestId}</span>
    },
  },
  {
    accessorKey: 'form_status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ระดับความพึงพอใจ
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('form_status') as string
      return (
        <Badge className={getRatingBadge(status)}>
          {getRatingLabel(status)}
        </Badge>
      )
    },
  },
  {
    id: 'rating_stars',
    header: 'คะแนน',
    cell: ({ row }) => {
      const rating = parseInt(row.original.form_status)
      return (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'form_description',
    header: 'หมายเหตุ',
    cell: ({ row }) => {
      const description = row.getValue('form_description') as string
      return <span className="max-w-xs truncate block">{description || '-'}</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          วันที่ประเมิน
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
]

interface FeedbackDataTableProps {
  data: Feedback[]
  onRowClick?: (feedback: Feedback) => void
  ratingFilter?: string
}

export function FeedbackDataTable({ 
  data, 
  onRowClick,
  ratingFilter = "all" 
}: FeedbackDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Filter data based on rating
  const filteredData = React.useMemo(() => {
    if (ratingFilter === "all") return data
    return data.filter(feedback => feedback.form_status === ratingFilter)
  }, [data, ratingFilter])

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
        pageSize: 10,
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="ค้นหาเลขที่คำขอ..."
          value={(table.getColumn('form_name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('form_name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <div className="flex items-center gap-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="แสดง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 รายการ</SelectItem>
              <SelectItem value="10">10 รายการ</SelectItem>
              <SelectItem value="20">20 รายการ</SelectItem>
              <SelectItem value="50">50 รายการ</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
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
                  ยังไม่มีข้อมูลการประเมิน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          แสดง {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} -{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          จาก {table.getFilteredRowModel().rows.length} รายการ
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ก่อนหน้า
          </Button>
          <div className="text-sm">
            หน้า {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  )
}
