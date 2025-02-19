import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        team: 'asc',
      },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 데이터 유효성 검사
    if (!data.name || !data.phoneNumber || !data.birthDate || !data.team) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    // number와 generation이 숫자인지 확인
    const number = parseInt(data.number)
    const generation = parseInt(data.generation)
    
    if (isNaN(number) || isNaN(generation)) {
      return NextResponse.json(
        { error: 'Invalid number or generation value' },
        { status: 400 }
      )
    }

    const member = await prisma.member.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        number: number,
        birthDate: new Date(data.birthDate + 'T00:00:00.000Z'),
        generation: generation,
        team: data.team,
      },
    })
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    const member = await prisma.member.update({
      where: { id },
      data: {
        ...updateData,
        birthDate: new Date(updateData.birthDate + 'T00:00:00.000Z'),
      },
    })
    return NextResponse.json(member)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }
    await prisma.member.delete({
      where: { id: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
} 