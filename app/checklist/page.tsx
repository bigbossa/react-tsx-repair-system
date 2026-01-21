'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { apiFetch } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Search, Printer, Monitor, CheckCircle2, Building2, ChevronRight, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import Swal from 'sweetalert2'
import { AppHeader } from '@/components/app-header'

interface Asset {
  id: number
  asset_code: string
  user_name: string
  company: string
  site: string
  department: string
  device_name: string
  category: string
}

interface Company {
  id: number
  company_code: string
  company_name: string
}

interface MaintenanceHistory {
  id: number
  asset_code: string
  checklist: any
  remarks: string
  checked_by: string
  checked_at: string
}

const computerChecklist = [
  'ตรวจสอบโปรแกรมที่ละเมิดลิขสิทธิ์',
  'ลบข้อมูลใน Temp และ Recycle Bin ใน Window',
  'Scan Disk และ Disk Defragment',
  'ตรวจเช็ค UPS',
  'ตรวจเช็ค จอภาพ',
  'ทดลองใช้งาน'
]

const printerChecklist = [
  'ทำความสะอาดเครื่องพิมพ์',
  'เพิ่มสารหล่อลื่น',
  'ตรวจสอบปริมาณน้ำหมึกเครื่องพิมพ์',
  'ทดลองใช้งาน'
]

