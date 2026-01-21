/**
 * LINE Official Account Integration (Messaging API)
 * ส่งข้อความผ่าน LINE Official Account
 */

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message'

interface LineMessageOptions {
  message: string
  imageUrl?: string
  userId?: string // ส่งถึงผู้ใช้เฉพาะคน (optional)
}

interface FlexMessage {
  type: string
  altText: string
  contents: any
}

/**
 * สร้าง Flex Message สำหรับการแจ้งเตือน
 */
function createFlexMessage(
  title: string, 
  details: { label: string; value: string }[], 
  color: string = '#06C755',
  requestId?: string,
  currentStatus?: string
): FlexMessage {
  const contents: any = {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          color: '#ffffff',
          weight: 'bold',
          size: 'lg'
        }
      ],
      backgroundColor: color,
      paddingAll: '15px'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: details.map(detail => ({
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: detail.label,
            color: '#999999',
            size: 'sm',
            margin: 'md'
          },
          {
            type: 'text',
            text: detail.value,
            color: '#333333',
            size: 'md',
            weight: 'bold',
            wrap: true
          }
        ],
        margin: 'lg'
      })),
      paddingAll: '20px'
    }
  }

  // เพิ่มปุ่มถ้ามี requestId
  if (requestId) {
    const buttons: any[] = []
    
    // เฉพาะสถานะ "รอดำเนินการ" (0) เท่านั้นที่แสดงปุ่ม "รับงาน"
    if (currentStatus === '0') {
      buttons.push({
        type: 'button',
        action: {
          type: 'uri',
          label: '✅ รับงาน',
          uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticket=${requestId}&action=accept`
        },
        style: 'primary',
        color: '#06C755',
        height: 'sm'
      })
    }
    
    // ปุ่มดูรายละเอียดแสดงเสมอ
    buttons.push({
      type: 'button',
      action: {
        type: 'uri',
        label: '👁️ ดูรายละเอียด',
        uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?ticket=${requestId}`
      },
      style: 'link',
      height: 'sm'
    })
    
    if (buttons.length > 0) {
      contents.footer = {
        type: 'box',
        layout: 'vertical',
        contents: buttons,
        spacing: 'sm',
        paddingAll: '20px'
      }
    }
  }

  return {
    type: 'flex',
    altText: title,
    contents
  }
}

/**
 * ส่งข้อความผ่าน LINE Official Account (Push Message)
 * @param to - User ID หรือ Group ID ที่จะส่ง
 * @param messages - Array ของข้อความที่จะส่ง
 * @returns Promise<boolean> - สำเร็จหรือไม่
 */
export async function sendPushMessage(to: string, messages: any[]): Promise<boolean> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!channelAccessToken) {
    console.warn('LINE_CHANNEL_ACCESS_TOKEN is not configured')
    return false
  }

  try {
    const response = await fetch(`${LINE_MESSAGING_API}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to,
        messages
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LINE Messaging API error:', response.status, errorText)
      return false
    }

    console.log('LINE message sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send LINE message:', error)
    return false
  }
}

/**
 * ส่งข้อความแบบ Broadcast (ส่งไปหาทุกคนที่เป็นเพื่อนกับ Bot)
 * @param messages - Array ของข้อความที่จะส่ง
 * @returns Promise<boolean> - สำเร็จหรือไม่
 */
async function sendBroadcastMessage(messages: any[]): Promise<boolean> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN

  if (!channelAccessToken) {
    console.warn('LINE_CHANNEL_ACCESS_TOKEN is not configured')
    return false
  }

  try {
    const response = await fetch(`${LINE_MESSAGING_API}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        messages
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LINE Broadcast API error:', response.status, errorText)
      return false
    }

    console.log('LINE broadcast sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send LINE broadcast:', error)
    return false
  }
}

/**
 * ส่งการแจ้งเตือนสำหรับคำขอซ่อมใหม่
 */
