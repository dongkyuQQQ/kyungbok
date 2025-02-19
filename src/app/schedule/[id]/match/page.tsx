'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { GoalForm } from '@/components/GoalForm'
import { TurnoverCounter } from '@/components/TurnoverCounter'
import { RatingForm } from '@/components/RatingForm'
import { MomSelector } from '@/components/MomSelector'
import { useEffect, useState } from 'react'
import { Member, Match, Goal, Entry, Turnover, Rating } from '@prisma/client'
import { Team } from '@/types'
import { format } from 'date-fns'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaUsers } from 'react-icons/fa'

interface MatchPageProps {
  params: {
    id: string
  }
}

interface ExtendedGoal extends Goal {
  scorer: Member
  assist?: Member
}

export default function MatchPage({ params }: MatchPageProps) {
  const searchParams = useSearchParams()
  const initialQuarter = parseInt(searchParams.get('quarter') || '1')
  const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter)
  const [match, setMatch] = useState<Match | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [goals, setGoals] = useState<ExtendedGoal[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [turnovers, setTurnovers] = useState<Turnover[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchMatch()
    fetchMembers()
    fetchGoals()
    fetchEntries()
    fetchTurnovers()
    fetchRatings()
  }, [])

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}`)
      const data = await response.json()
      setMatch(data)
    } catch (error) {
      toast({
        title: '경기 정보를 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      toast({
        title: '회원 목록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}/goals`, {
        cache: 'no-store'
      })
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      toast({
        title: '득점 기록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}/entry`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      toast({
        title: '출전 선수 목록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchTurnovers = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}/turnovers`)
      const data = await response.json()
      setTurnovers(data)
    } catch (error) {
      toast({
        title: '턴오버 기록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}/ratings`)
      const data = await response.json()
      setRatings(data)
    } catch (error) {
      toast({
        title: '평점을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleGoalSubmit = async (data: any) => {
    try {
      await fetch(`/api/schedule/${params.id}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scorerId: data.scorerId,
          assistId: data.assisterId,
          quarter: data.quarter,
          team: data.team,
        }),
      })
      await fetchGoals()
      toast({
        title: '득점이 기록되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: '득점 기록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw error
    }
  }

  const handleTurnoverUpdate = async (memberId: number, count: number) => {
    try {
      await fetch(`/api/schedule/${params.id}/turnovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          quarter: selectedQuarter,
          count,
        }),
      })
      fetchTurnovers()
    } catch (error) {
      throw error
    }
  }

  const handleRatingUpdate = async (memberId: number, score: number) => {
    try {
      await fetch(`/api/schedule/${params.id}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          score,
        }),
      })
      fetchRatings()
    } catch (error) {
      throw error
    }
  }

  const handleMomSelect = async (memberId: number | null) => {
    try {
      await fetch(`/api/schedule/${params.id}/mom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          momId: memberId,
        }),
      })
      fetchMatch()
    } catch (error) {
      throw error
    }
  }

  const handleGoToEntry = () => {
    router.push(`/schedule/${params.id}/entry?quarter=${selectedQuarter}`)
  }

  if (!match) return null

  const quarterButtons = Array.from({ length: match.quarters }, (_, i) => i + 1)

  const getScore = (team: Team, quarter?: number) => {
    return goals.filter(
      (goal) =>
        goal.team === team &&
        (quarter ? goal.quarter === quarter : true)
    ).length
  }

  // 쿼터별 출전 선수 목록을 가져오는 함수
  const getQuarterEntryMembers = (quarter: number, team?: Team) => {
    const quarterEntries = entries.filter(e => e.quarter === quarter)
    const quarterMemberIds = quarterEntries.map(e => e.memberId)
    return members.filter(m => 
      quarterMemberIds.includes(m.id) && 
      (team ? m.team === team : true)
    )
  }

  // 전체 참가 선수 목록을 가져오는 함수
  const getParticipatingMembers = (team?: Team) => {
    const participatingMemberIds = [...new Set(entries.map(e => e.memberId))]
    return members.filter(m => 
      participatingMemberIds.includes(m.id) && 
      (team ? m.team === team : true)
    )
  }

  const ScoreDisplay = () => {
    const chungdongScore = getScore(Team.CHUNGDONG)
    const jungbyungScore = getScore(Team.JUNGBYUNG)
    const isMobile = useBreakpointValue({ base: true, md: false })
    
    return (
      <Box mb={8}>
        <Box 
          bg="white" 
          shadow="lg" 
          borderRadius="2xl" 
          p={isMobile ? 4 : 8} 
          mb={6}
        >
          <HStack justify="center" spacing={isMobile ? 4 : 12}>
            <VStack spacing={2} flex={1} align="center">
              <Text 
                color="blue.500" 
                fontSize={isMobile ? "lg" : "2xl"} 
                fontWeight="bold"
                letterSpacing="wide"
              >
                충동팀
              </Text>
              <Text 
                color="blue.500" 
                fontSize={isMobile ? "4xl" : "6xl"} 
                fontWeight="extrabold"
                lineHeight="1"
              >
                {chungdongScore}
              </Text>
            </VStack>
            <Box 
              px={isMobile ? 3 : 6} 
              py={isMobile ? 2 : 4} 
              bg="gray.50" 
              borderRadius="xl"
            >
              <Text 
                fontSize={isMobile ? "2xl" : "4xl"} 
                fontWeight="bold" 
                color="gray.400"
              >
                VS
              </Text>
            </Box>
            <VStack spacing={2} flex={1} align="center">
              <Text 
                color="red.500" 
                fontSize={isMobile ? "lg" : "2xl"} 
                fontWeight="bold"
                letterSpacing="wide"
              >
                정병팀
              </Text>
              <Text 
                color="red.500" 
                fontSize={isMobile ? "4xl" : "6xl"} 
                fontWeight="extrabold"
                lineHeight="1"
              >
                {jungbyungScore}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box 
          bg="white" 
          shadow="md" 
          borderRadius="xl" 
          p={isMobile ? 3 : 4}
        >
          <Grid 
            templateColumns={isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)"} 
            gap={isMobile ? 3 : 6}
          >
            {quarterButtons.map((quarter) => (
              <GridItem key={quarter}>
                <Box 
                  bg="gray.50" 
                  borderRadius="lg" 
                  p={3}
                >
                  <Text 
                    textAlign="center" 
                    fontSize="sm" 
                    fontWeight="bold"
                    color="gray.500"
                    mb={2}
                  >
                    {quarter}쿼터
                  </Text>
                  <HStack justify="center" spacing={3}>
                    <Text 
                      color="blue.500" 
                      fontSize={isMobile ? "lg" : "xl"} 
                      fontWeight="bold"
                    >
                      {getScore(Team.CHUNGDONG, quarter)}
                    </Text>
                    <Text color="gray.400" fontSize="md">:</Text>
                    <Text 
                      color="red.500" 
                      fontSize={isMobile ? "lg" : "xl"} 
                      fontWeight="bold"
                    >
                      {getScore(Team.JUNGBYUNG, quarter)}
                    </Text>
                  </HStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading>기록 입력</Heading>
          <Box>
            <Text fontSize="lg" mb={2}>
              {format(new Date(match.date), 'yyyy년 MM월 dd일')} -{' '}
              {match.location}
            </Text>
            <Text fontSize="lg" mb={4}>
              {format(new Date(match.startTime), 'HH:mm')} ~{' '}
              {format(new Date(match.endTime), 'HH:mm')}
            </Text>
          </Box>

          <ScoreDisplay />

          <Box display="flex" justifyContent="flex-end" mb={4}>
            <Button
              colorScheme="purple"
              leftIcon={<FaUsers />}
              onClick={handleGoToEntry}
            >
              출전 선수 엔트리로 이동
            </Button>
          </Box>

          <Tabs defaultIndex={0}>
            <TabList>
              <Tab>득점 기록</Tab>
              <Tab>턴오버</Tab>
              <Tab>평점</Tab>
              <Tab>MOM</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <HStack spacing={4} mb={4}>
                  {quarterButtons.map((quarter) => (
                    <Button
                      key={quarter}
                      colorScheme={selectedQuarter === quarter ? 'blue' : 'gray'}
                      onClick={() => setSelectedQuarter(quarter)}
                    >
                      {quarter}쿼터
                    </Button>
                  ))}
                </HStack>
                <GoalForm
                  members={getQuarterEntryMembers(selectedQuarter)}
                  onSubmit={handleGoalSubmit}
                  quarter={selectedQuarter}
                  goals={goals}
                />
              </TabPanel>
              <TabPanel>
                <HStack spacing={4} mb={4}>
                  {quarterButtons.map((quarter) => (
                    <Button
                      key={quarter}
                      colorScheme={selectedQuarter === quarter ? 'blue' : 'gray'}
                      onClick={() => setSelectedQuarter(quarter)}
                    >
                      {quarter}쿼터
                    </Button>
                  ))}
                </HStack>
                <TurnoverCounter
                  members={getQuarterEntryMembers(selectedQuarter)}
                  turnovers={turnovers}
                  quarter={selectedQuarter}
                  onUpdate={handleTurnoverUpdate}
                />
              </TabPanel>
              <TabPanel>
                <RatingForm
                  members={getParticipatingMembers()}
                  ratings={ratings}
                  onUpdate={handleRatingUpdate}
                />
              </TabPanel>
              <TabPanel>
                <MomSelector
                  members={getParticipatingMembers()}
                  currentMomId={match.momId}
                  onSelect={handleMomSelect}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  )
} 