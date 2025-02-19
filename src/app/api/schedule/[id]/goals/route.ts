import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const goals = await prisma.goal.findMany({
      where: {
        matchId: parseInt(params.id),
      },
      include: {
        scorer: true,
        assist: true,
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const goal = await prisma.goal.create({
      data: {
        matchId: parseInt(params.id),
        scorerId: data.scorerId,
        assistId: data.assistId || null,
        quarter: data.quarter,
        team: data.team,
      },
    })
    return NextResponse.json(goal)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
} 