export async function notifyNewRepairRequest(ticket: {
  request_id: string
  asset_id: string
  username: string
  work: string
  type_of_work: string
  detail_work: string
  created_at?: Date
}): Promise<boolean> {
  const dateStr = ticket.created_at 
    ? new Date(ticket.created_at).toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

  // สร้าง Flex Message พร้อมปุ่มรับงาน
  const flexMessage = createFlexMessage(
    '🔔 มีคำขอซ่อมใหม่!',
    [
      { label: 'เลขที่คำขอ', value: ticket.request_id },
      { label: 'ผู้แจ้ง', value: ticket.username },
      { label: 'รหัสทรัพย์สิน', value: ticket.asset_id },
      { label: 'ชนิดของงาน', value: ticket.work },
      { label: 'ประเภท', value: ticket.type_of_work },
      { label: 'รายละเอียด', value: ticket.detail_work },
      { label: 'วันเวลา', value: dateStr }
    ],
    '#06C755',
    ticket.request_id,
    '0' // สถานะเริ่มต้นของคำขอใหม่คือ "รอดำเนินการ" (0)
  )

  // ส่งแบบ Broadcast (ส่งถึงทุกคนที่เป็นเพื่อนกับ Bot)
  const adminUserId = process.env.LINE_ADMIN_USER_ID
  
  if (adminUserId) {
    // ส่งถึง Admin เฉพาะคน
    return sendPushMessage(adminUserId, [flexMessage])
  } else {
    // ส่งแบบ Broadcast ถึงทุกคน
    return sendBroadcastMessage([flexMessage])
  }
}

/**
 * ส่งการแจ้งเตือนสำหรับคำขอเบิกอุปกรณ์
 */
export async function notifyNewEquipmentRequest(req: {
  request_id: string
  username: string
  equipment: string
  detail: string
  created_at?: Date
}): Promise<boolean> {
  const dateStr = req.created_at 
    ? new Date(req.created_at).toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

  const flexMessage = createFlexMessage(
    '🧾 คำขอเบิกอุปกรณ์ใหม่',
    [
      { label: 'เลขที่คำขอ', value: req.request_id },
      { label: 'ผู้ขอ', value: req.username },
      { label: 'อุปกรณ์', value: req.equipment || '-' },
      { label: 'รายละเอียด', value: req.detail || '-' },
      { label: 'วันเวลา', value: dateStr }
    ],
    '#0EA5E9', // light blue
    req.request_id,
    '0'
  )

  const adminUserId = process.env.LINE_ADMIN_USER_ID

  if (adminUserId) {
    return sendPushMessage(adminUserId, [flexMessage])
  } else {
    return sendBroadcastMessage([flexMessage])
  }
}

/**
 * ส่งการแจ้งเตือนเมื่อสถานะเปลี่ยน
 */
export async function notifyStatusChange(ticket: {
  request_id: string
  username: string
  oldStatus: string
  newStatus: string
  lineUserId?: string // User ID ของผู้ใช้ที่จะรับแจ้งเตือน
}): Promise<boolean> {
  const statusMap: { [key: string]: string } = {
    '0': 'รอดำเนินการ',
    '1': 'กำลังดำเนินการ',
    '2': 'เสร็จสิ้น',
    '3': 'ยกเลิก',
    '4': 'รอการประเมิน'
  }

  const statusEmoji: { [key: string]: string } = {
    '0': '⏳',
    '1': '🔧',
    '2': '✅',
    '3': '❌',
    '4': '📋'
  }

  const statusColor: { [key: string]: string } = {
    '0': '#FFA500',
    '1': '#0084FF',
    '2': '#06C755',
    '3': '#999999',
    '4': '#FFD700'
  }

  const dateStr = new Date().toLocaleString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const oldStatusText = statusMap[ticket.oldStatus] || ticket.oldStatus
  const newStatusText = statusMap[ticket.newStatus] || ticket.newStatus
  const emoji = statusEmoji[ticket.newStatus] || '🔄'
  const color = statusColor[ticket.newStatus] || '#0084FF'

  // สร้าง Flex Message พร้อมปุ่ม (ปุ่มจะเปลี่ยนตามสถานะปัจจุบัน)
  const flexMessage = createFlexMessage(
    `${emoji} อัปเดตสถานะ: ${newStatusText}`,
    [
      { label: 'เลขที่คำขอ', value: ticket.request_id },
      { label: 'ผู้แจ้ง', value: ticket.username },
      { label: 'สถานะเดิม', value: `${statusEmoji[ticket.oldStatus] || ''}  ${oldStatusText}` },
      { label: 'สถานะใหม่', value: `${emoji} ${newStatusText}` },
      { label: 'วันเวลา', value: dateStr }
    ],
    color,
    ticket.request_id,
    ticket.newStatus // ส่งสถานะปัจจุบันเพื่อแสดงปุ่มที่เหมาะสม
  )

  // ส่งแบบ Broadcast (แจ้งทุกคน)
  const adminUserId = process.env.LINE_ADMIN_USER_ID
  
  if (ticket.lineUserId) {
    // ส่งถึงผู้ใช้เฉพาะคน
    return sendPushMessage(ticket.lineUserId, [flexMessage])
  } else if (adminUserId) {
    // ส่งถึง Admin
    return sendPushMessage(adminUserId, [flexMessage])
  } else {
    // ส่งแบบ Broadcast
    return sendBroadcastMessage([flexMessage])
  }
}

