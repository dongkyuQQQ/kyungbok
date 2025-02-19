import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 생년월일 변환 함수
function convertBirthDate(birthDate: string): Date {
  const year = parseInt(birthDate.substring(0, 2))
  const month = birthDate.substring(2, 4)
  const day = birthDate.substring(4, 6)
  const fullYear = year >= 50 ? 1900 + year : 2000 + year
  return new Date(`${fullYear}-${month}-${day}`)
}

const members = [
  {
    name: "강동규",
    phoneNumber: "010-7475-0857",
    number: 29,
    birthDate: convertBirthDate("900711"),
    generation: 84,
    team: "CHUNGDONG"
  },
  {
    name: "강광규",
    phoneNumber: "010-6650-7869",
    number: 89,
    birthDate: convertBirthDate("730805"),
    generation: 67,
    team: "CHUNGDONG"
  },
  {
    name: "고현석",
    phoneNumber: "010-5598-0837",
    number: 10,
    birthDate: convertBirthDate("970724"),
    generation: 91,
    team: "JUNGBYUNG"
  },
  {
    name: "고종성",
    phoneNumber: "010-2827-9969",
    number: 21,
    birthDate: convertBirthDate("920208"),
    generation: 91,
    team: "JUNGBYUNG"
  },
  {
    name: "김정혁",
    phoneNumber: "010-3221-6900",
    number: 114,
    birthDate: convertBirthDate("870128"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "고광민",
    phoneNumber: "010-4546-7963",
    number: 27,
    birthDate: convertBirthDate("920111"),
    generation: 85,
    team: "CHUNGDONG"
  },
  {
    name: "고광주",
    phoneNumber: "010-5546-0146",
    number: 73,
    birthDate: convertBirthDate("971024"),
    generation: 91,
    team: "CHUNGDONG"
  },
  {
    name: "고원석",
    phoneNumber: "010-6234-9667",
    number: 26,
    birthDate: convertBirthDate("860511"),
    generation: 80,
    team: "CHUNGDONG"
  },
  {
    name: "고지석",
    phoneNumber: "010-4193-7636",
    number: 26,
    birthDate: convertBirthDate("711010"),
    generation: 65,
    team: "JUNGBYUNG"
  },
  {
    name: "고정훈",
    phoneNumber: "010-4022-9224",
    number: 25,
    birthDate: convertBirthDate("720113"),
    generation: 65,
    team: "CHUNGDONG"
  },
  {
    name: "권천민",
    phoneNumber: "010-5128-3017",
    number: 7,
    birthDate: convertBirthDate("870630"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "김경원",
    phoneNumber: "010-2678-6402",
    number: 97,
    birthDate: convertBirthDate("970326"),
    generation: 91,
    team: "JUNGBYUNG"
  },
  {
    name: "김기남",
    phoneNumber: "010-8883-4884",
    number: 88,
    birthDate: convertBirthDate("881211"),
    generation: 82,
    team: "JUNGBYUNG"
  },
  {
    name: "김동수",
    phoneNumber: "010-6318-5880",
    number: 16,
    birthDate: convertBirthDate("890724"),
    generation: 63,
    team: "CHUNGDONG"
  },
  {
    name: "김민국",
    phoneNumber: "010-6611-6055",
    number: 4,
    birthDate: convertBirthDate("861206"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "김범주",
    phoneNumber: "010-5300-9896",
    number: 112,
    birthDate: convertBirthDate("850509"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "김석환",
    phoneNumber: "010-3664-2652",
    number: 1,
    birthDate: convertBirthDate("720720"),
    generation: 66,
    team: "CHUNGDONG"
  },
  {
    name: "김성하",
    phoneNumber: "010-3757-3817",
    number: 63,
    birthDate: convertBirthDate("751127"),
    generation: 69,
    team: "JUNGBYUNG"
  },
  {
    name: "김수훈",
    phoneNumber: "010-4572-0190",
    number: 80,
    birthDate: convertBirthDate("860305"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "김승영",
    phoneNumber: "010-2795-0821",
    number: 50,
    birthDate: convertBirthDate("861231"),
    generation: 80,
    team: "CHUNGDONG"
  },
  {
    name: "김종윤",
    phoneNumber: "010-4911-5415",
    number: 11,
    birthDate: convertBirthDate("860511"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "김준겸",
    phoneNumber: "010-8739-8915",
    number: 13,
    birthDate: convertBirthDate("930621"),
    generation: 87,
    team: "JUNGBYUNG"
  },
  {
    name: "김진호",
    phoneNumber: "010-3785-7973",
    number: 20,
    birthDate: convertBirthDate("730127"),
    generation: 66,
    team: "JUNGBYUNG"
  },
  {
    name: "김주호",
    phoneNumber: "010-3795-6101",
    number: 18,
    birthDate: convertBirthDate("670826"),
    generation: 61,
    team: "CHUNGDONG"
  },
  {
    name: "김진희",
    phoneNumber: "010-4350-0024",
    number: 100,
    birthDate: convertBirthDate("710927"),
    generation: 65,
    team: "CHUNGDONG"
  },
  {
    name: "이기정",
    phoneNumber: "010-5785-8894",
    number: 51,
    birthDate: convertBirthDate("691017"),
    generation: 63,
    team: "JUNGBYUNG"
  },
  {
    name: "민태연",
    phoneNumber: "010-5246-9431",
    number: 47,
    birthDate: convertBirthDate("690513"),
    generation: 63,
    team: "CHUNGDONG"
  },
  {
    name: "박우수",
    phoneNumber: "010-9833-2637",
    number: 8,
    birthDate: convertBirthDate("860618"),
    generation: 80,
    team: "CHUNGDONG"
  },
  {
    name: "박중양",
    phoneNumber: "010-3726-5299",
    number: 81,
    birthDate: convertBirthDate("740513"),
    generation: 67,
    team: "JUNGBYUNG"
  },
  {
    name: "박병현",
    phoneNumber: "010-6316-3551",
    number: 28,
    birthDate: convertBirthDate("641220"),
    generation: 58,
    team: "CHUNGDONG"
  },
  {
    name: "김상현",
    phoneNumber: "010-9265-8514",
    number: 9,
    birthDate: convertBirthDate("590310"),
    generation: 53,
    team: "CHUNGDONG"
  },
  {
    name: "김상선",
    phoneNumber: "010-5691-9938",
    number: 93,
    birthDate: convertBirthDate("930115"),
    generation: 86,
    team: "CHUNGDONG"
  },
  {
    name: "서창만",
    phoneNumber: "010-5341-8088",
    number: 12,
    birthDate: convertBirthDate("520110"),
    generation: 45,
    team: "CHUNGDONG"
  },
  {
    name: "신건호",
    phoneNumber: "010-5511-5981",
    number: 67,
    birthDate: convertBirthDate("730621"),
    generation: 67,
    team: "CHUNGDONG"
  },
  {
    name: "신인재",
    phoneNumber: "010-9083-2285",
    number: 99,
    birthDate: convertBirthDate("880829"),
    generation: 82,
    team: "JUNGBYUNG"
  },
  {
    name: "신종승",
    phoneNumber: "010-2308-3746",
    number: 77,
    birthDate: convertBirthDate("680126"),
    generation: 61,
    team: "CHUNGDONG"
  },
  {
    name: "안희환",
    phoneNumber: "010-8265-7449",
    number: 66,
    birthDate: convertBirthDate("960701"),
    generation: 90,
    team: "CHUNGDONG"
  },
  {
    name: "안형동",
    phoneNumber: "010-8955-2095",
    number: 61,
    birthDate: convertBirthDate("670628"),
    generation: 61,
    team: "JUNGBYUNG"
  },
  {
    name: "오승환",
    phoneNumber: "010-9069-1012",
    number: 0,
    birthDate: convertBirthDate("791010"),
    generation: 73,
    team: "JUNGBYUNG"
  },
  {
    name: "유현구",
    phoneNumber: "010-2282-5063",
    number: 2,
    birthDate: convertBirthDate("871013"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "유현희",
    phoneNumber: "010-3245-1304",
    number: 815,
    birthDate: convertBirthDate("971011"),
    generation: 91,
    team: "JUNGBYUNG"
  },
  {
    name: "이문동",
    phoneNumber: "010-9340-4751",
    number: 97,
    birthDate: convertBirthDate("970109"),
    generation: 91,
    team: "CHUNGDONG"
  },
  {
    name: "이강민",
    phoneNumber: "010-8283-7623",
    number: 33,
    birthDate: convertBirthDate("920408"),
    generation: 86,
    team: "CHUNGDONG"
  },
  {
    name: "이광동",
    phoneNumber: "010-4691-1491",
    number: 22,
    birthDate: convertBirthDate("641222"),
    generation: 58,
    team: "CHUNGDONG"
  },
  {
    name: "이민규",
    phoneNumber: "010-4143-8627",
    number: 23,
    birthDate: convertBirthDate("960827"),
    generation: 90,
    team: "CHUNGDONG"
  },
  {
    name: "이상호",
    phoneNumber: "010-9928-4488",
    number: 3,
    birthDate: convertBirthDate("600829"),
    generation: 54,
    team: "CHUNGDONG"
  },
  {
    name: "이선재",
    phoneNumber: "010-9953-3451",
    number: 87,
    birthDate: convertBirthDate("871119"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "이의진",
    phoneNumber: "010-3131-5103",
    number: 6,
    birthDate: convertBirthDate("830106"),
    generation: 78,
    team: "JUNGBYUNG"
  },
  {
    name: "이종훈",
    phoneNumber: "010-3029-9110",
    number: 23,
    birthDate: convertBirthDate("530919"),
    generation: 47,
    team: "JUNGBYUNG"
  },
  {
    name: "이주남",
    phoneNumber: "010-7583-9001",
    number: 58,
    birthDate: convertBirthDate("650108"),
    generation: 58,
    team: "JUNGBYUNG"
  },
  {
    name: "이태웅",
    phoneNumber: "010-3243-9008",
    number: 927,
    birthDate: convertBirthDate("880117"),
    generation: 82,
    team: "CHUNGDONG"
  },
  {
    name: "이현정",
    phoneNumber: "010-2988-2938",
    number: 3,
    birthDate: convertBirthDate("971013"),
    generation: 91,
    team: "JUNGBYUNG"
  },
  {
    name: "정영일",
    phoneNumber: "010-9685-8038",
    number: 64,
    birthDate: convertBirthDate("701222"),
    generation: 64,
    team: "JUNGBYUNG"
  },
  {
    name: "임재현",
    phoneNumber: "010-96423320",
    number: 0,
    birthDate: convertBirthDate("910910"),
    generation: 85,
    team: "JUNGBYUNG"
  },
  {
    name: "조승석",
    phoneNumber: "010-6329-8848",
    number: 30,
    birthDate: convertBirthDate("570901"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "조창경",
    phoneNumber: "010-5314-2903",
    number: 49,
    birthDate: convertBirthDate("600102"),
    generation: 54,
    team: "JUNGBYUNG"
  },
  {
    name: "지동석",
    phoneNumber: "010-9031-1782",
    number: 90,
    birthDate: convertBirthDate("900806"),
    generation: 84,
    team: "CHUNGDONG"
  },
  {
    name: "지세현",
    phoneNumber: "010-6315-3133",
    number: 119,
    birthDate: convertBirthDate("860903"),
    generation: 80,
    team: "CHUNGDONG"
  },
  {
    name: "지수홍",
    phoneNumber: "010-9199-9900",
    number: 0,
    birthDate: convertBirthDate("900127"),
    generation: 84,
    team: "CHUNGDONG"
  },
  {
    name: "천현기",
    phoneNumber: "010-3000-4779",
    number: 19,
    birthDate: convertBirthDate("920113"),
    generation: 85,
    team: "JUNGBYUNG"
  },
  {
    name: "최경호",
    phoneNumber: "010-3359-2342",
    number: 15,
    birthDate: convertBirthDate("731106"),
    generation: 67,
    team: "CHUNGDONG"
  },
  {
    name: "최원수",
    phoneNumber: "010-7563-1275",
    number: 24,
    birthDate: convertBirthDate("870217"),
    generation: 80,
    team: "CHUNGDONG"
  },
  {
    name: "최형화",
    phoneNumber: "010-9387-8827",
    number: 5,
    birthDate: convertBirthDate("870502"),
    generation: 81,
    team: "CHUNGDONG"
  },
  {
    name: "최기홍",
    phoneNumber: "010-4154-5766",
    number: 66,
    birthDate: convertBirthDate("721106"),
    generation: 66,
    team: "CHUNGDONG"
  },
  {
    name: "이환형",
    phoneNumber: "010-2584-8603",
    number: 0,
    birthDate: convertBirthDate("870812"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "서영화",
    phoneNumber: "010-4786-1260",
    number: 60,
    birthDate: convertBirthDate("860621"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "이영환",
    phoneNumber: "010-9989-2900",
    number: 14,
    birthDate: convertBirthDate("840306"),
    generation: 78,
    team: "CHUNGDONG"
  },
  {
    name: "이상호",
    phoneNumber: "010-9027-4118",
    number: 235,
    birthDate: convertBirthDate("861103"),
    generation: 80,
    team: "JUNGBYUNG"
  },
  {
    name: "나민균",
    phoneNumber: "010-3713-6836",
    number: 117,
    birthDate: convertBirthDate("870508"),
    generation: 81,
    team: "JUNGBYUNG"
  },
  {
    name: "김재웅",
    phoneNumber: "010-8485-0070",
    number: 17,
    birthDate: convertBirthDate("890803"),
    generation: 83,
    team: "JUNGBYUNG"
  },
  {
    name: "정호일",
    phoneNumber: "010-3338-0821",
    number: 44,
    birthDate: convertBirthDate("700522"),
    generation: 64,
    team: "JUNGBYUNG"
  },
  {
    name: "이주원",
    phoneNumber: "010-9892-4191",
    number: 0,
    birthDate: convertBirthDate("810801"),
    generation: 75,
    team: "CHUNGDONG"
  },
  {
    name: "홍동현",
    phoneNumber: "010-4833-1900",
    number: 0,
    birthDate: convertBirthDate("890803"),
    generation: 92,
    team: "CHUNGDONG"
  },
  {
    name: "임인식",
    phoneNumber: "010-4359-6258",
    number: 0,
    birthDate: convertBirthDate("980527"),
    generation: 92,
    team: "CHUNGDONG"
  },
  {
    name: "김태형",
    phoneNumber: "010-9890-6746",
    number: 0,
    birthDate: convertBirthDate("840101"),
    generation: 78,
    team: "CHUNGDONG"
  },
  {
    name: "이상진",
    phoneNumber: "010-5493-2010",
    number: 55,
    birthDate: convertBirthDate("670924"),
    generation: 61,
    team: "JUNGBYUNG"
  },
  {
    name: "이창만",
    phoneNumber: "+64-21-1163177",
    number: 0,
    birthDate: convertBirthDate("750602"),
    generation: 69,
    team: "JUNGBYUNG"
  },
  {
    name: "이화명",
    phoneNumber: "010-6433-8644",
    number: 0,
    birthDate: convertBirthDate("930609"),
    generation: 87,
    team: "CHUNGDONG"
  },
  {
    name: "이현정",
    phoneNumber: "010-5368-8384",
    number: 0,
    birthDate: convertBirthDate("980101"),
    generation: 92,
    team: "JUNGBYUNG"
  },
  {
    name: "하빈",
    phoneNumber: "010-5803-2031",
    number: 0,
    birthDate: convertBirthDate("930101"),
    generation: 87,
    team: "JUNGBYUNG"
  },
  {
    name: "김경민",
    phoneNumber: "010-7131-6976",
    number: 0,
    birthDate: convertBirthDate("960101"),
    generation: 90,
    team: "CHUNGDONG"
  },
  {
    name: "김재훈",
    phoneNumber: "010-5677-9175",
    number: 0,
    birthDate: convertBirthDate("990101"),
    generation: 93,
    team: "CHUNGDONG"
  }
]

export async function GET() {
  try {
    // 기존 데이터 삭제
    await prisma.member.deleteMany()
    
    // 새 데이터 입력
    const result = await prisma.member.createMany({
      data: members
    })

    return NextResponse.json({ 
      message: `${result.count}명의 회원이 등록되었습니다.`,
      count: result.count 
    })
  } catch (error) {
    console.error('Error seeding members:', error)
    return NextResponse.json(
      { error: '회원 일괄 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
} 