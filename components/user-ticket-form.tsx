"use client"

import React, { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserTicketFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  userName?: string
  userId?: string
}

export function UserTicketForm({ onSubmit, isLoading = false, userName = "", userId = "" }: UserTicketFormProps) {
  const [formType, setFormType] = useState<"repair" | "request" | "">("")
  const [formData, setFormData] = useState({
    asset_id: "",
    username: userName,
    Ref: "",
    type_of_work: "",
    work: "",
    detail_work: "",
    img: "",
    device_name: "",
  })
  const [userAssets, setUserAssets] = useState<any[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedDeviceName, setSelectedDeviceName] = useState<string>("")
  const [allAssets, setAllAssets] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [useSearchMode, setUseSearchMode] = useState(false)
  
  // States for cost management
  const [hasCost, setHasCost] = useState<boolean>(false)
  const [costType, setCostType] = useState<"withdraw" | "purchase" | "">("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [equipmentPrice, setEquipmentPrice] = useState<string>("")
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [purchaseDescription, setPurchaseDescription] = useState<string>("")

  // Equipment list with prices
  const equipmentList = [
    { name: "Mouse", price: "150" },
    { name: "Keyboard", price: "300" },
    { name: "Monitor 19\"", price: "2500" },
    { name: "Monitor 22\"", price: "3500" },
    { name: "RAM 4GB", price: "800" },
    { name: "RAM 8GB", price: "1500" },
    { name: "HDD 500GB", price: "1200" },
    { name: "SSD 120GB", price: "800" },
    { name: "Power Supply", price: "600" },
    { name: "UPS", price: "2000" },
  ]

  // Update username when userName prop changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, username: userName }))
  }, [userName])

  // Fetch all assets for search
  React.useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        // ดึงข้อมูลทั้งหมดสำหรับการค้นหา
        const response = await apiFetch('/api/assets?pageSize=10000')
        if (response.ok) {
          const result = await response.json()
          const assets = result.data || result
          setAllAssets(assets)
        }
      } catch (error) {
        console.error('Failed to fetch all assets:', error)
      }
    }
    
    if (formType === 'repair') {
      fetchAllAssets()
    }
  }, [formType])

  // Fetch user's assets when userName or userId changes or formType is repair
  React.useEffect(() => {
    const fetchUserAssets = async () => {
      if (!userName && !userId) {
        console.log('No userName or userId provided')
        return
      }
      
      // Only fetch if formType is repair
      if (formType !== 'repair') {
        console.log('FormType is not repair, skipping fetch')
        return
      }
      
      setIsLoadingAssets(true)
      console.log('Starting to fetch assets...')
      
      try {
        // ดึงข้อมูลทั้งหมดโดยใช้ pageSize ที่มากพอ
        const response = await apiFetch('/api/assets?pageSize=10000')
        if (response.ok) {
          const result = await response.json()
          const assets = result.data || result
          
          console.log('Current userName:', userName)
          console.log('Current userId:', userId)
          console.log('Total assets:', assets.length)
          
          // Filter assets by user_name OR user_id
          const filteredAssets = assets.filter((asset: any) => {
            // Check user_name match
            let nameMatches = false
            if (userName && asset.user_name) {
              const assetUserName = asset.user_name.trim().toLowerCase()
              const currentUserName = userName.trim().toLowerCase()
              nameMatches = assetUserName === currentUserName || 
                          assetUserName.includes(currentUserName) ||
                          currentUserName.includes(assetUserName)
            }
            
            // Check user_id match
            let idMatches = false
            if (userId && asset.user_id) {
              const assetUserId = String(asset.user_id).trim().toLowerCase()
              const currentUserId = String(userId).trim().toLowerCase()
              idMatches = assetUserId === currentUserId
            }
            
            const matches = nameMatches || idMatches
            
            if (matches) {
              console.log('Matched asset:', asset.asset_code, asset.device_name, asset.user_name, asset.user_id)
            }
            return matches
          })
          
          console.log('Filtered assets for user:', filteredAssets.length)
          console.log('Setting userAssets state with:', filteredAssets)
          setUserAssets(filteredAssets)
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error)
      } finally {
        setIsLoadingAssets(false)
        console.log('isLoadingAssets set to false')
      }
    }

    fetchUserAssets()
  }, [userName, userId, formType])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ตรวจสอบขนาดไฟล์ไม่เกิน 100MB
      const maxSize = 100 * 1024 * 1024 // 100MB in bytes
      if (file.size > maxSize) {
        alert('ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 100MB')
        e.target.value = '' // Clear input
        return
      }

      setSelectedImage(file)
      
      // สร้าง preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // อัปโหลดไฟล์ไปเซิร์ฟเวอร์
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await apiFetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Upload result:', result)
          // เก็บ URL ของไฟล์แทน Base64
          setFormData(prev => ({ ...prev, img: result.url }))
          console.log('Image URL saved to formData:', result.url)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Failed to upload file:', error)
        alert('ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง')
        setSelectedImage(null)
        setImagePreview(null)
        e.target.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({ ...formData, img: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare cost data
    let costData: any = {
      cost: "0",
      price_type: null,
      description_price: null
    }
    
    if (hasCost) {
      if (costType === "withdraw" && selectedEquipment) {
        costData = {
          cost: equipmentPrice,
          price_type: 0, // เบิกจ่าย
          description_price: selectedEquipment
        }
      } else if (costType === "purchase" && purchasePrice) {
        costData = {
          cost: purchasePrice,
          price_type: 1, // สั่งซื้อ
          description_price: purchaseDescription
        }
      }
    }
    
    console.log('Submitting form data:', { ...formData, formType, ...costData })
    console.log('Image URL:', formData.img)
    await onSubmit({ ...formData, formType, ...costData })
    
    // Reset form
    setFormData({
      asset_id: "",
      username: userName,
      Ref: "",
      type_of_work: "",
      work: "",
      detail_work: "",
      img: "",
      device_name: "",
    })
    setFormType("")
    setSelectedImage(null)
    setImagePreview(null)
    setSelectedDeviceName("")
    setSearchQuery("")
    setUseSearchMode(false)
    setHasCost(false)
    setCostType("")
    setSelectedEquipment("")
    setEquipmentPrice("")
    setPurchasePrice("")
    setPurchaseDescription("")
  }

  const workTypes = [
    { value: "งานซ่อม", label: "งานซ่อม" },
    { value: "งานบริการ", label: "งานบริการ" }, 
  ]

  const equipmentTypes = [
    { value: "PC&Computer", label: "PC&Computer" },
    { value: "Notebook", label: "Notebook" },
    { value: "Mouse", label: "Mouse" },
    { value: "Keyboard", label: "Keyboard" },
    { value: "Printer", label: "Printer" },
    { value: "Scaner", label: "Scaner" },
    { value: "Monitor", label: "Monitor" },
    { value: "Router", label: "Router" },
    { value: "CCTV", label: "CCTV" },
    { value: "UPS", label: "UPS" },
    { value: "Network", label: "Network" },
    { value: "Other", label: "Other" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>แจ้งความต้องการ</CardTitle>
        <CardDescription>เลือกประเภทแบบฟอร์มที่ต้องการใช้งาน</CardDescription>
      </CardHeader>
      <CardContent>
        {!formType ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">กรุณาเลือกประเภทแบบฟอร์ม</p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-20 text-base"
                onClick={() => setFormType("repair")}
              >
                <div className="text-center">
                  <div className="font-semibold">แจ้งซ่อมอุปกรณ์</div>
                  <div className="text-xs text-muted-foreground mt-1">สำหรับแจ้งซ่อมหรือแจ้งปัญหาของอุปกรณ์</div>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-20 text-base"
                onClick={() => setFormType("request")}
              >
                <div className="text-center">
                  <div className="font-semibold">แบบเบิกอุปกรณ์</div>
                  <div className="text-xs text-muted-foreground mt-1">สำหรับขอเบิกอุปกรณ์ใหม่</div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {formType === "repair" ? "แจ้งซ่อมอุปกรณ์" : "แบบเบิกอุปกรณ์"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formType === "repair" 
                      ? "กรอกข้อมูลเพื่อแจ้งซ่อมหรือแจ้งปัญหาของอุปกรณ์" 
                      : "กรอกข้อมูลเพื่อขอเบิกอุปกรณ์"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormType("")}
                >
                  เปลี่ยนแบบฟอร์ม
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ชื่อผู้แจ้ง <span className="text-red-500">*</span></label>
                <Input
                  placeholder="ชื่อ-นามสกุล"
                  value={formData.username}
                  readOnly
                  className="bg-muted"
                  required
                />
              </div>

              {formType === "repair" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">ชื่ออุปกรณ์ (Device Name) <span className="text-red-500">*</span></label>
                      {!isLoadingAssets && userAssets.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            setUseSearchMode(!useSearchMode)
                            setSearchQuery("")
                            setSelectedDeviceName("")
                            setFormData(prev => ({ ...prev, asset_id: "", work: "" }))
                          }}
                        >
                          {useSearchMode ? "เลือกจากรายการของฉัน" : "ค้นหาอุปกรณ์อื่น"}
                        </Button>
                      )}
                    </div>
                    {!useSearchMode && (
                      <div className="text-xs text-muted-foreground mb-2">
                        เลือกจากอุปกรณ์ของคุณ หรือคลิก "ค้นหาอุปกรณ์อื่น" เพื่อแจ้งซ่อมแทนผู้อื่น
                      </div>
                    )}
                    {useSearchMode && (
                      <div className="text-xs text-muted-foreground mb-2">
                        ค้นหาตามชื่ออุปกรณ์, รหัสทรัพย์สิน หรือชื่อผู้ใช้งาน
                      </div>
                    )}
                    {(() => {
                      console.log('Rendering asset field - isLoadingAssets:', isLoadingAssets, 'userAssets.length:', userAssets.length)
                      return null
                    })()}
                    {isLoadingAssets ? (
                      <Input
                        placeholder="กำลังโหลดข้อมูล..."
                        disabled
                      />
                    ) : (!useSearchMode && userAssets.length > 0) ? (
                      <Select
                        value={selectedDeviceName}
                        onValueChange={(value) => {
                          // หา asset ที่เลือกจาก device_name
                          const selectedAsset = userAssets.find(asset => asset.device_name === value)
                          
                          if (selectedAsset) {
                            // แปลง category เป็นค่าที่ตรงกับ equipmentTypes
                            const categoryMapping: { [key: string]: string } = {
                              'Computer': 'PC&Computer',
                              'Notebook': 'Notebook',
                              'Mouse': 'Mouse',
                              'Keyboard': 'Keyboard',
                              'Printer': 'Printer',
                              'Scaner': 'Scaner',
                              'Monitor': 'Monitor',
                              'Router': 'Router',
                              'CCTV': 'CCTV',
                              'UPS': 'UPS',
                              'Network': 'Network',
                            }
                            
                            const mappedCategory = selectedAsset.category 
                              ? (categoryMapping[selectedAsset.category] || selectedAsset.category)
                              : ''
                            
                            // เก็บ device_name เพื่อแสดงใน Select
                            setSelectedDeviceName(value)
                            // เก็บ asset_code ใน formData.asset_id เพื่อส่งไปฐานข้อมูล
                            setFormData(prev => ({ 
                              ...prev, 
                              asset_id: selectedAsset.asset_code, 
                              work: mappedCategory,
                              device_name: selectedAsset.device_name || selectedAsset.asset_code
                            }))
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกชื่ออุปกรณ์" />
                        </SelectTrigger>
                        <SelectContent>
                          {userAssets.map((asset, index) => {
                            // ใช้ device_name เป็นตัวเลือกหลัก
                            const displayValue = asset.device_name || asset.asset_code
                            const displayText = asset.device_name 
                              ? `${asset.device_name}${asset.category ? ` (${asset.category})` : ''}`
                              : asset.asset_code
                            
                            return (
                              <SelectItem key={`${asset.id}-${index}`} value={displayValue}>
                                {displayText}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-2 relative">
                        <Input
                          placeholder="ค้นหาตามชื่ออุบกรณ์, รหัสทรัพย์สิน หรือชื่อผู้ใช้งาน..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setShowSearchResults(e.target.value.length > 0)
                          }}
                          onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                          required={!formData.asset_id}
                        />
                        {showSearchResults && searchQuery.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {allAssets
                              .filter(asset => {
                                const query = searchQuery.toLowerCase()
                                return (
                                  (asset.device_name && asset.device_name.toLowerCase().includes(query)) ||
                                  (asset.asset_code && asset.asset_code.toLowerCase().includes(query)) ||
                                  (asset.user_name && asset.user_name.toLowerCase().includes(query))
                                )
                              })
                              .slice(0, 20)
                              .map((asset, index) => (
                                <div
                                  key={`search-${asset.id}-${index}`}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                                  onClick={() => {
                                    const categoryMapping: { [key: string]: string } = {
                                      'Computer': 'PC&Computer',
                                      'Notebook': 'Notebook',
                                      'Mouse': 'Mouse',
                                      'Keyboard': 'Keyboard',
                                      'Printer': 'Printer',
                                      'Scaner': 'Scaner',
                                      'Monitor': 'Monitor',
                                      'Router': 'Router',
                                      'CCTV': 'CCTV',
                                      'UPS': 'UPS',
                                      'Network': 'Network',
                                    }
                                    
                                    const mappedCategory = asset.category 
                                      ? (categoryMapping[asset.category] || asset.category)
                                      : ''
                                    
                                    setSearchQuery(asset.device_name || asset.asset_code)
                                    setSelectedDeviceName(asset.device_name || asset.asset_code)
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      asset_id: asset.asset_code,
                                      work: mappedCategory,
                                      device_name: asset.device_name || asset.asset_code
                                    }))
                                    setShowSearchResults(false)
                                  }}
                                >
                                  <div className="font-medium text-sm">
                                    {asset.device_name || asset.asset_code}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex gap-2">
                                    {/* <span>รหัส: {asset.asset_code}</span> */}
                                    {/* {asset.category && <span>| {asset.category}</span>} */}
                                    {asset.user_name && <span> ผู้ใช้: {asset.user_name}</span>}
                                    {/* {asset.site && <span>| {asset.site}</span>} */}
                                  </div>
                                </div>
                              ))}
                            {allAssets.filter(asset => {
                              const query = searchQuery.toLowerCase()
                              return (
                                (asset.device_name && asset.device_name.toLowerCase().includes(query)) ||
                                (asset.asset_code && asset.asset_code.toLowerCase().includes(query)) ||
                                (asset.user_name && asset.user_name.toLowerCase().includes(query))
                              )
                            }).length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                                ไม่พบอุปกรณ์ที่ค้นหา
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          กรุณาค้นหาและเลือกอุปกรณ์จากรายการที่ค้นหา
                        </p>
                        {formData.asset_id && (
                          <div className="text-sm font-medium text-green-600">
                            ✓ เลือกแล้ว: {formData.device_name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ชนิดของงาน <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.work}
                      onValueChange={(value) => setFormData({ ...formData, work: value })}
                      required
                      disabled
                    >
                      <SelectTrigger className="bg-muted cursor-not-allowed">
                        <SelectValue placeholder="เลือกชนิดของงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map((equipment) => (
                          <SelectItem key={equipment.value} value={equipment.value}>
                            {equipment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ประเภทของงาน <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.type_of_work}
                      onValueChange={(value) => setFormData({ ...formData, type_of_work: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทของงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {formData.type_of_work === "งานซ่อม" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">อาการ <span className="text-red-500">*</span></label>
                      <textarea
                        placeholder="อธิบายอาการหรือปัญหาของอุปกรณ์..."
                        value={formData.Ref}
                        onChange={(e) => setFormData({ ...formData, Ref: e.target.value })}
                        required
                        className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  )}

                  {formData.type_of_work === "งานบริการ" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">รายละเอียดงาน <span className="text-red-500">*</span></label>
                      <textarea
                        placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงานบริการ..."
                        value={formData.detail_work}
                        onChange={(e) => setFormData({ ...formData, detail_work: e.target.value })}
                        required
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">แนบรูปภาพ / วิดีโอ</label>
                    <div className="space-y-2">
                      {!imagePreview ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative w-full max-w-xs">
                            {selectedImage?.type.startsWith('video/') ? (
                              <video 
                                src={imagePreview} 
                                controls 
                                preload="metadata"
                                className="w-full h-auto rounded-lg border"
                              >
                                <source src={imagePreview} type={selectedImage.type} />
                                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                              </video>
                            ) : (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-auto rounded-lg border"
                              />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              ลบไฟล์
                            </Button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        รองรับไฟล์: JPG, PNG, GIF, MP4, MOV (ไม่เกิน 100MB) - ไม่บังคับ
                      </p>
                    </div>
                  </div>
                </>
              )}

              {formType === "request" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ชนิดอุปกรณ์ที่ต้องการเบิก <span className="text-red-500">*</span></label>
                    <Select
                      value={formData.work}
                      onValueChange={(value) => setFormData({ ...formData, work: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชนิดอุปกรณ์" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map((equipment) => (
                          <SelectItem key={equipment.value} value={equipment.value}>
                            {equipment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">รายละเอียดการเบิก <span className="text-red-500">*</span></label>
                    <textarea
                      placeholder="ระบุรายละเอียดอุปกรณ์ที่ต้องการเบิก จำนวน และเหตุผล..."
                      value={formData.Ref}
                      onChange={(e) => setFormData({ ...formData, Ref: e.target.value })}
                      required
                      className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">แนบรูปภาพ / วิดีโอ</label>
                    <div className="space-y-2">
                      {!imagePreview ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative w-full max-w-xs">
                            {selectedImage?.type.startsWith('video/') ? (
                              <video 
                                src={imagePreview} 
                                controls 
                                preload="metadata"
                                className="w-full h-auto rounded-lg border"
                              >
                                <source src={imagePreview} type={selectedImage.type} />
                                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                              </video>
                            ) : (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-auto rounded-lg border"
                              />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              ลบไฟล์
                            </Button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        รองรับไฟล์: JPG, PNG, GIF, MP4, MOV (ไม่เกิน 100MB) - ไม่บังคับ
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Cost Management Section */}
              {/* <div className="space-y-4 border-t pt-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">มีค่าใช้จ่ายหรือไม่</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasCost"
                        checked={hasCost === false}
                        onChange={() => {
                          setHasCost(false)
                          setCostType("")
                          setSelectedEquipment("")
                          setEquipmentPrice("")
                          setPurchasePrice("")
                          setPurchaseDescription("")
                        }}
                        className="w-4 h-4"
                      />
                      <span>ไม่มีค่าใช้จ่าย</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasCost"
                        checked={hasCost === true}
                        onChange={() => setHasCost(true)}
                        className="w-4 h-4"
                      />
                      <span>มีค่าใช้จ่าย</span>
                    </label>
                  </div>
                </div>

                {hasCost && (
                  <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">ค่าใช้จ่าย</label>
                      <Select
                        value={costType}
                        onValueChange={(value: "withdraw" | "purchase") => {
                          setCostType(value)
                          setSelectedEquipment("")
                          setEquipmentPrice("")
                          setPurchasePrice("")
                          setPurchaseDescription("")
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ระบุค่าใช้จ่าย (ทำไม่กรอกหน้า 0)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="withdraw">เบิกจ่าย</SelectItem>
                          <SelectItem value="purchase">สั่งซื้อ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {costType === "withdraw" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">เลือกอุปกรณ์ <span className="text-red-500">*</span></label>
                          <Select
                            value={selectedEquipment}
                            onValueChange={(value) => {
                              setSelectedEquipment(value)
                              const equipment = equipmentList.find(e => e.name === value)
                              setEquipmentPrice(equipment?.price || "")
                            }}
                            required={hasCost && costType === "withdraw"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกอุปกรณ์" />
                            </SelectTrigger>
                            <SelectContent>
                              {equipmentList.map((equipment) => (
                                <SelectItem key={equipment.name} value={equipment.name}>
                                  {equipment.name} - ฿{equipment.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedEquipment && (
                          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">ราคา:</span>
                              <span className="text-lg font-bold text-blue-600">฿{equipmentPrice}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {costType === "purchase" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">ราคา (บาท) <span className="text-red-500">*</span></label>
                          <Input
                            type="number"
                            placeholder="กรอกราคา"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            required={hasCost && costType === "purchase"}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">คำอธิบาย <span className="text-red-500">*</span></label>
                          <textarea
                            placeholder="ระบุรายละเอียดการสั่งซื้อ..."
                            value={purchaseDescription}
                            onChange={(e) => setPurchaseDescription(e.target.value)}
                            required={hasCost && costType === "purchase"}
                            className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div> */}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "กำลังส่งคำขอ..." : formType === "repair" ? "ส่งคำขอซ่อม" : "ส่งคำขอเบิก"}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
