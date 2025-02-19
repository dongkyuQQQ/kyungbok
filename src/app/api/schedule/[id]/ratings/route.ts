import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ratings = await prisma.rating.findMany({
      where: {
        matchId: parseInt(params.id),
      },
      include: {
        member: true,
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const rating = await prisma.rating.upsert({
      where: {
        matchId_memberId: {
          matchId: parseInt(params.id),
          memberId: data.memberId,
        },
      },
      update: {
        score: data.score,
      },
      create: {
        matchId: parseInt(params.id),
        memberId: data.memberId,
        score: data.score,
      },
    })
    return NextResponse.json(rating)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update rating' },
      { status: 500 }
    )
  }
} 