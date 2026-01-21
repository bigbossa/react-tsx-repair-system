import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * แปลงวันที่เป็นรูปแบบไทย (พ.ศ.) โดยอัตโนมัติ
 * ฟังก์ชันนี้จะตรวจสอบว่าข้อมูลที่ได้รับเป็น ค.ศ. หรือ พ.ศ. อยู่แล้ว
 * แล้วแปลงให้แสดงผลเป็น พ.ศ. เสมอ
 * 
 * @param dateString - วันที่ในรูปแบบ ISO, Date object, หรือ string
 * @param format - 'short' = DD/MM/YYYY, 'long' = DD เดือน YYYY
 * @returns วันที่ในรูปแบบพุทธศักราช
 */
export function formatDateThai(dateString: string | Date | null | undefined, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const day = date.getDate()
    const month = date.getMonth()
    let year = date.getFullYear()
    
    // ตรวจสอบว่าปีเป็น ค.ศ. หรือ พ.ศ.
    // ถ้าปีน้อยกว่า 2300 แสดงว่าเป็น ค.ศ. ต้องแปลงเป็น พ.ศ.
    // ถ้าปีมากกว่าหรือเท่ากับ 2300 แสดงว่าเป็น พ.ศ. อยู่แล้ว
    if (year < 2300) {
      year = year + 543 // แปลง ค.ศ. เป็น พ.ศ.
    }
    
    if (format === 'long') {
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ]
      return `${day} ${thaiMonths[month]} ${year}`
    }
    
    // รูปแบบสั้น: DD/MM/YYYY
    const dayStr = String(day).padStart(2, '0')
    const monthStr = String(month + 1).padStart(2, '0')
    return `${dayStr}/${monthStr}/${year}`
  } catch (error) {
    return '-'
  }
}

/**
 * แปลงวันที่และเวลาเป็นรูปแบบไทย (พ.ศ.) โดยอัตโนมัติ
 * ฟังก์ชันนี้จะใช้ toLocaleString กับ locale 'th-TH' ซึ่งจะแปลงเป็น พ.ศ. อัตโนมัติ
 * 
 * @param dateString - วันที่และเวลา
 * @returns วันที่และเวลาในรูปแบบพุทธศักราช
 */
export function formatDateTimeThai(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    // ใช้ toLocaleString กับ locale ไทย ซึ่งจะแสดงปีเป็น พ.ศ. อัตโนมัติ
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return '-'
  }
}
