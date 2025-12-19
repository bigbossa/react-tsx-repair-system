/**
 * สคริปต์ทดสอบการส่งข้อความ LINE
 * รันด้วย: node test-line-notify.js
 */

const LINE_CHANNEL_ACCESS_TOKEN = 'tzmiqbQgSrWHTLVxa++CP5h6DYUcUzDa1TKBDPwVzLkm08B5DGOnhrztPCJFEYb5Gkw3/oAhk132sZ0M5Bqgmq26BsGbIR/hGx1SQrvljtw5oS4/n3SOH+RiFf/9/3I6gvuhY71/CJFb1DJZsVEf8gdB04t89/1O/w1cDnyilFU='
const LINE_ADMIN_USER_ID = 'U1a8ce944c6ac2a564150ef8d7f6388b0'

async function testLinePushMessage() {
  console.log('🧪 ทดสอบส่งข้อความ LINE...')
  console.log('User ID:', LINE_ADMIN_USER_ID)

  const flexMessage = {
    type: 'flex',
    altText: '🔔 ทดสอบการแจ้งเตือน',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🔔 ทดสอบระบบแจ้งเตือน',
            color: '#ffffff',
            weight: 'bold',
            size: 'lg'
          }
        ],
        backgroundColor: '#06C755',
        paddingAll: '15px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'ระบบทำงานปกติ ✅',
            weight: 'bold',
            size: 'lg',
            color: '#333333'
          },
          {
            type: 'text',
            text: `เวลา: ${new Date().toLocaleString('th-TH')}`,
            size: 'sm',
            color: '#999999',
            margin: 'md'
          }
        ],
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
    const result = await response.json().catch(() => ({}))
    
    if (!response.ok) {
      console.error('❌ เกิดข้อผิดพลาด:', result)
      console.error('Response:', await response.text().catch(() => 'ไม่สามารถอ่าน response'))
    } else {
      console.log('✅ ส่งข้อความสำเร็จ!')
      console.log('Result:', result)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testLinePushMessage()
