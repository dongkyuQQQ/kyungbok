import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(matches)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const match = await prisma.match.create({
      data: {
        date: new Date(data.date),
        startTime: new Date(`${data.date}T${data.startTime}`),
        endTime: new Date(`${data.date}T${data.endTime}`),
        location: data.location,
        quarters: data.quarters,
      },
    })
    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    const match = await prisma.match.update({
      where: { id },
      data: {
        date: new Date(updateData.date),
        startTime: new Date(`${updateData.date}T${updateData.startTime}`),
        endTime: new Date(`${updateData.date}T${updateData.endTime}`),
        location: updateData.location,
        quarters: updateData.quarters,
      },
    })
    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }
    await prisma.match.delete({
      where: { id: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
} 