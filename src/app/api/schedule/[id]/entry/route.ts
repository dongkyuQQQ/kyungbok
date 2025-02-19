import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entries = await prisma.entry.findMany({
      where: {
        matchId: parseInt(params.id),
      },
      include: {
        member: true,
      },
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
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
    const entry = await prisma.entry.create({
      data: {
        matchId: parseInt(params.id),
        memberId: data.memberId,
        quarter: data.quarter,
        team: data.team,
      },
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
} 