'use client'

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Divider,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { FaUsers, FaCalendarAlt, FaChartBar } from 'react-icons/fa'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Match, Goal, Entry, Member, Rating, Turnover } from '@prisma/client'
import { Team } from '@/types'

interface TeamStats {
  wins: number
  draws: number
  losses: number
  winRate: number
  goalsPerMatch: number
  concededPerMatch: number
  quarterWinRate: number
  goalsPerQuarter: number
  concededPerQuarter: number
  averageAge: number
}

export default function Home() {
  const [members, setMembers] = useState<Member[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [turnovers, setTurnovers] = useState<Turnover[]>([])
  const [chungdongStats, setChungdongStats] = useState<TeamStats | null>(null)
  const [jungbyungStats, setJungbyungStats] = useState<TeamStats | null>(null)

  const fetchData = async () => {
    try {
      const [membersRes, matchesRes, goalsRes, entriesRes, ratingsRes, turnoversRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/schedule'),
        fetch('/api/records/goals'),
        fetch('/api/records/entries'),
        fetch('/api/records/ratings'),
        fetch('/api/records/turnovers'),
      ])

      const [membersData, matchesData, goalsData, entriesData, ratingsData, turnoversData] = await Promise.all([
        membersRes.json(),
        matchesRes.json(),
        goalsRes.json(),
        entriesRes.json(),
        ratingsRes.json(),
        turnoversRes.json(),
      ])

      setMembers(membersData)
      setMatches(matchesData)
      setGoals(goalsData)
      setEntries(entriesData)
      setRatings(ratingsData)
      setTurnovers(turnoversData)
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (members.length > 0 && matches.length > 0) {
      calculateTeamStats(matches, goals, entries)
    }
  }, [members, matches, goals, entries])

  const calculateTeamStats = (matches: Match[], goals: Goal[], entries: Entry[]) => {
    const calculateStats = (team: Team) => {
      const teamGoals = goals.filter(g => g.team === team)
      const opposingTeam = team === Team.CHUNGDONG ? Team.JUNGBYUNG : Team.CHUNGDONG
      const opposingGoals = goals.filter(g => g.team === opposingTeam)

      const matchResults = matches.map(match => {
        const matchTeamGoals = teamGoals.filter(g => g.matchId === match.id).length
        const matchOpposingGoals = opposingGoals.filter(g => g.matchId === match.id).length
        
        if (matchTeamGoals > matchOpposingGoals) return 'win'
        if (matchTeamGoals < matchOpposingGoals) return 'loss'
        return 'draw'
      })

      const quarterResults = matches.flatMap(match => {
        return Array.from({ length: match.quarters }, (_, i) => {
          const quarter = i + 1
          const quarterTeamGoals = teamGoals.filter(
            g => g.matchId === match.id && g.quarter === quarter
          ).length
          const quarterOpposingGoals = opposingGoals.filter(
            g => g.matchId === match.id && g.quarter === quarter
          ).length

          if (quarterTeamGoals > quarterOpposingGoals) return 'win'
          if (quarterTeamGoals < quarterOpposingGoals) return 'loss'
          return 'draw'
        })
      })

      const wins = matchResults.filter(r => r === 'win').length
      const draws = matchResults.filter(r => r === 'draw').length
      const losses = matchResults.filter(r => r === 'loss').length
      const totalMatches = matches.length
      const totalQuarters = quarterResults.length

      const quarterWins = quarterResults.filter(r => r === 'win').length
      const quarterDraws = quarterResults.filter(r => r === 'draw').length

      // 팀 평균 나이 계산
      const teamMembers = members.filter(m => m.team === team)
      console.log(`[${team}] 팀 회원 정보:`)
      const totalAge = teamMembers.reduce((sum, member) => {
        const today = new Date()
        const birthDate = new Date(member.birthDate)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        
        // 생일이 아직 지나지 않은 경우 1살 빼기
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        
        console.log(`- ${member.name}: ${birthDate.toISOString().split('T')[0]} (${age}세)`)
        return sum + age
      }, 0)
      const averageAge = teamMembers.length > 0 ? Math.round(totalAge / teamMembers.length * 10) / 10 : 0
      console.log(`=> 평균 나이: ${averageAge}세 (총 ${teamMembers.length}명)\n`)

      return {
        wins,
        draws,
        losses,
        winRate: ((wins + draws * 0.5) / totalMatches) * 100,
        goalsPerMatch: teamGoals.length / totalMatches,
        concededPerMatch: opposingGoals.length / totalMatches,
        quarterWinRate: ((quarterWins + quarterDraws * 0.5) / totalQuarters) * 100,
        goalsPerQuarter: teamGoals.length / totalQuarters,
        concededPerQuarter: opposingGoals.length / totalQuarters,
        averageAge,
      }
    }

    setChungdongStats(calculateStats(Team.CHUNGDONG))
    setJungbyungStats(calculateStats(Team.JUNGBYUNG))
  }

  const getPlayerStats = () => {
    const playerStats = members.map(member => {
      // 득점 수
      const goals_count = goals.filter(g => g.scorerId === member.id).length

      // 어시스트 수
      const assists_count = goals.filter(g => g.assistId === member.id).length

      // MOM 수
      const mom_count = matches.filter(m => m.momId === member.id).length

      // 경기 승률 계산
      const memberEntries = entries.filter(e => e.memberId === member.id)
      const matchIds = new Set(memberEntries.map(e => e.matchId))
      const matchResults = Array.from(matchIds).map(matchId => {
        const matchGoals = goals.filter(g => g.matchId === matchId)
        const teamGoals = matchGoals.filter(g => g.team === member.team).length
        const opposingGoals = matchGoals.filter(g => g.team !== member.team).length
        
        if (teamGoals > opposingGoals) return 'win'
        if (teamGoals < opposingGoals) return 'loss'
        return 'draw'
      })

      const matchWins = matchResults.filter(r => r === 'win').length
      const matchDraws = matchResults.filter(r => r === 'draw').length
      const matchWinRate = matchIds.size > 0
        ? ((matchWins + matchDraws * 0.5) / matchIds.size) * 100
        : 0

      // 쿼터 승률 계산
      const quarterResults = memberEntries.map(entry => {
        const quarterGoals = goals.filter(g => g.matchId === entry.matchId && g.quarter === entry.quarter)
        const teamGoals = quarterGoals.filter(g => g.team === member.team).length
        const opposingGoals = quarterGoals.filter(g => g.team !== member.team).length
        
        if (teamGoals > opposingGoals) return 'win'
        if (teamGoals < opposingGoals) return 'loss'
        return 'draw'
      })

      const quarterWins = quarterResults.filter(r => r === 'win').length
      const quarterDraws = quarterResults.filter(r => r === 'draw').length
      const quarterWinRate = quarterResults.length > 0 
        ? ((quarterWins + quarterDraws * 0.5) / quarterResults.length) * 100 
        : 0

      // 경기당 평균 턴오버
      const playerTurnovers = turnovers.filter(t => t.memberId === member.id)
      const totalTurnovers = playerTurnovers.reduce((sum, t) => sum + t.count, 0)
      const turnoversPerMatch = matchIds.size > 0 ? totalTurnovers / matchIds.size : 0

      return {
        id: member.id,
        name: member.name,
        team: member.team,
        goals: goals_count,
        assists: assists_count,
        mom: mom_count,
        matchWinRate,
        quarterWinRate,
        turnoversPerMatch,
      }
    })

    return {
      topScorers: [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 5),
      topAssisters: [...playerStats].sort((a, b) => b.assists - a.assists).slice(0, 5),
      topMom: [...playerStats].sort((a, b) => b.mom - a.mom).slice(0, 5),
      topMatchWinRate: [...playerStats]
        .filter(p => p.matchWinRate > 0)
        .sort((a, b) => b.matchWinRate - a.matchWinRate)
        .slice(0, 5),
      topQuarterWinRate: [...playerStats]
        .filter(p => p.quarterWinRate > 0)
        .sort((a, b) => b.quarterWinRate - a.quarterWinRate)
        .slice(0, 5),
      leastTurnovers: [...playerStats]
        .filter(p => p.turnoversPerMatch > 0)
        .sort((a, b) => a.turnoversPerMatch - b.turnoversPerMatch)
        .slice(0, 5),
    }
  }

  const playerStats = members.length > 0 ? getPlayerStats() : null

  const menuItems = [
    {
      title: '회원 관리',
      description: '회원 등록 및 관리, 팀 구분',
      icon: FaUsers,
      href: '/members'
    },
    {
      title: '일정 관리',
      description: '경기 일정 등록 및 출전 선수 관리',
      icon: FaCalendarAlt,
      href: '/schedule'
    },
    {
      title: '경기 기록',
      description: '팀/개인 경기 기록 및 통계',
      icon: FaChartBar,
      href: '/records'
    }
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} align="stretch">
            <Heading size={{ base: "xl", md: "2xl" }} color="blue.600" textAlign="center">
              KYUNGBOK FC
            </Heading>
            <Heading size={{ base: "lg", md: "xl" }} color="gray.700" textAlign="center">
              DATACENTER
            </Heading>
            <Heading size={{ base: "md", md: "lg" }} color="gray.600" mt={4}>
              OVERVIEW
            </Heading>
          </VStack>

          {chungdongStats && jungbyungStats && (
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={{ base: 4, md: 6 }}>팀 현황</Heading>
              <Box mb={{ base: 6, md: 8 }}>
                <Box position="relative" h="40px" mb={4}>
                  <HStack spacing={4} position="absolute" left={0} top={0} w="full">
                    <Text color="blue.500" fontWeight="bold" w="80px">
                      충동팀
                    </Text>
                    <Text color="red.500" fontWeight="bold" position="absolute" right={0}>
                      정병팀
                    </Text>
                  </HStack>
                  <Box mt={8} position="relative" h="24px" bg="gray.100" borderRadius="full" overflow="hidden">
                    <Box
                      position="absolute"
                      left={0}
                      h="full"
                      w={`${chungdongStats.winRate}%`}
                      bg="blue.500"
                      borderLeftRadius="full"
                    />
                    <Box
                      position="absolute"
                      right={0}
                      h="full"
                      w={`${jungbyungStats.winRate}%`}
                      bg="red.500"
                      borderRightRadius="full"
                    />
                  </Box>
                  <HStack spacing={4} position="absolute" w="full" justify="space-between" mt={2}>
                    <Text fontSize="sm">
                      {chungdongStats.wins}승 {chungdongStats.draws}무 {chungdongStats.losses}패
                      <Text as="span" ml={2} fontWeight="bold">
                        ({chungdongStats.winRate.toFixed(1)}%)
                      </Text>
                    </Text>
                    <Text fontSize="sm" textAlign="right">
                      <Text as="span" mr={2} fontWeight="bold">
                        ({jungbyungStats.winRate.toFixed(1)}%)
                      </Text>
                      {jungbyungStats.wins}승 {jungbyungStats.draws}무 {jungbyungStats.losses}패
                    </Text>
                  </HStack>
                </Box>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 8 }}>
                <Box>
                  <Heading size="sm" mb={4}>충동팀 통계</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat size="sm">
                      <StatLabel>평균 나이</StatLabel>
                      <StatNumber>{chungdongStats.averageAge.toFixed(1)}</StatNumber>
                      <StatHelpText>세</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>경기당 평균</StatLabel>
                      <StatNumber>{chungdongStats.goalsPerMatch.toFixed(1)}</StatNumber>
                      <StatHelpText>득점</StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} mt={4}>
                    <Stat size="sm">
                      <StatLabel>경기당 평균</StatLabel>
                      <StatNumber>{chungdongStats.concededPerMatch.toFixed(1)}</StatNumber>
                      <StatHelpText>실점</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>쿼터 승률</StatLabel>
                      <StatNumber>{chungdongStats.quarterWinRate.toFixed(1)}%</StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <Divider my={4} />

                  <SimpleGrid columns={2} spacing={4}>
                    <Stat size="sm">
                      <StatLabel>쿼터당</StatLabel>
                      <StatNumber>{chungdongStats.goalsPerQuarter.toFixed(1)}</StatNumber>
                      <StatHelpText>득점</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>쿼터당</StatLabel>
                      <StatNumber>{chungdongStats.concededPerQuarter.toFixed(1)}</StatNumber>
                      <StatHelpText>실점</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Box>
                  <Heading size="sm" mb={4}>정병팀 통계</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat size="sm">
                      <StatLabel>평균 나이</StatLabel>
                      <StatNumber>{jungbyungStats.averageAge.toFixed(1)}</StatNumber>
                      <StatHelpText>세</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>경기당 평균</StatLabel>
                      <StatNumber>{jungbyungStats.goalsPerMatch.toFixed(1)}</StatNumber>
                      <StatHelpText>득점</StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={4} mt={4}>
                    <Stat size="sm">
                      <StatLabel>경기당 평균</StatLabel>
                      <StatNumber>{jungbyungStats.concededPerMatch.toFixed(1)}</StatNumber>
                      <StatHelpText>실점</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>쿼터 승률</StatLabel>
                      <StatNumber>{jungbyungStats.quarterWinRate.toFixed(1)}%</StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <Divider my={4} />

                  <SimpleGrid columns={2} spacing={4}>
                    <Stat size="sm">
                      <StatLabel>쿼터당</StatLabel>
                      <StatNumber>{jungbyungStats.goalsPerQuarter.toFixed(1)}</StatNumber>
                      <StatHelpText>득점</StatHelpText>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel>쿼터당</StatLabel>
                      <StatNumber>{jungbyungStats.concededPerQuarter.toFixed(1)}</StatNumber>
                      <StatHelpText>실점</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </SimpleGrid>
            </Box>
          )}

          {playerStats && (
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={{ base: 4, md: 6 }}>개인 기록 TOP 5</Heading>
              <SimpleGrid 
                columns={{ base: 1, sm: 2, lg: 3 }} 
                spacing={{ base: 4, md: 6 }}
                maxW="full"
              >
                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">득점</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.topScorers.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                              {index + 1}.
                            </Text>
                            <Text w="80px" isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="50px" textAlign="right">{player.goals}골</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">어시스트</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.topAssisters.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                              {index + 1}.
                            </Text>
                            <Text w="80px" isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="50px" textAlign="right">{player.assists}도움</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">MOM</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.topMom.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                              {index + 1}.
                            </Text>
                            <Text w="80px" isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="50px" textAlign="right">{player.mom}회</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">경기 승률</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.topMatchWinRate.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2} flex={1} minW={0}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold" flexShrink={0}>
                              {index + 1}.
                            </Text>
                            <Text flex={1} isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="70px" textAlign="right" flexShrink={0}>{player.matchWinRate.toFixed(1)}%</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">쿼터 승률</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.topQuarterWinRate.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2} flex={1} minW={0}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold" flexShrink={0}>
                              {index + 1}.
                            </Text>
                            <Text flex={1} isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="70px" textAlign="right" flexShrink={0}>{player.quarterWinRate.toFixed(1)}%</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>

                <Box>
                  <Card p={4} boxShadow="sm" h="full">
                    <Heading size="sm" mb={4} color="blue.500">경기당 턴오버</Heading>
                    <VStack spacing={2} align="stretch">
                      {playerStats.leastTurnovers.map((player, index) => (
                        <HStack key={player.id} justify="space-between" mb={1}>
                          <HStack spacing={2} flex={1} minW={0}>
                            <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold" flexShrink={0}>
                              {index + 1}.
                            </Text>
                            <Text flex={1} isTruncated>{player.name}</Text>
                          </HStack>
                          <Text fontWeight="bold" w="70px" textAlign="right" flexShrink={0}>{player.turnoversPerMatch.toFixed(1)}회</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Card>
                </Box>
              </SimpleGrid>
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 4, md: 8 }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Box
                  p={{ base: 6, md: 8 }}
                  bg="white"
                  borderRadius="lg"
                  boxShadow="md"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                >
                  <VStack spacing={3}>
                    <Box fontSize={{ base: "3xl", md: "4xl" }} color="blue.500">
                      <item.icon />
                    </Box>
                    <Heading size={{ base: "md", md: "lg" }}>{item.title}</Heading>
                    <Text color="gray.600" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
                      {item.description}
                    </Text>
                  </VStack>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
} 