import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const turnovers = await prisma.turnover.findMany({
      include: {
        member: true,
        match: true,
      },
    })
    return NextResponse.json(turnovers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch turnovers' },
      { status: 500 }
    )
  }
} 