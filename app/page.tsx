"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, ArrowRight, CheckCircle2, Users, Clock, BarChart3 } from "lucide-react"
import { useEffect } from "react"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // ถ้า login แล้วไป dashboard
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-2xl">
                <Wrench className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ระบบบำรุงรักษา
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-light">
              จัดการคำขอแจ้งซ่อมและบำรุงรักษาอย่างมีประสิทธิภาพ
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              onClick={() => router.push("/login")}
              size="lg"
              className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              เข้าสู่ระบบ
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">จัดการงานง่าย</h3>
                <p className="text-gray-600">
                  แจ้งซ่อม ติดตามสถานะ และประเมินผลงานได้อย่างสะดวกรวดเร็ว
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="bg-indigo-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">ทีมงานมืออาชีพ</h3>
                <p className="text-gray-600">
                  ระบบจัดการทีมช่างและมอบหมายงานอัตโนมัติ
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">รายงานครบถ้วน</h3>
                <p className="text-gray-600">
                  วิเคราะห์ข้อมูลและสถิติการซ่อมบำรุงแบบเรียลไทม์
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600 mt-2">ทรัพย์สิน</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-indigo-600">500+</div>
              <div className="text-gray-600 mt-2">งานซ่อม</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600 mt-2">บริการ</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-pink-600">98%</div>
              <div className="text-gray-600 mt-2">ความพึงพอใจ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600 text-sm">
            © 2025 ระบบบำรุงรักษา. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
