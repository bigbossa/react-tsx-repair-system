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
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/line-notify.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>notifyStatusChange
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
/**
 * ส่งข้อความผ่าน LINE Official Account (Push Message)
 * @param to - User ID หรือ Group ID ที่จะส่ง
 * @param messages - Array ของข้อความที่จะส่ง
 * @returns Promise<boolean> - สำเร็จหรือไม่
 */ async function sendPushMessage(to, messages) {
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
}),
"[project]/app/api/tickets/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$line$2d$notify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/line-notify.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET(request, context) {
    try {
        const { id } = await context.params;
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])('SELECT * FROM repairrequest WHERE request_id = $1', [
            id
        ]);
        if (result.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Ticket not found"
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows[0]);
    } catch (error) {
        console.error('Failed to fetch ticket:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch ticket"
        }, {
            status: 500
        });
    }
}
async function PUT(request, context) {
    try {
        const { id } = await context.params;
        const data = await request.json();
        const allowedStatusValues = [
            '0',
            '1',
            '2',
            '3',
            '4',
            0,
            1,
            2,
            3,
            4
        ];
        // ดึงข้อมูลเก่าก่อนอัปเดต (เพื่อเช็คสถานะเดิม)
        const oldTicketResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])('SELECT "Status", username FROM repairrequest WHERE request_id = $1', [
            id
        ]);
        const oldStatus = oldTicketResult.rows.length > 0 ? String(oldTicketResult.rows[0].Status) : null;
        const username = oldTicketResult.rows.length > 0 ? oldTicketResult.rows[0].username : null;
        // Build dynamic update query based on provided fields
        const updates = [];
        const values = [];
        let paramCount = 1;
        // Handle both 'status' and 'Status' for backward compatibility
        const statusValue = data.Status !== undefined ? data.Status : data.status;
        const newStatus = statusValue !== undefined ? String(statusValue) : null;
        if (statusValue !== undefined && !allowedStatusValues.includes(statusValue)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid status value'
            }, {
                status: 400
            });
        }
        if (statusValue !== undefined) {
            updates.push(`\"Status\" = $${paramCount}`);
            values.push(Number(statusValue));
            paramCount++;
        }
        if (data.start_repair !== undefined) {
            updates.push(`" start_repair" = $${paramCount}`);
            values.push(data.start_repair);
            paramCount++;
        }
        if (data.finish_repair !== undefined) {
            updates.push(`finish_repair = $${paramCount}`);
            values.push(data.finish_repair);
            paramCount++;
        }
        if (data.finish_with !== undefined) {
            updates.push(`finish_with = $${paramCount}`);
            values.push(data.finish_with);
            paramCount++;
        }
        if (data.cost !== undefined) {
            updates.push(`cost = $${paramCount}`);
            values.push(data.cost);
            paramCount++;
        }
        if (data.price_type !== undefined) {
            updates.push(`price_type = $${paramCount}`);
            values.push(data.price_type);
            paramCount++;
        }
        if (data.description_price !== undefined) {
            updates.push(`description_price = $${paramCount}`);
            values.push(data.description_price);
            paramCount++;
        }
        if (data.total_date !== undefined) {
            updates.push(`total_date = $${paramCount}`);
            values.push(data.total_date);
            paramCount++;
        }
        // ถ้ามีการอัปเดต Rep_info (รายละเอียดการซ่อม) ให้เลื่อนข้อมูลเดิมไปเก็บไว้
        if (data.Rep_info !== undefined) {
            // ดึงข้อมูลเดิมก่อน
            const currentDataResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])('SELECT "Rep_info", "Re_Rep1" FROM repairrequest WHERE request_id = $1', [
                id
            ]);
            if (currentDataResult.rows.length > 0) {
                const currentRepInfo = currentDataResult.rows[0].Rep_info;
                const currentReRep1 = currentDataResult.rows[0].Re_Rep1;
                // ถ้ามีข้อมูลเดิมใน Rep_info ให้เลื่อนไป Re_Rep1 และ Re_Rep2
                if (currentRepInfo && currentRepInfo.trim() !== '') {
                    console.log('Moving repair info history:', {
                        request_id: id,
                        oldRepInfo: currentRepInfo,
                        oldReRep1: currentReRep1,
                        newRepInfo: data.Rep_info
                    });
                    // เลื่อน Re_Rep1 → Re_Rep2
                    updates.push(`"Re_Rep2" = $${paramCount}`);
                    values.push(currentReRep1);
                    paramCount++;
                    // เลื่อน Rep_info เดิม → Re_Rep1
                    updates.push(`"Re_Rep1" = $${paramCount}`);
                    values.push(currentRepInfo);
                    paramCount++;
                }
            }
            // บันทึกข้อมูลใหม่ลง Rep_info
            updates.push(`"Rep_info" = $${paramCount}`);
            values.push(data.Rep_info);
            paramCount++;
        }
        // ถ้ามีการอัปเดต Comment_re (เหตุผลที่ไม่ผ่านการประเมิน) ให้เลื่อนข้อมูลเดิมไปเก็บไว้
        if (data.Comment_re !== undefined) {
            // ดึงข้อมูลเดิมก่อน
            const currentCommentResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])('SELECT "Comment_re", "Comment_re2" FROM repairrequest WHERE request_id = $1', [
                id
            ]);
            if (currentCommentResult.rows.length > 0) {
                const currentCommentRe = currentCommentResult.rows[0].Comment_re;
                const currentCommentRe2 = currentCommentResult.rows[0].Comment_re2;
                // ถ้ามีข้อมูลเดิมใน Comment_re ให้เลื่อนไป Comment_re2 และ Comment_re3
                if (currentCommentRe && currentCommentRe.trim() !== '') {
                    console.log('Moving comment history:', {
                        request_id: id,
                        oldCommentRe: currentCommentRe,
                        oldCommentRe2: currentCommentRe2,
                        newCommentRe: data.Comment_re
                    });
                    // เลื่อน Comment_re2 → Comment_re3
                    updates.push(`"Comment_re3" = $${paramCount}`);
                    values.push(currentCommentRe2);
                    paramCount++;
                    // เลื่อน Comment_re เดิม → Comment_re2
                    updates.push(`"Comment_re2" = $${paramCount}`);
                    values.push(currentCommentRe);
                    paramCount++;
                }
            }
            // บันทึกข้อมูลใหม่ลง Comment_re
            updates.push(`"Comment_re" = $${paramCount}`);
            values.push(data.Comment_re);
            paramCount++;
        }
        if (data.cancel_whit !== undefined) {
            updates.push(`cancel_whit = $${paramCount}`);
            values.push(data.cancel_whit);
            paramCount++;
        }
        if (data.repair_count !== undefined) {
            updates.push(`repair_count = $${paramCount}`);
            values.push(data.repair_count);
            paramCount++;
        }
        if (data.type_of_work !== undefined) {
            updates.push(`type_of_work = $${paramCount}`);
            values.push(data.type_of_work);
            paramCount++;
        }
        if (data.work !== undefined) {
            updates.push(`work = $${paramCount}`);
            values.push(data.work);
            paramCount++;
        }
        if (data.detail_work !== undefined) {
            updates.push(`detail_work = $${paramCount}`);
            values.push(data.detail_work);
            paramCount++;
        }
        // Always update updated_at
        updates.push('updated_at = NOW()');
        if (updates.length === 1) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No fields to update"
            }, {
                status: 400
            });
        }
        values.push(id);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`UPDATE repairrequest 
       SET ${updates.join(', ')} 
       WHERE request_id = $${paramCount} 
       RETURNING *`, values);
        if (result.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Ticket not found"
            }, {
                status: 404
            });
        }
        // ส่งการแจ้งเตือนถ้าสถานะเปลี่ยน
        if (newStatus && oldStatus && newStatus !== oldStatus && username) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$line$2d$notify$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["notifyStatusChange"])({
                request_id: id,
                username: username,
                oldStatus: oldStatus,
                newStatus: newStatus
            }).catch((error)=>{
                console.error('Failed to send LINE status notification:', error);
            // ไม่ให้ error จาก LINE แจ้งเตือนส่งผลต่อการอัปเดต ticket
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update ticket:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to update ticket"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__59afa5e9._.js.map