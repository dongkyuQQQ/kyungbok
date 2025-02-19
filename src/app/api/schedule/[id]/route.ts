import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const match = await prisma.match.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        mom: true,
      },
    })
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
} 