/**
 * ส่งแบบประเมินความพึงพอใจการบำรุงรักษาไปยังเจ้าของเครื่อง
 */
export async function sendMaintenanceFeedbackLink(params: {
  asset_code: string
  device_name: string
  user_name: string
  checked_by: string
  feedbackUrl: string
  lineUserId?: string
}): Promise<boolean> {
  const dateStr = new Date().toLocaleString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  // สร้าง Flex Message แบบสวยงามสำหรับแบบประเมิน
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `✅ การบำรุงรักษา ${params.asset_code} เสร็จสิ้น - กรุณาประเมินความพึงพอใจ`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '✅ MA เสร็จสิ้น',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold',
            align: 'center'
          },
          {
            type: 'text',
            text: 'ขอความคิดเห็นจากท่าน',
            color: '#ffffff',
            size: 'sm',
            align: 'center',
            margin: 'sm'
          }
        ],
        backgroundColor: '#06C755',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'การบำรุงรักษาอุปกรณ์ของท่านเสร็จสิ้นแล้ว',
                size: 'md',
                color: '#111111',
                wrap: true,
                weight: 'bold'
              }
            ],
            margin: 'none'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '🖥️ อุปกรณ์:',
                    color: '#666666',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: params.device_name,
                    wrap: true,
                    color: '#111111',
                    size: 'sm',
                    flex: 3,
                    weight: 'bold'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '🏷️ รหัสทรัพย์สิน:',
                    color: '#666666',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: params.asset_code,
                    wrap: true,
                    color: '#111111',
                    size: 'sm',
                    flex: 3,
                    weight: 'bold'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '👤 เจ้าของ:',
                    color: '#666666',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: params.user_name,
                    wrap: true,
                    color: '#111111',
                    size: 'sm',
                    flex: 3
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '🔧 ผู้ดำเนินการ:',
                    color: '#666666',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: params.checked_by,
                    wrap: true,
                    color: '#111111',
                    size: 'sm',
                    flex: 3
                  }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '📅 วันเวลา:',
                    color: '#666666',
                    size: 'sm',
                    flex: 2
                  },
                  {
                    type: 'text',
                    text: dateStr,
                    wrap: true,
                    color: '#111111',
                    size: 'sm',
                    flex: 3
                  }
                ]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '⭐ กรุณาประเมินความพึงพอใจ',
                size: 'sm',
                color: '#06C755',
                weight: 'bold',
                align: 'center'
              }
            ],
            margin: 'lg',
            paddingAll: '10px',
            backgroundColor: '#E8F5E9',
            cornerRadius: '10px'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📋 ประเมินความพึงพอใจ',
              uri: params.feedbackUrl
            },
            color: '#06C755'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ความคิดเห็นของท่านมีความสำคัญต่อเรา',
                size: 'xxs',
                color: '#999999',
                align: 'center'
              }
            ],
            margin: 'sm'
          }
        ],
        flex: 0
      }
    }
  }

  // ส่งถึงเจ้าของเครื่อง
  if (params.lineUserId) {
    return sendPushMessage(params.lineUserId, [flexMessage])
  } else {
    // ถ้าไม่มี LINE User ID ให้ส่งแบบ broadcast (สำหรับทดสอบ)
    console.warn('No LINE User ID provided, sending as broadcast')
    return sendBroadcastMessage([flexMessage])
  }
}
