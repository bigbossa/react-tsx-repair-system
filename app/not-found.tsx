"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <div className="relative p-8 sm:p-12 text-center space-y-8">
              {/* 404 Icon Animation */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 shadow-xl">
                    <AlertTriangle className="h-20 w-20 sm:h-24 sm:w-24 text-white animate-bounce" />
                  </div>
                </div>
              </div>

              {/* 404 Number */}
              <div className="space-y-2">
                <h1 className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  404
                </h1>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Error Message */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  ไม่พบหน้าที่คุณต้องการ
                </h2>
                <h3><b>ERROR CODE: 404 | PAGE_NOT_FOUND</b></h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  ขออภัย หน้าที่คุณกำลังค้นหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่จริง
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-blue-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-2">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  คำแนะนำ
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• ตรวจสอบ URL ว่าถูกต้องหรือไม่</li>
                  <li>• ลองค้นหาหน้าที่ต้องการจากหน้าหลัก</li>
                  <li>• ติดต่อผู้ดูแลระบบหากคิดว่าเป็นข้อผิดพลาด</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="lg"
                  className="gap-2 hover:scale-105 transition-transform"
                >
                  <ArrowLeft className="h-5 w-5" />
                  กลับหน้าก่อนหน้า
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform shadow-lg"
                >
                  <Home className="h-5 w-5" />
                  กลับหน้าหลัก
                </Button>
              </div>

              {/* Error Code */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                  ERROR CODE: 404 | PAGE_NOT_FOUND
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @media (prefers-color-scheme: dark) {
          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, #374151 1px, transparent 1px),
              linear-gradient(to bottom, #374151 1px, transparent 1px);
          }
        }
      `}</style>
    </div>
  );
}
