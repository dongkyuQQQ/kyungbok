import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await prisma.goal.deleteMany()
    return NextResponse.json({ message: '골 기록이 초기화되었습니다.' })
  } catch (error) {
    return NextResponse.json(
      { error: '골 기록 초기화에 실패했습니다.' },
      { status: 500 }
    )
  }
} 