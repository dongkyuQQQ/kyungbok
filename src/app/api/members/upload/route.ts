import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const members = data.members

    // 일괄 등록
    const result = await prisma.member.createMany({
      data: members.map((member: any) => ({
        name: member.name,
        phoneNumber: member.phoneNumber,
        number: parseInt(member.number),
        birthDate: new Date(member.birthDate),
        generation: parseInt(member.generation),
        team: member.team,
      })),
      skipDuplicates: true, // 중복된 데이터는 건너뜀
    })

    return NextResponse.json({ 
      message: `${result.count}명의 회원이 등록되었습니다.`,
      count: result.count 
    })
  } catch (error) {
    console.error('Error uploading members:', error)
    return NextResponse.json(
      { error: '회원 일괄 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
} 