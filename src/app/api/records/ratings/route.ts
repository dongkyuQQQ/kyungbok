import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        member: true,
        match: true,
      },
    })
    return NextResponse.json(ratings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
} 