module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/app/react-tsx-repair-system/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>poolLogin,
    "poolRepair",
    ()=>poolRepair,
    "query",
    ()=>query,
    "queryRepair",
    ()=>queryRepair
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// User Login Database (useryc)
console.log('User Database Configuration:', {
    host: ("TURBOPACK compile-time value", "127.0.0.1"),
    port: ("TURBOPACK compile-time value", "5432"),
    database: ("TURBOPACK compile-time value", "useryc"),
    user: ("TURBOPACK compile-time value", "postgres"),
    passwordSet: !!("TURBOPACK compile-time value", "25800852")
});
const poolLogin = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    host: ("TURBOPACK compile-time value", "127.0.0.1"),
    port: parseInt(("TURBOPACK compile-time value", "5432") || '5432'),
    database: ("TURBOPACK compile-time value", "useryc"),
    user: ("TURBOPACK compile-time value", "postgres"),
    password: ("TURBOPACK compile-time value", "25800852"),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10
});
// Repair Request Database (RepairRequest)
console.log('Repair Database Configuration:', {
    host: process.env.DBRE_HOST,
    port: process.env.DBRE_PORT,
    database: process.env.DBRE_NAME,
    user: process.env.DBRE_USER,
    passwordSet: !!process.env.DBRE_PASSWORD
});
const poolRepair = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    host: process.env.DBRE_HOST,
    port: parseInt(process.env.DBRE_PORT || '5432'),
    database: process.env.DBRE_NAME,
    user: process.env.DBRE_USER,
    password: process.env.DBRE_PASSWORD,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10
});
// Test connections on startup
poolLogin.on('connect', ()=>{
    console.log('User Database connected successfully');
});
poolLogin.on('error', (err)=>{
    console.error('Unexpected user database error:', err);
});
poolRepair.on('connect', ()=>{
    console.log('Repair Database connected successfully');
});
poolRepair.on('error', (err)=>{
    console.error('Unexpected repair database error:', err);
});
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await poolLogin.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executed successfully', {
            duration,
            rows: res.rowCount
        });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function queryRepair(text, params) {
    const start = Date.now();
    try {
        const res = await poolRepair.query(text, params);
        const duration = Date.now() - start;
        console.log('Repair DB Query executed successfully', {
            duration,
            rows: res.rowCount
        });
        return res;
    } catch (error) {
        console.error('Repair database query error:', error);
        throw error;
    }
}
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/react-tsx-repair-system/lib/line-notify.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LINE Official Account Integration (Messaging API)
 * ส่งข้อความผ่าน LINE Official Account
 */ __turbopack_context__.s([
    "notifyNewEquipmentRequest",
    ()=>notifyNewEquipmentRequest,
    "notifyNewRepairRequest",
    ()=>notifyNewRepairRequest,
    "notifyStatusChange",
    ()=>notifyStatusChange,
    "sendMaintenanceFeedbackLink",
    ()=>sendMaintenanceFeedbackLink,
    "sendPushMessage",
    ()=>sendPushMessage
]);
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
/**
 * สร้าง Flex Message สำหรับการแจ้งเตือน
 */ function createFlexMessage(title, details, color = '#06C755', requestId, currentStatus) {
    const contents = {
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
            contents: details.map((detail)=>({
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
    };
    // เพิ่มปุ่มถ้ามี requestId
    if (requestId) {
        const buttons = [];
        // เฉพาะสถานะ "รอดำเนินการ" (0) เท่านั้นที่แสดงปุ่ม "รับงาน"
        if (currentStatus === '0') {
            buttons.push({
                type: 'button',
                action: {
                    type: 'uri',
                    label: '✅ รับงาน',
                    uri: `${("TURBOPACK compile-time value", "https://f8ce2ed4e801.ngrok-free.app/") || 'http://localhost:3000'}/dashboard?ticket=${requestId}&action=accept`
                },
                style: 'primary',
                color: '#06C755',
                height: 'sm'
            });
        }
        // ปุ่มดูรายละเอียดแสดงเสมอ
        buttons.push({
            type: 'button',
            action: {
                type: 'uri',
                label: '👁️ ดูรายละเอียด',
                uri: `${("TURBOPACK compile-time value", "https://f8ce2ed4e801.ngrok-free.app/") || 'http://localhost:3000'}/dashboard?ticket=${requestId}`
            },
            style: 'link',
            height: 'sm'
        });
        if (buttons.length > 0) {
            contents.footer = {
                type: 'box',
                layout: 'vertical',
                contents: buttons,
                spacing: 'sm',
                paddingAll: '20px'
            };
        }
    }
    return {
        type: 'flex',
        altText: title,
        contents
    };
}
async function sendPushMessage(to, messages) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
        console.warn('LINE_CHANNEL_ACCESS_TOKEN is not configured');
        return false;
    }
    try {
        const response = await fetch(`${LINE_MESSAGING_API}/push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
                to,
                messages
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('LINE Messaging API error:', response.status, errorText);
            return false;
        }
        console.log('LINE message sent successfully');
        return true;
    } catch (error) {
        console.error('Failed to send LINE message:', error);
        return false;
    }
}
/**
 * ส่งข้อความแบบ Broadcast (ส่งไปหาทุกคนที่เป็นเพื่อนกับ Bot)
 * @param messages - Array ของข้อความที่จะส่ง
 * @returns Promise<boolean> - สำเร็จหรือไม่
 */ async function sendBroadcastMessage(messages) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
        console.warn('LINE_CHANNEL_ACCESS_TOKEN is not configured');
        return false;
    }
    try {
        const response = await fetch(`${LINE_MESSAGING_API}/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
                messages
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('LINE Broadcast API error:', response.status, errorText);
            return false;
        }
        console.log('LINE broadcast sent successfully');
        return true;
    } catch (error) {
        console.error('Failed to send LINE broadcast:', error);
        return false;
    }
}
async function notifyNewRepairRequest(ticket) {
    const dateStr = ticket.created_at ? new Date(ticket.created_at).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok'
    });
    // สร้าง Flex Message พร้อมปุ่มรับงาน
    const flexMessage = createFlexMessage('🔔 มีคำขอซ่อมใหม่!', [
        {
            label: 'เลขที่คำขอ',
            value: ticket.request_id
        },
        {
            label: 'ผู้แจ้ง',
            value: ticket.username
        },
        {
            label: 'รหัสทรัพย์สิน',
            value: ticket.asset_id
        },
        {
            label: 'ชนิดของงาน',
            value: ticket.work
        },
        {
            label: 'ประเภท',
            value: ticket.type_of_work
        },
        {
            label: 'รายละเอียด',
            value: ticket.detail_work
        },
        {
            label: 'วันเวลา',
            value: dateStr
        }
    ], '#06C755', ticket.request_id, '0' // สถานะเริ่มต้นของคำขอใหม่คือ "รอดำเนินการ" (0)
    );
    // ส่งแบบ Broadcast (ส่งถึงทุกคนที่เป็นเพื่อนกับ Bot)
    const adminUserId = process.env.LINE_ADMIN_USER_ID;
    if (adminUserId) {
        // ส่งถึง Admin เฉพาะคน
        return sendPushMessage(adminUserId, [
            flexMessage
        ]);
    } else {
        // ส่งแบบ Broadcast ถึงทุกคน
        return sendBroadcastMessage([
            flexMessage
        ]);
    }
}
async function notifyNewEquipmentRequest(req) {
    const dateStr = req.created_at ? new Date(req.created_at).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok'
    });
    const flexMessage = createFlexMessage('🧾 คำขอเบิกอุปกรณ์ใหม่', [
        {
            label: 'เลขที่คำขอ',
            value: req.request_id
        },
        {
            label: 'ผู้ขอ',
            value: req.username
        },
        {
            label: 'อุปกรณ์',
            value: req.equipment || '-'
        },
        {
            label: 'รายละเอียด',
            value: req.detail || '-'
        },
        {
            label: 'วันเวลา',
            value: dateStr
        }
    ], '#0EA5E9', req.request_id, '0');
    const adminUserId = process.env.LINE_ADMIN_USER_ID;
    if (adminUserId) {
        return sendPushMessage(adminUserId, [
            flexMessage
        ]);
    } else {
        return sendBroadcastMessage([
            flexMessage
        ]);
    }
}
async function notifyStatusChange(ticket) {
    const statusMap = {
        '0': 'รอดำเนินการ',
        '1': 'กำลังดำเนินการ',
        '2': 'เสร็จสิ้น',
        '3': 'ยกเลิก',
        '4': 'รอการประเมิน'
    };
    const statusEmoji = {
        '0': '⏳',
        '1': '🔧',
        '2': '✅',
        '3': '❌',
        '4': '📋'
    };
    const statusColor = {
        '0': '#FFA500',
        '1': '#0084FF',
        '2': '#06C755',
        '3': '#999999',
        '4': '#FFD700'
    };
    const dateStr = new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    const oldStatusText = statusMap[ticket.oldStatus] || ticket.oldStatus;
    const newStatusText = statusMap[ticket.newStatus] || ticket.newStatus;
    const emoji = statusEmoji[ticket.newStatus] || '🔄';
    const color = statusColor[ticket.newStatus] || '#0084FF';
    // สร้าง Flex Message พร้อมปุ่ม (ปุ่มจะเปลี่ยนตามสถานะปัจจุบัน)
    const flexMessage = createFlexMessage(`${emoji} อัปเดตสถานะ: ${newStatusText}`, [
        {
            label: 'เลขที่คำขอ',
            value: ticket.request_id
        },
        {
            label: 'ผู้แจ้ง',
            value: ticket.username
        },
        {
            label: 'สถานะเดิม',
            value: `${statusEmoji[ticket.oldStatus] || ''}  ${oldStatusText}`
        },
        {
            label: 'สถานะใหม่',
            value: `${emoji} ${newStatusText}`
        },
        {
            label: 'วันเวลา',
            value: dateStr
        }
    ], color, ticket.request_id, ticket.newStatus // ส่งสถานะปัจจุบันเพื่อแสดงปุ่มที่เหมาะสม
    );
    // ส่งแบบ Broadcast (แจ้งทุกคน)
    const adminUserId = process.env.LINE_ADMIN_USER_ID;
    if (ticket.lineUserId) {
        // ส่งถึงผู้ใช้เฉพาะคน
        return sendPushMessage(ticket.lineUserId, [
            flexMessage
        ]);
    } else if (adminUserId) {
        // ส่งถึง Admin
        return sendPushMessage(adminUserId, [
            flexMessage
        ]);
    } else {
        // ส่งแบบ Broadcast
        return sendBroadcastMessage([
            flexMessage
        ]);
    }
}
async function sendMaintenanceFeedbackLink(params) {
    const dateStr = new Date().toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    // สร้าง Flex Message แบบสวยงามสำหรับแบบประเมิน
    const flexMessage = {
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
    };
    // ส่งถึงเจ้าของเครื่อง
    if (params.lineUserId) {
        return sendPushMessage(params.lineUserId, [
            flexMessage
        ]);
    } else {
        // ถ้าไม่มี LINE User ID ให้ส่งแบบ broadcast (สำหรับทดสอบ)
        console.warn('No LINE User ID provided, sending as broadcast');
        return sendBroadcastMessage([
            flexMessage
        ]);
    }
}
}),
"[project]/app/react-tsx-repair-system/app/api/tickets/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/react-tsx-repair-system/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/react-tsx-repair-system/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$line$2d$notify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/react-tsx-repair-system/lib/line-notify.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function validateTicketPayload(data) {
    const errors = [];
    const formType = data?.formType || 'repair';
    const str = (v)=>typeof v === 'string' ? v.trim() : '';
    const username = str(data?.username);
    if (!username) errors.push('username is required');
    if (formType === 'repair') {
        const assetId = str(data?.asset_id);
        if (!assetId) errors.push('asset_id is required for repair form');
        const work = str(data?.work);
        if (!work) errors.push('work is required for repair form');
    } else if (formType === 'request') {
        const equipment = str(data?.work);
        if (!equipment) errors.push('equipment (work) is required for request form');
        const detail = str(data?.Ref || data?.detail_work);
        if (!detail) errors.push('detail is required for request form');
    }
    return {
        errors
    };
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const site = searchParams.get('site');
        const sites = searchParams.get('sites') // รองรับหลายสาขา คั่นด้วย comma
        ;
        let query = '';
        const params = [];
        // กรองตามหลายสาขา (sites) หรือ สาขาเดียว (site) - join กับ Assets เพื่อดึง site
        if (sites) {
            const siteList = sites.split(',').map((s)=>s.trim()).filter((s)=>s);
            if (siteList.length > 0) {
                const placeholders = siteList.map((_, i)=>`$${i + 1}`).join(', ');
                query = `
          SELECT r.*, a.site 
          FROM repairrequest r
          LEFT JOIN public."Assets" a ON r.asset_id = a.asset_code
          WHERE a.site IN (${placeholders})
          ORDER BY r.created_at DESC
        `;
                params.push(...siteList);
            } else {
                query = 'SELECT * FROM repairrequest ORDER BY created_at DESC';
            }
        } else if (site) {
            query = `
        SELECT r.*, a.site 
        FROM repairrequest r
        LEFT JOIN public."Assets" a ON r.asset_id = a.asset_code
        WHERE a.site = $1
        ORDER BY r.created_at DESC
      `;
            params.push(site);
        } else {
            query = 'SELECT * FROM repairrequest ORDER BY created_at DESC';
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows);
    } catch (error) {
        console.error('Failed to fetch repair requests:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch repair requests"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const data = await request.json();
        const { asset_id, username, Ref, type_of_work, work, detail_work, formType, img, device_name } = data;
        const { errors } = validateTicketPayload(data);
        if (errors.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: errors.join(', ')
            }, {
                status: 400
            });
        }
        console.log('Received ticket data:', data);
        console.log('Image URL received:', img);
        // Generate request_id in format IT+YY+MM+NNN (e.g., IT6812001)
        const now = new Date();
        const thaiYear = now.getFullYear() + 543 // Convert to Buddhist year
        ;
        const year = thaiYear.toString().slice(-2) // Last 2 digits of Thai year
        ;
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `IT${year}${month}`;
        // Get the latest request_id with current month prefix
        const latestResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT request_id FROM repairrequest 
       WHERE request_id LIKE $1 
       ORDER BY request_id DESC 
       LIMIT 1`, [
            `${prefix}%`
        ]);
        let sequence = 0;
        if (latestResult.rows.length > 0) {
            // Extract the sequence number from the last request_id
            const lastId = latestResult.rows[0].request_id;
            const lastSequence = parseInt(lastId.slice(-3));
            sequence = lastSequence + 1;
        }
        const request_id = `${prefix}${sequence.toString().padStart(3, '0')}`;
        const imgValue = img || null;
        console.log('Inserting img value:', imgValue);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`INSERT INTO repairrequest (request_id, asset_id, username, "Ref", "Status", type_of_work, work, detail_work, form_type, img, device_name, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) 
       RETURNING *`, [
            request_id,
            asset_id,
            username,
            Ref,
            0,
            type_of_work,
            work,
            detail_work,
            formType || 'repair',
            imgValue,
            device_name || null
        ]);
        console.log('Inserted ticket:', result.rows[0]);
        // ส่งการแจ้งเตือนผ่าน LINE Notify
        const ticket = result.rows[0];
        if ((formType || 'repair') === 'request') {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$line$2d$notify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyNewEquipmentRequest"])({
                request_id: ticket.request_id,
                username: ticket.username,
                equipment: ticket.work,
                detail: ticket.Ref || ticket.detail_work || '',
                created_at: ticket.created_at
            }).catch((error)=>{
                console.error('Failed to send LINE equipment notification:', error);
            });
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$line$2d$notify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyNewRepairRequest"])({
                request_id: ticket.request_id,
                asset_id: ticket.asset_id,
                username: ticket.username,
                work: ticket.work,
                type_of_work: ticket.type_of_work,
                detail_work: ticket.detail_work,
                created_at: ticket.created_at
            }).catch((error)=>{
                console.error('Failed to send LINE notification:', error);
            // ไม่ให้ error จาก LINE แจ้งเตือนส่งผลต่อการสร้าง ticket
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows[0], {
            status: 201
        });
    } catch (error) {
        console.error('Failed to create repair request:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create repair request"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a7ca563c._.js.map