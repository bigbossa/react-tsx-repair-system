/**
 * สคริปต์ทดสอบการแจ้งเตือนเปลี่ยนสถานะ
 * รันด้วย: node test-status-change.js
 */

const LINE_CHANNEL_ACCESS_TOKEN = 'tzmiqbQgSrWHTLVxa++CP5h6DYUcUzDa1TKBDPwVzLkm08B5DGOnhrztPCJFEYb5Gkw3/oAhk132sZ0M5Bqgmq26BsGbIR/hGx1SQrvljtw5oS4/n3SOH+RiFf/9/3I6gvuhY71/CJFb1DJZsVEf8gdB04t89/1O/w1cDnyilFU='
const LINE_ADMIN_USER_ID = 'U1a8ce944c6ac2a564150ef8d7f6388b0'

async function testStatusChangeNotification() {
  console.log('🧪 ทดสอบการแจ้งเตือนเปลี่ยนสถานะ...')

  const statusMap = {
    '0': 'รอดำเนินการ',
    '1': 'กำลังดำเนินการ',
    '2': 'เสร็จสิ้น',
    '3': 'ยกเลิก',
    '4': 'รอการประเมิน'
  }

  const statusEmoji = {
    '0': '⏳',
    '1': '🔧',
    '2': '✅',
    '3': '❌',
    '4': '📋'
  }

  const statusColor = {
    '0': '#FFA500',
    '1': '#0084FF',
    '2': '#06C755',
    '3': '#999999',
    '4': '#FFD700'
  }

  // ทดสอบเปลี่ยนสถานะจาก "รอดำเนินการ" เป็น "กำลังดำเนินการ"
  const oldStatus = '0'
  const newStatus = '1'
  const requestId = 'IT6812003'

  const dateStr = new Date().toLocaleString('th-TH', { 
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const flexMessage = {
    type: 'flex',
    altText: `${statusEmoji[newStatus]} อัปเดตสถานะ: ${statusMap[newStatus]}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${statusEmoji[newStatus]} อัปเดตสถานะ: ${statusMap[newStatus]}`,
            color: '#ffffff',
            weight: 'bold',
            size: 'lg',
            wrap: true
          }
        ],
        backgroundColor: statusColor[newStatus],
        paddingAll: '15px'
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
                text: 'เลขที่คำขอ',
                color: '#999999',
                size: 'sm',
                margin: 'md'
              },
              {
                type: 'text',
                text: requestId,
                color: '#333333',
                size: 'md',
                weight: 'bold',
                wrap: true
              }
            ],
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ผู้แจ้ง',
                color: '#999999',
                size: 'sm',
                margin: 'md'
              },
              {
                type: 'text',
                text: 'นายสตรทพีท มาจริยา',
                color: '#333333',
                size: 'md',
                weight: 'bold',
                wrap: true
              }
            ],
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'สถานะเดิม',
                color: '#999999',
                size: 'sm',
                margin: 'md'
              },
              {
                type: 'text',
                text: `${statusEmoji[oldStatus]} ${statusMap[oldStatus]}`,
                color: '#333333',
                size: 'md',
                weight: 'bold',
                wrap: true
              }
            ],
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'สถานะใหม่',
                color: '#999999',
                size: 'sm',
                margin: 'md'
              },
              {
                type: 'text',
                text: `${statusEmoji[newStatus]} ${statusMap[newStatus]}`,
                color: '#333333',
                size: 'md',
                weight: 'bold',
                wrap: true
              }
            ],
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'วันเวลา',
                color: '#999999',
                size: 'sm',
                margin: 'md'
              },
              {
                type: 'text',
                text: dateStr,
                color: '#333333',
                size: 'md',
                weight: 'bold',
                wrap: true
              }
            ],
            margin: 'lg'
          }
        ],
        paddingAll: '20px'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '👁️ ดูรายละเอียด',
              uri: `http://192.168.19.37:3000/dashboard?ticket=${requestId}`
            },
            style: 'link',
            height: 'sm'
          }
        ],
        spacing: 'sm',
        paddingAll: '20px'
      }
    }
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: LINE_ADMIN_USER_ID,
        messages: [flexMessage]
      }),
    })

    console.log('Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ เกิดข้อผิดพลาด:', errorText)
    } else {
      const result = await response.json()
      console.log('✅ ส่งการแจ้งเตือนเปลี่ยนสถานะสำเร็จ!')
      console.log(`สถานะ: ${statusEmoji[oldStatus]} ${statusMap[oldStatus]} → ${statusEmoji[newStatus]} ${statusMap[newStatus]}`)
      console.log('Result:', result)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testStatusChangeNotification()
