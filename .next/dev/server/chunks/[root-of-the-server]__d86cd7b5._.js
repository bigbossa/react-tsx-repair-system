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
"[project]/app/api/assets/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function POST(request) {
    let body = {};
    // keep asset_code accessible in catch
    let finalAssetCode = null;
    try {
        body = await request.json();
        const { asset_code, user_id, user_name, company, site, department, device_name, brand, cpu, harddisk, ram, ip_address, mac_address, serial_number, number, licenseos, licensems, license1, license2, license3, license4, category, cost, purchase_date, ref_devicename, // Support legacy field names
        licenseOS, licenseMS } = body;
        // Use lowercase field names, fallback to legacy camelCase if provided
        const finalLicenseos = licenseos || licenseOS;
        const finalLicensems = licensems || licenseMS;
        // Basic validation (ไม่ตรวจสอบซ้ำ)
        // ยอมรับทุกค่า ไม่บังคับให้มี device_name หรือ site
        const query = `
      INSERT INTO public."Assets" (
        asset_code, user_id, user_name, company, site, department, device_name,
        brand, cpu, harddisk, ram, ip_address,
        mac_address, serial_number, number, licenseos, licensems,
        license1, license2, license3, license4, category, cost, purchase_date, ref_devicename
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;
        // Convert cost to number if provided, otherwise null
        let costValue = null;
        if (cost !== undefined && cost !== null && cost !== '') {
            const parsed = typeof cost === 'string' ? parseFloat(cost.replace(/,/g, '')) : typeof cost === 'number' ? cost : null;
            if (!isNaN(parsed) && parsed !== null) {
                costValue = parsed;
            }
        }
        // Validate and format purchase_date
        let purchaseDateValue = null;
        if (purchase_date && purchase_date !== '' && purchase_date !== 'null') {
            // Try to parse the date and format it as YYYY-MM-DD
            try {
                const date = new Date(purchase_date);
                if (!isNaN(date.getTime())) {
                    purchaseDateValue = date.toISOString().split('T')[0];
                }
            } catch (e) {
                // If date parsing fails, try to use as-is if it looks like YYYY-MM-DD
                if (typeof purchase_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(purchase_date)) {
                    purchaseDateValue = purchase_date.split('T')[0];
                }
            }
        }
        // เติม "-" ในช่องที่ว่าง
        const fillEmpty = (val)=>val && String(val).trim() !== '' ? String(val).trim() : '-';
        // asset_code ถ้าว่างหรือเป็น "-" ให้เป็น null
        finalAssetCode = asset_code && asset_code.trim() !== '' && asset_code.trim() !== '-' ? asset_code.trim() : null;
        const values = [
            finalAssetCode,
            fillEmpty(user_id),
            fillEmpty(user_name),
            fillEmpty(company),
            fillEmpty(site),
            fillEmpty(department),
            fillEmpty(device_name),
            fillEmpty(brand),
            fillEmpty(cpu),
            fillEmpty(harddisk),
            fillEmpty(ram),
            fillEmpty(ip_address),
            fillEmpty(mac_address),
            fillEmpty(serial_number),
            fillEmpty(number),
            fillEmpty(finalLicenseos),
            fillEmpty(finalLicensems),
            fillEmpty(license1),
            fillEmpty(license2),
            fillEmpty(license3),
            fillEmpty(license4),
            fillEmpty(category),
            costValue,
            purchaseDateValue,
            fillEmpty(ref_devicename)
        ];
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(query, values);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows[0],
            message: 'Asset added successfully'
        });
    } catch (error) {
        console.error('Error adding asset:', error);
        // Check for unique constraint violation
        if (error?.code === '23505' || error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
            // If it's device_name constraint violation, show error
            if (error?.message?.includes('device_name') || error?.detail?.includes('device_name') || error?.constraint?.includes('device_name')) {
                const deviceNameMatch = error?.message?.match(/device_name[^"]*"([^"]+)"/i) || error?.detail?.match(/\(device_name\)=\(([^)]+)\)/i);
                const duplicateValue = deviceNameMatch ? deviceNameMatch[1] : body.device_name || 'Unknown';
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Device name "${duplicateValue}" มีอยู่ในระบบแล้ว`
                }, {
                    status: 409
                });
            }
            // If it's asset_code constraint violation, skip silently (ข้ามโดยไม่แสดง error)
            if (error?.message?.includes('asset_code') || error?.detail?.includes('asset_code') || error?.constraint?.includes('asset_code')) {
                console.log('ข้าม asset_code ซ้ำ - ถือว่าสำเร็จ');
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    message: 'Asset skipped (duplicate asset_code)',
                    skipped: true
                });
            }
            // For other unique constraint violations, check if it's device_name related
            if (body.device_name && body.device_name.trim() !== '' && body.device_name.trim() !== '-') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Device name "${body.device_name.trim()}" มีอยู่ในระบบแล้ว`
                }, {
                    status: 409
                });
            }
            // Other unique violations - skip silently
            console.log('ข้าม unique constraint error อื่นๆ');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Asset skipped (duplicate)',
                skipped: true
            });
        }
        // Check for other database constraint violations
        if (error?.code && error.code.startsWith('23')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'ข้อมูลไม่ถูกต้องตามที่กำหนด',
                details: error.message || 'Database constraint violation'
            }, {
                status: 400
            });
        }
        // Generic error
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to add asset',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const distinct = searchParams.get('distinct');
        const search = searchParams.get('search');
        const company = searchParams.get('company');
        const department = searchParams.get('department');
        const site = searchParams.get('site');
        const userId = searchParams.get('user_id');
        const userName = searchParams.get('user_name');
        // Return distinct departments list when requested
        if (distinct === 'department') {
            const distinctQuery = `
        SELECT DISTINCT department 
        FROM public."Assets"
        WHERE department IS NOT NULL AND department <> ''
        ORDER BY department
      `;
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(distinctQuery);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                data: result.rows.map((row)=>row.department)
            });
        }
        let query = `
      SELECT 
        id, asset_code, user_id, user_name, company, site, department, device_name,
        brand, cpu, harddisk, ram, ip_address,
        mac_address, serial_number, number, 
        licenseos, licensems, 
        license1, license2, license3, license4,
        category, cost, purchase_date, ref_devicename,
        created_at, updated_at
      FROM public."Assets"
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;
        // Filter by user_id or user_name (for viewing user's assets)
        if (userId || userName) {
            query += ` AND (`;
            const conditions = [];
            if (userId) {
                conditions.push(`user_id = $${paramCount}`);
                params.push(userId);
                paramCount++;
            }
            if (userName) {
                conditions.push(`user_name ILIKE $${paramCount}`);
                params.push(`%${userName}%`);
                paramCount++;
            }
            query += conditions.join(' OR ');
            query += `)`;
        }
        if (search) {
            query += ` AND (
        asset_code ILIKE $${paramCount} OR
        user_name ILIKE $${paramCount} OR
        device_name ILIKE $${paramCount} OR
        brand ILIKE $${paramCount} OR
        serial_number ILIKE $${paramCount}
      )`;
            params.push(`%${search}%`);
            paramCount++;
        }
        if (company) {
            query += ` AND company = $${paramCount}`;
            params.push(company);
            paramCount++;
        }
        if (department) {
            query += ` AND department = $${paramCount}`;
            params.push(department);
            paramCount++;
        }
        if (site) {
            query += ` AND site = $${paramCount}`;
            params.push(site);
            paramCount++;
        }
        const category = searchParams.get('category');
        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }
        query += ' ORDER BY asset_code';
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryRepair"])(query, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch assets',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d86cd7b5._.js.map