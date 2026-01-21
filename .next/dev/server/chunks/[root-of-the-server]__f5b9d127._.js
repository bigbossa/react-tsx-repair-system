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
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

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
"[project]/app/react-tsx-repair-system/app/api/feedback/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/react-tsx-repair-system/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/react-tsx-repair-system/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const request_id = searchParams.get('request_id');
        const withTechnician = searchParams.get('with_technician') === 'true';
        // เพิ่ม column finish_with ถ้ายังไม่มี
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`
        ALTER TABLE feedback ADD COLUMN IF NOT EXISTS finish_with VARCHAR(255)
      `);
        } catch (e) {
        // ignore if column already exists
        }
        let result;
        if (request_id) {
            // ค้นหาตาม request_id - ใช้ queryRepair เพราะตาราง feedback อยู่ใน database itsupport
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT * FROM feedback WHERE form_name = $1 ORDER BY created_at DESC`, [
                request_id
            ]);
        } else if (withTechnician) {
            // ดึงข้อมูล feedback พร้อม join กับ repairrequest เพื่อดึง finish_with (ถ้าไม่มีใน feedback)
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT f.*, 
                COALESCE(f.finish_with, r.finish_with) as finish_with, 
                r.username as repair_username, 
                r.device_name 
         FROM feedback f
         LEFT JOIN repairrequest r ON f.form_name = r.request_id
         ORDER BY f.created_at DESC`);
        } else {
            // ดึงข้อมูลทั้งหมด
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT * FROM feedback ORDER BY created_at DESC`);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch feedback"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { request_id, form_status, form_description } = body;
        console.log('=== Feedback API Called ===');
        console.log('Request ID:', request_id);
        console.log('Form Status (Rating):', form_status);
        console.log('Form Description:', form_description);
        if (!request_id || !form_status) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "request_id and form_status are required"
            }, {
                status: 400
            });
        }
        const rating = parseInt(form_status);
        const comment = form_description || '';
        // ตรวจสอบว่าถ้าประเมินไม่ผ่าน ต้องกรอกเหตุผล
        if (rating < 3 && (!comment || comment.trim() === '')) {
            console.log('ERROR: Comment required for rating < 3');
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "กรุณาระบุเหตุผลที่ประเมินไม่ผ่าน"
            }, {
                status: 400
            });
        }
        // ดึงข้อมูลผู้ซ่อม (finish_with) จาก ticket เพื่อบันทึกใน feedback
        let finishWith = null;
        try {
            const ticketData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT finish_with FROM repairrequest WHERE request_id = $1`, [
                request_id
            ]);
            if (ticketData.rows.length > 0) {
                finishWith = ticketData.rows[0].finish_with;
            }
        } catch (e) {
            console.log('Could not get finish_with:', e);
        }
        // เพิ่ม column finish_with ใน feedback table ถ้ายังไม่มี
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`
        ALTER TABLE feedback ADD COLUMN IF NOT EXISTS finish_with VARCHAR(255)
      `);
        } catch (e) {
        // ignore if column already exists
        }
        // บันทึก feedback พร้อม finish_with
        console.log('Inserting feedback to database...');
        console.log('Finish With:', finishWith);
        // เก็บ request_id ใน form_name และ rating ใน form_status
        // ใช้ queryRepair เพราะตาราง feedback อยู่ใน database itsupport
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`INSERT INTO feedback (form_name, form_status, form_description, is_active, finish_with) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`, [
            request_id,
            form_status,
            comment || null,
            true,
            finishWith
        ]);
        console.log('Feedback inserted successfully');
        // ถ้าประเมินไม่ผ่าน (rating < 3) เปลี่ยนสถานะกลับไปรอดำเนินการ
        if (rating < 3) {
            console.log('Rating < 3, will move comment history...');
            // ดึงข้อมูล Comment เดิม
            const commentData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`SELECT "Comment_re", "Comment_re2" FROM repairrequest WHERE request_id = $1`, [
                request_id
            ]);
            const updates = [];
            const values = [];
            let paramCount = 1;
            const newComment = `[${new Date().toISOString().split('T')[0]}] ประเมินไม่ผ่าน (Rating: ${rating}): ${comment}`;
            if (commentData.rows.length > 0) {
                const currentCommentRe = commentData.rows[0].Comment_re;
                const currentCommentRe2 = commentData.rows[0].Comment_re2;
                console.log('=== Moving comment history (like Rep_info) ===');
                console.log('Request ID:', request_id);
                console.log('Old Comment_re:', currentCommentRe);
                console.log('Old Comment_re2:', currentCommentRe2);
                console.log('New Comment:', newComment);
                // ถ้ามีข้อมูลเดิมใน Comment_re ให้เลื่อนไป Comment_re2 และ Comment_re3
                if (currentCommentRe && currentCommentRe.trim() !== '') {
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
            values.push(newComment);
            paramCount++;
            // เปลี่ยนสถานะเป็น 0 (รอดำเนินการ)
            updates.push(`"Status" = $${paramCount}`);
            values.push(0);
            paramCount++;
            // อัปเดต updated_at
            updates.push('updated_at = NOW()');
            // เพิ่ม request_id เป็น parameter สุดท้าย
            values.push(request_id);
            // Execute UPDATE
            const updateResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`UPDATE repairrequest 
         SET ${updates.join(', ')} 
         WHERE request_id = $${paramCount} 
         RETURNING "Comment_re", "Comment_re2", "Comment_re3"`, values);
            console.log('=== After update ===');
            if (updateResult.rows.length > 0) {
                console.log('New Comment_re:', updateResult.rows[0].Comment_re);
                console.log('New Comment_re2:', updateResult.rows[0].Comment_re2);
                console.log('New Comment_re3:', updateResult.rows[0].Comment_re3);
            }
            console.log('========================');
        } else {
            // ถ้าประเมินผ่าน (rating >= 3) เปลี่ยนสถานะเป็น "เสร็จสิ้น" (status = 2)
            // อัพเดตจะทำใน FeedbackDialog แล้ว ไม่ต้องทำที่นี่
            console.log('Rating >= 3, status will be updated by FeedbackDialog');
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows[0], {
            status: 201
        });
    } catch (error) {
        console.error("Error creating feedback:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to create feedback"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5b9d127._.js.map