export default function ChecklistPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [sites, setSites] = useState<Array<{ site_code: string; site: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedSite, setSelectedSite] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [checklistItems, setChecklistItems] = useState<boolean[]>([])
  const [remarks, setRemarks] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [checklistDrafts, setChecklistDrafts] = useState<Record<string, { items: boolean[], remarks: string }>>({})
  const [viewingHistory, setViewingHistory] = useState<MaintenanceHistory | null>(null)
  const [isRepairDialogOpen, setIsRepairDialogOpen] = useState(false)
  const [repairProblem, setRepairProblem] = useState('')

  // โหลด state จาก URL parameters
  useEffect(() => {
    const company = searchParams.get('company')
    const site = searchParams.get('site')
    const department = searchParams.get('department')
    
    if (company) setSelectedCompany(company)
    if (site) setSelectedSite(site)
    if (department) setSelectedDepartment(department)
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchAssets()
    fetchCompanies()
    fetchSites()
  }, [user])

  // โหลดประวัติ MA เมื่อเลือกแผนก
  useEffect(() => {
    if (selectedDepartment && selectedCompany && selectedSite) {
      fetchDepartmentMAHistory()
    }
  }, [selectedDepartment, selectedCompany, selectedSite])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      // ดึงข้อมูลทั้งหมดสำหรับหน้า checklist โดยไม่จำกัดจำนวน
      const response = await apiFetch('/api/assets?pageSize=10000')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setAssets(result.data)
        console.log(`Loaded ${result.data.length} assets for checklist`)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await apiFetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setCompanies(data)
        }
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
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

  const fetchDepartmentMAHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await apiFetch(
        `/api/maintenance-records?company=${encodeURIComponent(selectedCompany || '')}&site=${encodeURIComponent(selectedSite || '')}&department=${encodeURIComponent(selectedDepartment || '')}&limit=1000`
      )
      
      if (!response.ok) {
        console.error('Failed to fetch department MA history:', response.status)
        setMaintenanceHistory([])
        return
      }
      
      const result = await response.json()
      if (result.success) {
        setMaintenanceHistory(result.data || [])
        console.log('✓ Loaded MA history:', result.data.length, 'records')
      } else {
        setMaintenanceHistory([])
      }
    } catch (error) {
      console.error('Error fetching department MA history:', error)
      setMaintenanceHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleOpenChecklist = async (asset: Asset) => {
    setSelectedAsset(asset)
    // Printer ใช้ printerChecklist, Computer และ Notebook ใช้ computerChecklist
    const categoryLower = asset.category?.toLowerCase() || ''
    const checklist = categoryLower === 'printer' ? printerChecklist : computerChecklist
    
    // โหลด draft ที่เคยบันทึกไว้ (ถ้ามี)
    const draft = checklistDrafts[asset.asset_code]
    if (draft) {
      setChecklistItems(draft.items)
      setRemarks(draft.remarks)
    } else {
      setChecklistItems(new Array(checklist.length).fill(false))
      setRemarks('')
    }
    
    setIsDialogOpen(true)
    
    // โหลดประวัติการทำ checklist (ไม่ block UI)
    await fetchMaintenanceHistory(asset.asset_code).catch(err => {
      console.error('Failed to load maintenance history:', err)
      // ไม่แสดง error dialog เพราะเป็น optional feature
    })
  }

  const fetchMaintenanceHistory = async (assetCode: string) => {
    try {
      setLoadingHistory(true)
      const response = await apiFetch(`/api/maintenance-records?asset_code=${assetCode}&limit=10`)
      
      if (!response.ok) {
        console.error('Failed to fetch maintenance history:', response.status)
        setMaintenanceHistory([])
        return
      }
      
      const result = await response.json()
      if (result.success) {
        setMaintenanceHistory(result.data || [])
      } else {
        setMaintenanceHistory([])
      }
    } catch (error) {
      console.error('Error fetching maintenance history:', error)
      setMaintenanceHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // ตรวจสอบว่าทำ MA ไปแล้วในช่วง 2 เดือนนี้หรือไม่
  const isMADoneThisMonth = (assetCode: string): boolean => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // คำนวณเดือนก่อนหน้า 1 เดือน (สำหรับรอบ 2 เดือน)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const history = maintenanceHistory.filter(record => record.asset_code === assetCode)
    
    return history.some(record => {
      const recordDate = new Date(record.checked_at)
      const recordMonth = recordDate.getMonth()
      const recordYear = recordDate.getFullYear()
      
      // ตรวจสอบว่าอยู่ในเดือนปัจจุบันหรือเดือนก่อนหน้า (รอบ 2 เดือน)
      const isCurrentMonth = recordMonth === currentMonth && recordYear === currentYear
      const isPrevMonth = recordMonth === prevMonth && recordYear === prevMonthYear
      
      return isCurrentMonth || isPrevMonth
    })
  }

  // หาวันที่ทำ MA ครั้งล่าสุดในช่วง 2 เดือนนี้
  const getLastMADateThisMonth = (assetCode: string): string | null => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // คำนวณเดือนก่อนหน้า 1 เดือน (สำหรับรอบ 2 เดือน)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const history = maintenanceHistory.filter(record => {
      const recordDate = new Date(record.checked_at)
      const recordMonth = recordDate.getMonth()
      const recordYear = recordDate.getFullYear()
      
      // ตรวจสอบว่าอยู่ในเดือนปัจจุบันหรือเดือนก่อนหน้า (รอบ 2 เดือน)
      const isCurrentMonth = recordMonth === currentMonth && recordYear === currentYear
      const isPrevMonth = recordMonth === prevMonth && recordYear === prevMonthYear
      
      return record.asset_code === assetCode && (isCurrentMonth || isPrevMonth)
    })

    if (history.length === 0) return null

    // หา record ล่าสุด
    const latest = history.reduce((prev, current) => {
      return new Date(current.checked_at) > new Date(prev.checked_at) ? current : prev
    })

    return new Date(latest.checked_at).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmitChecklist = async () => {
    if (!selectedAsset) return

    // ตรวจสอบว่าทำ MA ไปแล้วในช่วง 2 เดือนนี้หรือไม่
    if (isMADoneThisMonth(selectedAsset.asset_code)) {
      const lastMADate = getLastMADateThisMonth(selectedAsset.asset_code)
      const result = await Swal.fire({
        icon: 'warning',
        title: 'ทำ MA ไปแล้วในช่วง 2 เดือนนี้!',
        html: `
          <p>อุปกรณ์นี้ได้ทำ MA ไปแล้วเมื่อ <strong>${lastMADate}</strong></p>
          <p className="mt-2">ตามปกติ MA ควรทำทุก 2 เดือน</p>
          <p>ต้องการบันทึกต่อหรือไม่?</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'บันทึกต่อ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280'
      })

      if (!result.isConfirmed) return
    }

    // Printer ใช้ printerChecklist, Computer และ Notebook ใช้ computerChecklist
    const categoryLower = selectedAsset.category?.toLowerCase() || ''
    const checklist = categoryLower === 'printer' ? printerChecklist : computerChecklist
    const completedCount = checklistItems.filter(Boolean).length
    
    // ต้องทำครบทุกรายการ
    if (completedCount !== checklist.length) {
      Swal.fire({
        icon: 'warning',
        title: 'ยังทำไม่ครบ',
        text: `กรุณาตรวจสอบให้ครบทั้ง ${checklist.length} รายการก่อนบันทึก MA เสร็จสิ้น (ทำไปแล้ว ${completedCount}/${checklist.length})`,
        confirmButtonText: 'ตกลง'
      })
      return
    }

    const checklistData = checklist.map((item, index) => ({
      item,
      checked: checklistItems[index]
    }))

    const data = {
      asset_id: selectedAsset.id,
      asset_code: selectedAsset.asset_code,
      device_name: selectedAsset.device_name,
      category: selectedAsset.category,
      company: selectedAsset.company,
      site: selectedAsset.site,
      department: selectedAsset.department,
      user_name: selectedAsset.user_name,
      user_contact: '', // TODO: เพิ่มฟิลด์ user_contact ในตาราง assets หรือใช้ LINE ID
      checklist: checklistData,
      remarks: remarks,
      checked_by: user?.username,
      checked_at: new Date().toISOString()
    }

    try {
      const response = await apiFetch('/api/maintenance-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        // แสดง dialog แจ้งบันทึกสำเร็จ (ไม่แสดงลิงก์แบบประเมิน)
        await Swal.fire({
          icon: 'success',
          title: 'บันทึก MA เสร็จสิ้น! 🎉',
          html: `
            <div class="text-center">
              <p class="text-lg mb-2">✅ บันทึก Checklist สำหรับ</p>
              <p class="text-xl font-bold text-blue-600 mb-3">${selectedAsset.asset_code}</p>
              <p class="text-gray-600">เรียบร้อยแล้ว</p>
            </div>
          `,
          confirmButtonText: 'ปิด',
          confirmButtonColor: '#3085d6',
          timer: 2000
        })

        // ลบ draft ที่บันทึกไว้เมื่อบันทึกสำเร็จ
        const newDrafts = { ...checklistDrafts }
        delete newDrafts[selectedAsset.asset_code]
        setChecklistDrafts(newDrafts)

        setIsDialogOpen(false)
        setSelectedAsset(null)
        
        // โหลดประวัติ MA ใหม่เพื่ออัพเดทสถานะ
        if (selectedDepartment && selectedCompany && selectedSite) {
          await fetchDepartmentMAHistory()
        }
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error submitting checklist:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      })
    }
  }

  const handleCreateRepair = async () => {
    if (!selectedAsset) return
    setRepairProblem('')
    setIsRepairDialogOpen(true)
  }

  const submitRepairTicket = async () => {
    if (!selectedAsset || !repairProblem.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาระบุปัญหา',
        text: 'กรุณาระบุปัญหาที่พบระหว่างการทำ MA',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    try {
      const detailWork = {
        company: selectedAsset.company,
        branch: selectedAsset.site,
        device: selectedAsset.device_name
      }
      
      const ticketData = {
        asset_id: selectedAsset.asset_code,
        username: selectedAsset.user_name,
        Ref: repairProblem.trim(),
        type_of_work: 'MA Checklist',
        work: 'MA Checklist',
        detail_work: JSON.stringify(detailWork),
        formType: 'repair',
        device_name: selectedAsset.device_name
      }

      const response = await apiFetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      })

      const ticketResult = await response.json()

      if (response.ok && ticketResult) {
        setIsRepairDialogOpen(false)
        setRepairProblem('')
        await Swal.fire({
          icon: 'success',
          title: 'แจ้งซ่อมสำเร็จ!',
          text: `สร้าง Ticket ${ticketResult.request_id} เรียบร้อยแล้ว`,
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        throw new Error(ticketResult.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Error creating repair ticket:', error)
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแจ้งซ่อมได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      })
    }
  }

  const handleBack = () => {
    if (selectedDepartment) {
      setSelectedDepartment(null)
      updateURL(selectedCompany, selectedSite, null)
    } else if (selectedSite) {
      setSelectedSite(null)
      updateURL(selectedCompany, null, null)
    } else if (selectedCompany) {
      setSelectedCompany(null)
      updateURL(null, null, null)
    } else {
      router.push('/dashboard')
    }
  }

  // ฟังก์ชันอัพเดท URL
  const updateURL = (company: string | null, site: string | null, department: string | null) => {
    const params = new URLSearchParams()
    if (company) params.set('company', company)
    if (site) params.set('site', site)
    if (department) params.set('department', department)
    
    const queryString = params.toString()
    const newURL = queryString ? `/checklist?${queryString}` : '/checklist'
    router.push(newURL, { scroll: false })
  }

  // Group by company
  const groupedByCompany = assets.reduce((acc, asset) => {
    if (!acc[asset.company]) {
      acc[asset.company] = []
    }
    acc[asset.company].push(asset)
    return acc
  }, {} as Record<string, Asset[]>)

  // Get sites for selected company
  const sitesInCompany = selectedCompany 
    ? Array.from(new Set(assets.filter(a => a.company === selectedCompany).map(a => a.site)))
    : []

  // Get departments for selected site
  const departmentsInSite = selectedCompany && selectedSite 
    ? Array.from(new Set(assets.filter(a => a.company === selectedCompany && a.site === selectedSite).map(a => a.department)))
    : []

  // Get assets for selected department
  const assetsInDepartment = selectedCompany && selectedSite && selectedDepartment
    ? assets.filter(a => a.company === selectedCompany && a.site === selectedSite && a.department === selectedDepartment)
    : []

  // Group by category (case-insensitive)
  const computerAssets = assetsInDepartment.filter(a => {
    const cat = (a.category || '').toLowerCase()
    return cat === 'computer' || cat === 'pc&computer'
  })
  const notebookAssets = assetsInDepartment.filter(a => {
    const cat = (a.category || '').toLowerCase()
    return cat === 'notebook'
  })
  const printerAssets = assetsInDepartment.filter(a => {
    const cat = (a.category || '').toLowerCase()
    return cat === 'printer'
  })

  // Printer ใช้ printerChecklist, Computer และ Notebook ใช้ computerChecklist
  const categoryLower = selectedAsset?.category?.toLowerCase() || ''
  const currentChecklist = categoryLower === 'printer' ? printerChecklist : computerChecklist

  const filteredCompanies = search
    ? Object.keys(groupedByCompany).filter(company => 
        company.toLowerCase().includes(search.toLowerCase())
      )
    : Object.keys(groupedByCompany)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-pink-600" />
                  <span 
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedCompany(null)
                      setSelectedSite(null)
                      setSelectedDepartment(null)
                      updateURL(null, null, null)
                    }}
                  >
                    MA Checklist บำรุงรักษา
                  </span>
                  {selectedCompany && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  {selectedCompany && (
                    <span 
                      className="text-purple-600 cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedSite(null)
                        setSelectedDepartment(null)
                        updateURL(selectedCompany, null, null)
                      }}
                    >
                      {companies.find(c => c.company_code === selectedCompany)?.company_name || selectedCompany}
                    </span>
                  )}
                  {selectedSite && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  {selectedSite && (
                    <span 
                      className="text-blue-600 cursor-pointer hover:underline"
                      onClick={() => {
                        setSelectedDepartment(null)
                        updateURL(selectedCompany, selectedSite, null)
                      }}
                    >
                      {sites.find(s => s.site_code === selectedSite)?.site || selectedSite}
                    </span>
                  )}
                  {selectedDepartment && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  {selectedDepartment && <span className="text-green-600">{selectedDepartment}</span>}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {!selectedCompany && `เลือกบริษัทที่ต้องการตรวจสอบ - ${filteredCompanies.length} บริษัท`}
                  {selectedCompany && !selectedSite && `เลือกสาขาที่ต้องการตรวจสอบ - ${sitesInCompany.length} สาขา`}
                  {selectedSite && !selectedDepartment && `เลือกแผนกที่ต้องการตรวจสอบ - ${departmentsInSite.length} แผนก`}
                  {selectedDepartment && `อุปกรณ์ทั้งหมด ${assetsInDepartment.length} รายการ`}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search - Show only on main page */}
          {!selectedCompany && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาบริษัท..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">กำลังโหลด...</div>
          ) : (
            <>
              {/* Level 1: Companies */}
              {!selectedCompany && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map((companyCode) => {
                    const companyAssets = groupedByCompany[companyCode]
                    const computerCount = companyAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'computer' || cat === 'pc&computer'
                    }).length
                    const notebookCount = companyAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'notebook'
                    }).length
                    const printerCount = companyAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'printer'
                    }).length
                    const totalAssets = computerCount + notebookCount + printerCount
                    const completedAssets = companyAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return (cat === 'computer' || cat === 'pc&computer' || cat === 'notebook' || cat === 'printer') && isMADoneThisMonth(a.asset_code)
                    }).length
                    const progressPercent = totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0
                    const companyInfo = companies.find(c => c.company_code === companyCode)
                    
                    return (
                      <Card 
                        key={companyCode} 
                        className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200"
                        onClick={() => {
                          setSelectedCompany(companyCode)
                          updateURL(companyCode, null, null)
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-bold text-lg">{companyInfo?.company_name || companyCode}</p>
                                <p className="text-sm text-muted-foreground">{companyCode}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {computerCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1 bg-purple-50">
                                <Monitor className="h-3 w-3 text-purple-600" />
                                {notebookCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Printer className="h-3 w-3" />
                                {printerCount}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">ความคืบหน้า MA</span>
                                <span className="font-semibold text-purple-600">{completedAssets}/{totalAssets} ({progressPercent}%)</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    progressPercent === 100 ? 'bg-green-500' : 'bg-purple-500'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Level 2: Sites */}
              {selectedCompany && !selectedSite && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sitesInCompany.map((site) => {
                    const siteAssets = assets.filter(a => a.company === selectedCompany && a.site === site)
                    const computerCount = siteAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'computer' || cat === 'pc&computer'
                    }).length
                    const notebookCount = siteAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'notebook'
                    }).length
                    const printerCount = siteAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'printer'
                    }).length
                    const totalAssets = computerCount + notebookCount + printerCount
                    const completedAssets = siteAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return (cat === 'computer' || cat === 'pc&computer' || cat === 'notebook' || cat === 'printer') && isMADoneThisMonth(a.asset_code)
                    }).length
                    const progressPercent = totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0
                    const siteInfo = sites.find(s => s.site_code === site)
                    
                    return (
                      <Card 
                        key={site} 
                        className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200"
                        onClick={() => {
                          setSelectedSite(site)
                          updateURL(selectedCompany, site, null)
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-8 w-8 text-blue-600" />
                              <div>
                                <p className="font-bold text-lg">{siteInfo?.site || site}</p>
                                <p className="text-sm text-muted-foreground">{site}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {computerCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1 bg-purple-50">
                                <Monitor className="h-3 w-3 text-purple-600" />
                                {notebookCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Printer className="h-3 w-3" />
                                {printerCount}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">ความคืบหน้า MA</span>
                                <span className="font-semibold text-blue-600">{completedAssets}/{totalAssets} ({progressPercent}%)</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    progressPercent === 100 ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Level 3: Departments */}
              {selectedSite && !selectedDepartment && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departmentsInSite.map((dept) => {
                    const deptAssets = assets.filter(a => a.company === selectedCompany && a.site === selectedSite && a.department === dept)
                    const computerCount = deptAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'computer' || cat === 'pc&computer'
                    }).length
                    const notebookCount = deptAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'notebook'
                    }).length
                    const printerCount = deptAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return cat === 'printer'
                    }).length
                    const totalAssets = computerCount + notebookCount + printerCount
                    const completedAssets = deptAssets.filter(a => {
                      const cat = (a.category || '').toLowerCase()
                      return (cat === 'computer' || cat === 'pc&computer' || cat === 'notebook' || cat === 'printer') && isMADoneThisMonth(a.asset_code)
                    }).length
                    const progressPercent = totalAssets > 0 ? Math.round((completedAssets / totalAssets) * 100) : 0
                    
                    return (
                      <Card 
                        key={dept} 
                        className="hover:shadow-lg transition-shadow cursor-pointer border-green-200"
                        onClick={() => {
                          setSelectedDepartment(dept)
                          updateURL(selectedCompany, selectedSite, dept)
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-bold text-sm">
                                  {dept.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-lg">{dept}</p>
                                <p className="text-sm text-muted-foreground">
                                  {deptAssets.length} อุปกรณ์
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {computerCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1 bg-purple-50">
                                <Monitor className="h-3 w-3 text-purple-600" />
                                {notebookCount}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Printer className="h-3 w-3" />
                                {printerCount}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">ความคืบหน้า MA</span>
                                <span className="font-semibold text-green-600">{completedAssets}/{totalAssets} ({progressPercent}%)</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${
                                    progressPercent === 100 ? 'bg-green-500' : 'bg-green-400'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Level 4: Assets by Category */}
              {selectedDepartment && (
                <div className="space-y-6">
                  {/* Computers */}
                  {computerAssets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-blue-600" />
                        คอมพิวเตอร์ ({computerAssets.length} เครื่อง)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {computerAssets.map((asset) => {
                          const isDone = isMADoneThisMonth(asset.asset_code)
                          const lastDate = getLastMADateThisMonth(asset.asset_code)
                          
                          return (
                            <Card key={asset.id} className={`hover:shadow-lg transition-shadow ${isDone ? 'border-green-500 bg-green-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <p className="font-bold text-sm">{asset.device_name}</p>
                                      <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                                    </div>
                                  </div>
                                  {isDone && (
                                    <Badge className="bg-green-600 text-white text-xs">
                                      ✓ ทำแล้ว
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 mb-3 text-xs">
                                  <p><span className="font-semibold">ผู้ใช้งาน:</span> {asset.user_name}</p>
                                  {isDone && lastDate && (
                                    <p className="text-green-600 font-semibold">
                                      MA: {lastDate}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleOpenChecklist(asset)}
                                  className={`w-full ${isDone ? 'bg-gray-400 hover:bg-gray-500' : ''}`}
                                  size="sm"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {isDone ? 'ทำ MA อีกครั้ง' : 'ทำ Checklist'}
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notebooks */}
                  {notebookAssets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-purple-600" />
                        Notebook ({notebookAssets.length} เครื่อง)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notebookAssets.map((asset) => {
                          const isDone = isMADoneThisMonth(asset.asset_code)
                          const lastDate = getLastMADateThisMonth(asset.asset_code)
                          
                          return (
                            <Card key={asset.id} className={`hover:shadow-lg transition-shadow ${isDone ? 'border-green-500 bg-green-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-purple-600" />
                                    <div>
                                      <p className="font-bold text-sm">{asset.device_name}</p>
                                      <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                                    </div>
                                  </div>
                                  {isDone && (
                                    <Badge className="bg-green-600 text-white text-xs">
                                      ✓ ทำแล้ว
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 mb-3 text-xs">
                                  <p><span className="font-semibold">ผู้ใช้งาน:</span> {asset.user_name}</p>
                                  {isDone && lastDate && (
                                    <p className="text-green-600 font-semibold">
                                      MA: {lastDate}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleOpenChecklist(asset)}
                                  className={`w-full ${isDone ? 'bg-gray-400 hover:bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                  size="sm"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {isDone ? 'ทำ MA อีกครั้ง' : 'ทำ Checklist'}
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Printers */}
                  {printerAssets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Printer className="h-5 w-5 text-orange-600" />
                        เครื่องพิมพ์ ({printerAssets.length} เครื่อง)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {printerAssets.map((asset) => {
                          const isDone = isMADoneThisMonth(asset.asset_code)
                          const lastDate = getLastMADateThisMonth(asset.asset_code)
                          
                          return (
                            <Card key={asset.id} className={`hover:shadow-lg transition-shadow ${isDone ? 'border-green-500 bg-green-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Printer className="h-5 w-5 text-orange-600" />
                                    <div>
                                      <p className="font-bold text-sm">{asset.device_name}</p>
                                      <p className="text-xs text-muted-foreground">{asset.asset_code}</p>
                                    </div>
                                  </div>
                                  {isDone && (
                                    <Badge className="bg-green-600 text-white text-xs">
                                      ✓ ทำแล้ว
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-1 mb-3 text-xs">
                                  <p><span className="font-semibold">ผู้ใช้งาน:</span> {asset.user_name}</p>
                                  {isDone && lastDate && (
                                    <p className="text-green-600 font-semibold">
                                      MA: {lastDate}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleOpenChecklist(asset)}
                                  className={`w-full ${isDone ? 'bg-gray-400 hover:bg-gray-500' : 'bg-orange-600 hover:bg-orange-700'}`}
                                  size="sm"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  {isDone ? 'ทำ MA อีกครั้ง' : 'ทำ Checklist'}
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Checklist Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAsset?.category?.toLowerCase() === 'printer' ? (
                <Printer className="h-5 w-5 text-orange-600" />
              ) : (
                <Monitor className="h-5 w-5 text-blue-600" />
              )}
              Checklist บำรุงรักษา{selectedAsset?.category?.toLowerCase() === 'printer' ? 'เครื่องพิมพ์' : 'คอมพิวเตอร์'}
            </DialogTitle>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-6">
              {/* Asset Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Asset Code:</span> {selectedAsset.asset_code}</p>
                  <p><span className="font-semibold">อุปกรณ์:</span> {selectedAsset.device_name}</p>
                  <p><span className="font-semibold">สาขา:</span> {selectedAsset.site}</p>
                  <p><span className="font-semibold">แผนก:</span> {selectedAsset.department}</p>
                  <p><span className="font-semibold">ผู้ใช้งาน:</span> {selectedAsset.user_name}</p>
                </CardContent>
              </Card>

              {/* Checklist Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">ขั้นตอนในการดำเนินงานบำรุงรักษา:</h3>
                {currentChecklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`item-${index}`}
                      checked={checklistItems[index]}
                      onCheckedChange={(checked) => {
                        const newItems = [...checklistItems]
                        newItems[index] = checked as boolean
                        setChecklistItems(newItems)
                        
                        // บันทึก draft
                        if (selectedAsset) {
                          setChecklistDrafts({
                            ...checklistDrafts,
                            [selectedAsset.asset_code]: {
                              items: newItems,
                              remarks: remarks
                            }
                          })
                        }
                      }}
                    />
                    <Label
                      htmlFor={`item-${index}`}
                      className="flex-1 cursor-pointer leading-relaxed"
                    >
                      {index + 1}. {item}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">หมายเหตุ</Label>
                <Textarea
                  id="remarks"
                  placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)..."
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value)
                    
                    // บันทึก draft
                    if (selectedAsset) {
                      setChecklistDrafts({
                        ...checklistDrafts,
                        [selectedAsset.asset_code]: {
                          items: checklistItems,
                          remarks: e.target.value
                        }
                      })
                    }
                  }}
                  rows={4}
                />
              </div>

              {/* Maintenance History */}
              {maintenanceHistory.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ประวัติการบำรุงรักษา ({maintenanceHistory.length} ครั้ง)
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {maintenanceHistory.map((history, idx) => {
                      const checkedItems = Array.isArray(history.checklist) 
                        ? history.checklist.filter((item: any) => item.checked).length
                        : 0
                      const totalItems = Array.isArray(history.checklist) ? history.checklist.length : 0
                      const date = new Date(history.checked_at)
                      
                      return (
                        <Card 
                          key={history.id} 
                          className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => setViewingHistory(history)}
                        >
                          <CardContent className="p-3 text-xs space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">
                                  {date.toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-muted-foreground">
                                  ตรวจสอบโดย: {history.checked_by}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {checkedItems}/{totalItems} รายการ
                              </Badge>
                            </div>
                            {history.remarks && (
                              <p className="text-muted-foreground pt-1 border-t">
                                <span className="font-semibold">หมายเหตุ:</span> {history.remarks}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {loadingHistory && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  กำลังโหลดประวัติ...
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleCreateRepair}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    แจ้งซ่อม
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // บันทึก draft และปิด dialog
                      setIsDialogOpen(false)
                      Swal.fire({
                        icon: 'success',
                        title: 'บันทึกไว้แล้ว',
                        text: 'คุณสามารถกลับมาทำต่อได้ภายหลัง',
                        confirmButtonText: 'ตกลง',
                        timer: 1500
                      })
                    }}
                  >
                    บันทึกไว้ทำต่อ
                  </Button>
                  <Button 
                    onClick={handleSubmitChecklist}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    MA เสร็จสิ้น
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
      <Dialog open={!!viewingHistory} onOpenChange={(open) => !open && setViewingHistory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              รายละเอียด MA Checklist
            </DialogTitle>
          </DialogHeader>

          {viewingHistory && (
            <div className="space-y-4">
              {/* Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Asset Code:</span> {viewingHistory.asset_code}</p>
                  <p><span className="font-semibold">วันที่ตรวจสอบ:</span> {new Date(viewingHistory.checked_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  <p><span className="font-semibold">ผู้ตรวจสอบ:</span> {viewingHistory.checked_by}</p>
                </CardContent>
              </Card>

              {/* Checklist Items */}
              {Array.isArray(viewingHistory.checklist) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">รายการที่ตรวจสอบ:</h3>
                  {viewingHistory.checklist.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        item.checked ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="mt-1">
                        {item.checked ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${item.checked ? 'text-green-900 font-medium' : 'text-gray-500'}`}>
                          {index + 1}. {item.item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Remarks */}
              {viewingHistory.remarks && (
                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm mb-2">หมายเหตุ:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingHistory.remarks}</p>
                  </CardContent>
                </Card>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <Button onClick={() => setViewingHistory(null)}>
                  ปิด
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Repair Dialog */}
      <Dialog open={isRepairDialogOpen} onOpenChange={setIsRepairDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-red-600" />
              แจ้งซ่อมจาก MA
            </DialogTitle>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4">
              {/* Asset Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Asset Code:</span> {selectedAsset.asset_code}</p>
                  <p><span className="font-semibold">อุปกรณ์:</span> {selectedAsset.device_name}</p>
                  <p><span className="font-semibold">สาขา:</span> {selectedAsset.site}</p>
                  <p><span className="font-semibold">แผนก:</span> {selectedAsset.department}</p>
                  <p><span className="font-semibold">ผู้ใช้งาน:</span> {selectedAsset.user_name}</p>
                </CardContent>
              </Card>

              {/* Problem Input */}
              <div className="space-y-2">
                <Label htmlFor="repair-problem">ปัญหาที่พบ</Label>
                <Textarea
                  id="repair-problem"
                  placeholder="ระบุปัญหาที่พบระหว่างการทำ MA..."
                  value={repairProblem}
                  onChange={(e) => setRepairProblem(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsRepairDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button 
                  onClick={submitRepairTicket}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  แจ้งซ่อม
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </main>
    </div>
  )
}
