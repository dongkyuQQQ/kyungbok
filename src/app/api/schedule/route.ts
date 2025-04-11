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
    const date = new Date(data.date)
    const [startHour, startMinute] = data.startTime.split(':')
    const [endHour, endMinute] = data.endTime.split(':')
    
    // 한국 시간으로 설정
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(startHour), parseInt(startMinute))
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(endHour), parseInt(endMinute))

    const match = await prisma.match.create({
      data: {
        date: date,
        startTime: startTime,
        endTime: endTime,
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
    const date = new Date(updateData.date)
    const [startHour, startMinute] = updateData.startTime.split(':')
    const [endHour, endMinute] = updateData.endTime.split(':')
    
    // 한국 시간으로 설정
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(startHour), parseInt(startMinute))
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(endHour), parseInt(endMinute))

    const match = await prisma.match.update({
      where: { id },
      data: {
        date: date,
        startTime: startTime,
        endTime: endTime,
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

    const matchId = parseInt(id)
    
    await prisma.$transaction([
      prisma.goal.deleteMany({
        where: { matchId },
      }),
      prisma.turnover.deleteMany({
        where: { matchId },
      }),
      prisma.rating.deleteMany({
        where: { matchId },
      }),
      prisma.entry.deleteMany({
        where: { matchId },
      }),
      prisma.match.delete({
        where: { id: matchId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
} 