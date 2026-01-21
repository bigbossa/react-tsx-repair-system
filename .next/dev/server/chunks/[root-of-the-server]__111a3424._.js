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
"[project]/app/react-tsx-repair-system/app/api/company/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
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
        const id = searchParams.get('id');
        if (id) {
            // ดึงข้อมูล company ตาม ID
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company WHERE id = $1", [
                id
            ]);
            if (result.rows.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "ไม่พบข้อมูลบริษัท"
                }, {
                    status: 404
                });
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows[0]);
        } else {
            // ดึงข้อมูล company ทั้งหมด เรียงตามชื่อ
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company ORDER BY company_name ASC");
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result.rows);
        }
    } catch (error) {
        console.error("Database error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "เกิดข้อผิดพลาดในการดึงข้อมูล"
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { company_code, company_name } = body;
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!company_code || !company_name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "กรุณากรอกรหัสและชื่อบริษัท"
            }, {
                status: 400
            });
        }
        // ตรวจสอบว่ารหัสซ้ำหรือไม่
        const checkCode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company WHERE company_code = $1", [
            company_code
        ]);
        if (checkCode.rows.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "รหัสบริษัทนี้มีอยู่ในระบบแล้ว"
            }, {
                status: 400
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`INSERT INTO company (company_code, company_name, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING *`, [
            company_code,
            company_name
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "เพิ่มบริษัทสำเร็จ",
            data: result.rows[0]
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Database error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล"
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { id, company_code, company_name } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ไม่พบ ID ของบริษัท"
            }, {
                status: 400
            });
        }
        // ตรวจสอบว่า company มีอยู่จริง
        const checkResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company WHERE id = $1", [
            id
        ]);
        if (checkResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ไม่พบข้อมูลบริษัท"
            }, {
                status: 404
            });
        }
        // ตรวจสอบรหัสซ้ำ (ยกเว้นตัวเอง)
        const checkCode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company WHERE company_code = $1 AND id != $2", [
            company_code,
            id
        ]);
        if (checkCode.rows.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "รหัสบริษัทนี้มีอยู่ในระบบแล้ว"
            }, {
                status: 400
            });
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(`UPDATE company 
       SET company_code = $1, company_name = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`, [
            company_code,
            company_name,
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "แก้ไขข้อมูลสำเร็จ",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Database error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล"
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ไม่พบ ID ของบริษัท"
            }, {
                status: 400
            });
        }
        // ตรวจสอบว่า company มีอยู่จริง
        const checkResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("SELECT * FROM company WHERE id = $1", [
            id
        ]);
        if (checkResult.rows.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "ไม่พบข้อมูลบริษัท"
            }, {
                status: 404
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])("DELETE FROM company WHERE id = $1", [
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "ลบบริษัทสำเร็จ"
        });
    } catch (error) {
        console.error("Database error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$react$2d$tsx$2d$repair$2d$system$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "เกิดข้อผิดพลาดในการลบข้อมูล"
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__111a3424._.js.map