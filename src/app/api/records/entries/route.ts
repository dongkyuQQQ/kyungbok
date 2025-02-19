import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      include: {
        member: true,
        match: true,
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