"use client"

import type { Ticket } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TicketCardProps {
  ticket: any
  onClick?: () => void
}

const statusColors = {
  0: "bg-yellow-100 text-yellow-800 border-yellow-300",
  1: "bg-blue-100 text-blue-800 border-blue-300",
  2: "bg-green-100 text-green-800 border-green-300",
  3: "bg-red-100 text-red-800 border-red-300",
  4: "bg-orange-100 text-orange-800 border-orange-300",
}

const statusText = {
  0: "รอดำเนินการ",
  1: "กำลังดำเนินการ",
  2: "เสร็จสิ้น",
  3: "ยกเลิก",
  4: "รอการประเมิน",
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const status = ticket.Status ?? 0
  const formType = ticket.form_type || 'repair'
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold">{ticket.request_id}</CardTitle>
              <Badge variant="outline" className={formType === 'request' ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-blue-50 text-blue-700 border-blue-300'}>
                {formType === 'request' ? 'เบิกอุปกรณ์' : 'แจ้งซ่อม'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">รหัสทรัพย์สิน: {ticket.asset_id || '-'}</p>
          </div>
          <Badge className={statusColors[status]}>{statusText[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            ผู้แจ้ง: {ticket.username}
          </p>
          {ticket.created_at && (
            <p className="text-xs text-muted-foreground">
              วันที่แจ้ง: {new Date(ticket.created_at).toLocaleDateString('th-TH')}
            </p>
          )}
          {ticket.Rep_info && (
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-1">รายละเอียดการซ่อม:</p>
              <p className="text-xs text-blue-700 line-clamp-2">{ticket.Rep_info}</p>
            </div>
          )}
          {ticket.cost && (
            <p className="text-xs text-green-700 font-semibold">
              ค่าใช้จ่าย: {ticket.cost}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
