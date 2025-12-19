import { authenticateUser } from "@/lib/auth-store"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
