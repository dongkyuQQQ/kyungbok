import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const match = await prisma.match.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        momId: data.momId,
      },
    })
    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update MOM' },
      { status: 500 }
    )
  }
} 