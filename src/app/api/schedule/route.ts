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
    
    const startTime = new Date(date)
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0)
    
    const endTime = new Date(date)
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0)

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
    
    const startTime = new Date(date)
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0)
    
    const endTime = new Date(date)
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0)

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

    // 관련된 모든 데이터 삭제
    const matchId = parseInt(id)
    
    // 트랜잭션으로 모든 삭제 작업을 수행
    await prisma.$transaction([
      // 출전 기록 삭제
      prisma.entry.deleteMany({
        where: { matchId },
      }),
      // 득점 기록 삭제
      prisma.goal.deleteMany({
        where: { matchId },
      }),
      // 턴오버 기록 삭제
      prisma.turnover.deleteMany({
        where: { matchId },
      }),
      // 평점 기록 삭제
      prisma.rating.deleteMany({
        where: { matchId },
      }),
      // 경기 삭제
      prisma.match.delete({
        where: { id: matchId },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
} 