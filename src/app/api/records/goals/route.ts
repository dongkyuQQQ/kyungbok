import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        scorer: true,
        assist: true,
        match: true,
      },
    })
    return NextResponse.json(goals)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
} 