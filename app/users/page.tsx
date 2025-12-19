'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, ArrowLeft, Plus, Pencil, Trash2, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Swal from 'sweetalert2'

interface User {
  iduser: number
  userid: string
  user_login: string
  name: string
  Role: number
  site?: string
  department?: string
}

export default function UsersPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSite, setFilterSite] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [sites, setSites] = useState<Array<{ site_code: string; site: string }>>([])
  const [viewAsset, setViewAsset] = useState<any | null>(null)

  useEffect(() => {
    if (!user) return
    
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
    fetchSites()
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await fetch(`/api/users?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }
  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setSites(result.data)
      }
    } catch (err) {
      console.error('Error fetching sites:', err)
    }
  }
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (user?.role === 'admin') {
        fetchUsers()
      }
    }, 300)
    return () => clearTimeout(delaySearch)
  }, [search])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleEdit = async (editUser: User) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขผู้ใช้',
      width: '600px',
      html: `
        <style>
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px 20px;
            padding: 20px 10px;
          }
          .form-field {
            text-align: left;
          }
          .form-field label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
          }
          .form-field input,
          .form-field select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          .form-field input:focus,
          .form-field select:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .form-field input:disabled {
            background-color: #f3f4f6;
            cursor: not-allowed;
          }
          .password-wrapper {
            position: relative;
          }
          .password-wrapper input {
            padding-right: 40px;
          }
          .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6366f1;
            user-select: none;
            font-size: 12px;
            font-weight: 600;
          }
          .password-toggle:hover {
            color: #4f46e5;
          }
        </style>
        <div class="form-grid">
          <div class="form-field">
            <label>Username</label>
            <input id="username" type="text" value="${editUser.user_login}" disabled>
          </div>
          
          <div class="form-field">
            <label>ชื่อ-นามสกุล *</label>
            <input id="name" type="text" value="${editUser.name}" placeholder="กรอกชื่อ-นามสกุล">
          </div>
          
          <div class="form-field">
            <label>Role *</label>
            <select id="role">
              <option value="1" ${editUser.Role === 1 ? 'selected' : ''}>User</option>
              <option value="0" ${editUser.Role === 0 ? 'selected' : ''}>Admin</option>
            </select>
          </div>
          
          <div class="form-field">
            <label>สาขา</label>
            <select id="site">
              <option value="">เลือกสาขา</option>
              ${sites.map(s => `<option value="${s.site}" ${editUser.site === s.site ? 'selected' : ''}>${s.site}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-field">
            <label>แผนก</label>
            <input id="department" type="text" value="${editUser.department || ''}" placeholder="กรอกแผนก">
          </div>
          
          <div class="form-field">
            <label>รหัสผ่านใหม่</label>
            <div class="password-wrapper">
              <input id="password" type="password" placeholder="เว้นว่างถ้าไม่ต้องการเปลี่ยน">
              <span class="password-toggle" onclick="
                const input = document.getElementById('password');
                const icon = this;
                if (input.type === 'password') {
                  input.type = 'text';
                  icon.textContent = 'ซ่อน';
                } else {
                  input.type = 'password';
                  icon.textContent = 'แสดง';
                }
              ">แสดง</span>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      buttonsStyling: true,
      preConfirm: () => {
        const name = (document.getElementById('name') as HTMLInputElement).value
        const role = parseInt((document.getElementById('role') as HTMLSelectElement).value)
        const site = (document.getElementById('site') as HTMLInputElement).value
        const department = (document.getElementById('department') as HTMLInputElement).value
        const password = (document.getElementById('password') as HTMLInputElement).value

        if (!name) {
          Swal.showValidationMessage('กรุณากรอกชื่อ-นามสกุล')
          return false
        }

        return { name, role, site, department, password }
      }
    })

    if (formValues) {
      try {
        const updateData: any = {
          usersname: formValues.name,
          Role: formValues.role,
          site: formValues.site || null,
          department: formValues.department || null
        }

        if (formValues.password) {
          updateData.password = formValues.password
        }

        const response = await fetch(`/api/users/${editUser.iduser}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        const data = await response.json()

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
            timer: 2000
          })
          fetchUsers()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: data.error || 'ไม่สามารถอัปเดตข้อมูลได้'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        })
      }
    }
  }

  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มผู้ใช้ใหม่',
      width: '600px',
      html: `
        <style>
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px 20px;
            padding: 20px 10px;
          }
          .form-field {
            text-align: left;
          }
          .form-field label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
            color: #374151;
          }
          .form-field input,
          .form-field select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          .form-field input:focus,
          .form-field select:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .password-wrapper {
            position: relative;
          }
          .password-wrapper input {
            padding-right: 40px;
          }
          .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #6366f1;
            user-select: none;
            font-size: 12px;
            font-weight: 600;
          }
          .password-toggle:hover {
            color: #4f46e5;
          }
        </style>
        <div class="form-grid">
          <div class="form-field">
            <label>รหัสพนักงาน *</label>
            <input id="username" type="text" placeholder="กรอก Username">
          </div>
          
          <div class="form-field">
            <label>รหัสผ่าน *</label>
            <div class="password-wrapper">
              <input id="password" type="password" placeholder="กรอกรหัสผ่าน">
              <span class="password-toggle" onclick="
                const input = document.getElementById('password');
                const icon = this;
                if (input.type === 'password') {
                  input.type = 'text';
                  icon.textContent = 'ซ่อน';
                } else {
                  input.type = 'password';
                  icon.textContent = 'แสดง';
                }
              ">แสดง</span>
            </div>
          </div>
          
          <div class="form-field">
            <label>ชื่อ-นามสกุล *</label>
            <input id="name" type="text" placeholder="กรอกชื่อ-นามสกุล">
          </div>
          
          <div class="form-field">
            <label>สาขา</label>
            <select id="site">
              <option value="">เลือกสาขา</option>
              ${sites.map(s => `<option value="${s.site}">${s.site}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-field">
            <label>แผนก</label>
            <input id="department" type="text" placeholder="กรอกแผนก">
          </div>

          <div class="form-field">
            <label>Role *</label>
            <select id="role">
              <option value="1">User</option>
              <option value="0">Admin</option>
            </select>
          </div>

        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'เพิ่ม',
      cancelButtonText: 'ยกเลิก',
      buttonsStyling: true,
      preConfirm: () => {
        const username = (document.getElementById('username') as HTMLInputElement).value
        const password = (document.getElementById('password') as HTMLInputElement).value
        const name = (document.getElementById('name') as HTMLInputElement).value
        const role = parseInt((document.getElementById('role') as HTMLSelectElement).value)
        const site = (document.getElementById('site') as HTMLInputElement).value
        const department = (document.getElementById('department') as HTMLInputElement).value

        if (!username || !password || !name) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลที่จำเป็น (*)')
          return false
        }

        return { username, password, name, role, site, department }
      }
    })

    if (formValues) {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formValues.username,
            password: formValues.password,
            name: formValues.name,
            role: formValues.role === 0 ? 'admin' : 'user',
            site: formValues.site || null,
            department: formValues.department || null
          })
        })

        const data = await response.json()

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'เพิ่มผู้ใช้เรียบร้อยแล้ว',
            timer: 2000
          })
          fetchUsers()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: data.error || 'ไม่สามารถเพิ่มผู้ใช้ได้'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        })
      }
    }
  }

  const handleViewAssets = async (user: User) => {
    try {
      // ใช้ user_login ถ้า userid เป็น null
      const userId = user.userid || user.user_login
      const response = await fetch(`/api/assets?user_id=${encodeURIComponent(userId)}&user_name=${encodeURIComponent(user.name)}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const assets = result.data
        
        if (assets.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'ไม่พบทรัพย์สิน',
            text: `ไม่มีทรัพย์สินที่ลงทะเบียนในชื่อ ${user.name} (${user.user_login})`,
            confirmButtonText: 'ตรวจสอบ'
          })
          return
        }

        // สร้าง HTML สำหรับแต่ละแถว
        const assetsRowsArray = assets.map((asset: any, index: number) => {
          const bgColor = index % 2 === 0 ? 'background: #fafafa;' : ''
          return `
            <tr style="border-bottom: 1px solid #e5e7eb; ${bgColor}">
              <td style="padding: 10px; font-weight: 500;">${asset.asset_code || '-'}</td>
              <td style="padding: 10px;">${asset.category || '-'}</td>
              <td style="padding: 10px;">${asset.site || '-'}</td>
              <td style="padding: 10px; font-family: monospace; font-size: 12px;">${asset.serial_number || '-'}</td>
              <td style="padding: 10px; text-align: center;">
                <button 
                  onclick="window.viewAssetDetail(${index})"
                  style="background: #6366f1; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;"
                  onmouseover="this.style.background='#4f46e5'"
                  onmouseout="this.style.background='#6366f1'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  ดู
                </button>
              </td>
            </tr>
          `
        })
        const assetsRows = assetsRowsArray.join('')
        const totalAssets = assets.length
        
        const tableHeader = '<thead><tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;"><th style="padding: 10px; text-align: left; font-weight: 600;">Asset Code</th><th style="padding: 10px; text-align: left; font-weight: 600;">ประเภท</th><th style="padding: 10px; text-align: left; font-weight: 600;">สาขา</th><th style="padding: 10px; text-align: left; font-weight: 600;">Serial Number</th><th style="padding: 10px; text-align: center; font-weight: 600;">Actions</th></tr></thead>'
        
        const assetsHtml = '<div style="max-height: 500px; overflow-y: auto; text-align: left;"><p style="margin-bottom: 15px; color: #6b7280; font-size: 14px;">พบทรัพย์สินทั้งหมด <strong>' + totalAssets + '</strong> รายการ</p><table style="width: 100%; border-collapse: collapse; font-size: 14px;">' + tableHeader + '<tbody>' + assetsRows + '</tbody></table></div>';

        // Store assets data in window for access from buttons
        (window as any).assetsData = assets;
        (window as any).viewAssetDetail = (index: number) => {
          const asset = (window as any).assetsData[index]
          Swal.close()
          setViewAsset(asset)
        }

        Swal.fire({
          title: `<div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">💼</span>
                    <span>ทรัพย์สินของ ${user.name}</span>
                  </div>`,
          html: assetsHtml,
          width: '900px',
          confirmButtonText: 'ปิด',
          confirmButtonColor: '#6366f1',
          didClose: () => {
            delete (window as any).assetsData
            delete (window as any).viewAssetDetail
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลทรัพย์สินได้'
        })
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      })
    }
  }

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      html: `คุณต้องการลบผู้ใช้ <strong>${user.user_login}</strong> (${user.name}) ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626'
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/users/${user.iduser}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'ลบผู้ใช้เรียบร้อยแล้ว',
            timer: 2000
          })
          fetchUsers()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: data.error || 'ไม่สามารถลบผู้ใช้ได้'
          })
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        })
      }
    }
  }

  if (!user || user.role !== 'admin') {
    return null
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
              <p className="text-sm text-muted-foreground">จัดการผู้ใช้</p>
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
                  👥 รายการผู้ใช้ (Users)
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ - ทั้งหมด {users.length} รายการ
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="gap-2" onClick={handleAddUser}>
                  <Plus className="h-4 w-4" />
                  เพิ่มผู้ใช้
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา User ID, Username, ชื่อ, สาขา, แผนก..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <Select value={filterSite} onValueChange={setFilterSite}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="เลือกสาขา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกสาขา</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.site_code} value={site.site_code}>
                        {site.site_code} - {site.site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="เลือกแผนก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกแผนก</SelectItem>
                    {Array.from(new Set(users.map(u => u.department).filter(Boolean))).map((dept) => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                ไม่พบข้อมูลผู้ใช้
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>ชื่อ-นามสกุล</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>สาขา</TableHead>
                      <TableHead>แผนก</TableHead>
                      <TableHead className="text-center">ทรัพย์สิน</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(u => {
                        if (filterSite !== 'all' && u.site !== filterSite) return false
                        if (filterDepartment !== 'all' && u.department !== filterDepartment) return false
                        return true
                      })
                      .map((u) => (
                      <TableRow key={u.iduser}>
                        <TableCell className="font-medium">{u.user_login}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>
                          <Badge variant={u.Role === 0 ? 'default' : 'secondary'}>
                            {u.Role === 0 ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.site || '-'}</TableCell>
                        <TableCell>{u.department || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAssets(u)}
                            title="ดูทรัพย์สิน"
                            className="gap-2"
                          >
                            <Monitor className="h-4 w-4" />
                            ดูทรัพย์สิน
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(u)}
                              title="แก้ไข"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(u)}
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
                      <span className="text-sm text-gray-600">รหัสพนักงาน</span>
                      <p className="font-semibold">{viewAsset.user_id || '-'}</p>
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
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">หมายเลข</span>
                      <p className="font-semibold">{viewAsset.number || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">Ref Device</span>
                      <p className="font-semibold">{viewAsset.ref_devicename || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูล License */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-600 border-b pb-2">ข้อมูล License</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">License OS</span>
                      <p className="font-semibold text-sm">{viewAsset.licenseOS || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">License MS</span>
                      <p className="font-semibold text-sm">{viewAsset.licenseMS || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">License 1</span>
                      <p className="font-semibold text-sm">{viewAsset.license1 || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">License 2</span>
                      <p className="font-semibold text-sm">{viewAsset.license2 || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลการเงิน */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 border-b pb-2">ข้อมูลการเงิน</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">ราคา</span>
                      <p className="font-semibold">{viewAsset.cost || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-600">วันที่ซื้อ</span>
                      <p className="font-semibold">{viewAsset.purchase_date || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* รายละเอียดเพิ่มเติม */}
                {viewAsset.Detail && viewAsset.Detail !== '-' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">รายละเอียดเพิ่มเติม</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{viewAsset.Detail}</p>
                    </div>
                  </div>
                )}

                {/* ข้อมูลระบบ */}
                <div className="text-xs text-gray-500 border-t pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold">สร้างเมื่อ:</span>{' '}
                      {viewAsset.created_at ? new Date(viewAsset.created_at).toLocaleString('th-TH') : '-'}
                    </div>
                    <div>
                      <span className="font-semibold">แก้ไขล่าสุด:</span>{' '}
                      {viewAsset.updated_at ? new Date(viewAsset.updated_at).toLocaleString('th-TH') : '-'}
                    </div>
                  </div>
                </div>
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
