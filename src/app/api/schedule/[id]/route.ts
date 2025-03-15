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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // 관련된 모든 데이터를 삭제
    await prisma.$transaction([
      // 엔트리 관련 데이터 삭제
      prisma.goal.deleteMany({
        where: { matchId: id }
      }),
      prisma.turnover.deleteMany({
        where: { matchId: id }
      }),
      prisma.rating.deleteMany({
        where: { matchId: id }
      }),
      // 엔트리 삭제
      prisma.entry.deleteMany({
        where: { matchId: id }
      }),
      // 매치 삭제
      prisma.match.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ message: '매치가 성공적으로 삭제되었습니다.' })
  } catch (error) {
    console.error('매치 삭제 중 오류 발생:', error)
    return NextResponse.json(
      { error: '매치 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 