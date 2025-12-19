import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * LINE Webhook Endpoint
 * รับข้อความและ events จาก LINE Messaging API
 */

interface LineEvent {
  type: string
  timestamp: number
  source: {
    type: string
    userId?: string
    groupId?: string
    roomId?: string
  }
  replyToken?: string
  message?: {
    type: string
    id: string
    text?: string
  }
}

interface LineWebhookBody {
  destination: string
  events: LineEvent[]
}

/**
 * ตรวจสอบ Signature จาก LINE
 */
function validateSignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  if (!channelSecret) {
    console.error('LINE_CHANNEL_SECRET is not configured')
    return false
  }

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')

  return hash === signature
}

/**
 * ตอบกลับข้อความไปหา LINE
 */
async function replyMessage(replyToken: string, messages: any[]): Promise<boolean> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not configured')
    return false
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        replyToken,
        messages
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LINE Reply API error:', response.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to reply LINE message:', error)
    return false
  }
}

/**
 * POST /api/webhook/line
 * รับ webhook events จาก LINE
 */
export async function POST(request: NextRequest) {
  try {
    // อ่าน body เป็น text เพื่อตรวจสอบ signature
    const body = await request.text()
    const signature = request.headers.get('x-line-signature')

    // ตรวจสอบ signature
    if (!signature || !validateSignature(body, signature)) {
      console.error('Invalid LINE signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse JSON
    const data: LineWebhookBody = JSON.parse(body)
    
    console.log('LINE Webhook received:', {
      destination: data.destination,
      events: data.events.length
    })

    // จัดการแต่ละ event
    for (const event of data.events) {
      console.log('Processing event:', event.type, event)

      // บันทึก User ID สำหรับใช้ส่งข้อความภายหลัง
      if (event.source.userId) {
        console.log('User ID:', event.source.userId)
      }

      // ตอบกลับข้อความ
      if (event.type === 'message' && event.message?.type === 'text' && event.replyToken) {
        const text = event.message.text || ''

        // ตัวอย่างคำสั่ง
        if (text === 'สวัสดี' || text.toLowerCase() === 'hello') {
          await replyMessage(event.replyToken, [
            {
              type: 'text',
              text: 'สวัสดีครับ! ยินดีต้อนรับสู่ระบบแจ้งซ่อม 🔧\n\nระบบจะแจ้งเตือนคุณอัตโนมัติเมื่อมีคำขอซ่อมใหม่หรือเมื่อสถานะเปลี่ยนแปลง'
            }
          ])
        } else if (text === 'ช่วยเหลือ' || text.toLowerCase() === 'help') {
          await replyMessage(event.replyToken, [
            {
              type: 'text',
              text: '📋 คำสั่งที่ใช้ได้:\n\n• สวัสดี - ทักทาย\n• ช่วยเหลือ - แสดงคำสั่ง\n• User ID - แสดง User ID ของคุณ\n\nระบบจะแจ้งเตือนอัตโนมัติเมื่อ:\n• มีคำขอซ่อมใหม่\n• สถานะคำขอเปลี่ยนแปลง'
            }
          ])
        } else if (text.toLowerCase() === 'user id' || text === 'ไอดี') {
          await replyMessage(event.replyToken, [
            {
              type: 'text',
              text: `User ID ของคุณ:\n${event.source.userId}\n\nสามารถนำไปตั้งค่าใน LINE_ADMIN_USER_ID เพื่อรับการแจ้งเตือนเฉพาะคุณ`
            }
          ])
        } else {
          // ตอบกลับข้อความทั่วไป
          await replyMessage(event.replyToken, [
            {
              type: 'text',
              text: `คุณส่งข้อความ: "${text}"\n\nพิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้ได้`
            }
          ])
        }
      }

      // จัดการ Follow event (เมื่อมีคนเพิ่มเพื่อน)
      if (event.type === 'follow' && event.replyToken) {
        await replyMessage(event.replyToken, [
          {
            type: 'text',
            text: '🎉 ขอบคุณที่เพิ่มเพื่อน!\n\nระบบแจ้งซ่อมจะส่งการแจ้งเตือนมาให้คุณเมื่อมีคำขอใหม่หรือเมื่อสถานะเปลี่ยนแปลง\n\nพิมพ์ "ช่วยเหลือ" เพื่อดูคำสั่งที่ใช้ได้'
          }
        ])
      }

      // จัดการ Unfollow event
      if (event.type === 'unfollow') {
        console.log('User unfollowed:', event.source.userId)
      }
    }

    // ตอบกลับ 200 OK เพื่อแจ้ง LINE ว่าได้รับ webhook แล้ว
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('LINE Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/webhook/line
 * สำหรับทดสอบว่า endpoint ทำงาน
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'LINE Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  })
}
