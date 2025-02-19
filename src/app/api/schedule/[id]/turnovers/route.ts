import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const turnovers = await prisma.turnover.findMany({
      where: {
        matchId: parseInt(params.id),
      },
      include: {
        member: true,
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const turnover = await prisma.turnover.upsert({
      where: {
        matchId_memberId_quarter: {
          matchId: parseInt(params.id),
          memberId: data.memberId,
          quarter: data.quarter,
        },
      },
      update: {
        count: data.count,
      },
      create: {
        matchId: parseInt(params.id),
        memberId: data.memberId,
        quarter: data.quarter,
        count: data.count,
      },
    })
    return NextResponse.json(turnover)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update turnover' },
      { status: 500 }
    )
  }
} 