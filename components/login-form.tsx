"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  // โหลดข้อมูลที่จำไว้เมื่อ component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername')
    const savedPassword = localStorage.getItem('rememberedPassword')
    const isRemembered = localStorage.getItem('rememberPassword') === 'true'
    
    if (isRemembered && savedUsername && savedPassword) {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setRememberPassword(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(username, password)
      
      // บันทึกหรือลบข้อมูลตามการเลือก
      if (rememberPassword) {
        localStorage.setItem('rememberedUsername', username)
        localStorage.setItem('rememberedPassword', password)
        localStorage.setItem('rememberPassword', 'true')
      } else {
        localStorage.removeItem('rememberedUsername')
        localStorage.removeItem('rememberedPassword')
        localStorage.removeItem('rememberPassword')
      }
      
      router.push("/dashboard")
    } catch (err) {
      setError("Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (role: "admin" | "user") => {
    const credentials = {
      admin: { username: "Y210918", password: "1234" },
      user: { username: "test01", password: "321" },
    }

    setError("")
    setIsLoading(true)

    try {
      await login(credentials[role].username, credentials[role].password)
      router.push("/dashboard")
    } catch (err) {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">ระบบบำรุงรักษา</CardTitle>
          <CardDescription className="text-center">เข้าสู่ระบบเพื่อจัดการคำร้องซ่อม</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">รหัสพนักงาน</label>
              <Input
                type="text"
                placeholder="กรุณากรอกรหัสพนักงานของคุณ"
                value={username}
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รหัสผ่าน</label>
              <Input
                type="password"
                placeholder="กรุณากรอกรหัสผ่านของคุณ"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
<div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberPassword}
                onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                จำรหัสผ่าน
              </label>
            </div>

            
            {error && <div className="text-sm text-red-500">{error}</div>}

            <Button type="submit" className="w-full" id="submit-button" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          

        </CardContent>
      </Card>
    </div>
  )
}
