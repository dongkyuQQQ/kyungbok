'use client'

import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Text,
  Progress,
  HStack,
  VStack,
  Card,
  CardBody,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { Match, Goal, Entry, Turnover, Member, Rating } from '@prisma/client'
import { Team } from '@/types'

interface TeamStatsProps {
  members: Member[]
  matches: Match[]
  goals: Goal[]
  entries: Entry[]
  turnovers: Turnover[]
  ratings: Rating[]
}

interface TeamStatsData {
  wins: number
  draws: number
  losses: number
  winRate: number
  goalsPerMatch: number
  concededPerMatch: number
  quarterWinRate: number
  goalsPerQuarter: number
  concededPerQuarter: number
  turnoversPerMatch: number
  turnoversPerQuarter: number
}

export function TeamStats({ members, matches, goals, entries, turnovers, ratings }: TeamStatsProps) {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.50, red.50)',
    'linear(to-r, blue.900, red.900)'
  )
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const statBg = useColorModeValue('white', 'gray.700')

  const calculateTeamStats = (team: Team) => {
    const teamGoals = goals.filter(g => g.team === team)
    const opposingTeam = team === Team.CHUNGDONG ? Team.JUNGBYUNG : Team.CHUNGDONG
    const opposingGoals = goals.filter(g => g.team === opposingTeam)

    // 팀 멤버들의 턴오버 계산
    const teamMembers = [...new Set(entries.filter(e => {
      const member = members.find(m => m.id === e.memberId)
      return member?.team === team
    }).map(e => e.memberId))]

    const teamTurnovers = turnovers.filter(t => teamMembers.includes(t.memberId))
    const totalTurnovers = teamTurnovers.reduce((sum, t) => sum + t.count, 0)

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
      turnoversPerMatch: totalTurnovers / totalMatches,
      turnoversPerQuarter: totalTurnovers / totalQuarters,
    }
  }

  const getTeamTopRatings = (team: Team) => {
    // 팀 멤버들의 ID 목록
    const teamMemberIds = members
      .filter(m => m.team === team)
      .map(m => m.id)

    // 각 멤버별 평균 평점 계산
    const memberRatings = teamMemberIds.map(memberId => {
      const playerRatings = ratings.filter(r => r.memberId === memberId)
      const averageRating = playerRatings.length > 0
        ? playerRatings.reduce((sum, r) => sum + r.score, 0) / playerRatings.length
        : 0
      const member = members.find(m => m.id === memberId)
      return {
        id: memberId,
        name: member?.name || '',
        rating: averageRating
      }
    })

    // 평점 순으로 정렬하고 상위 5명 반환
    return memberRatings
      .filter(m => m.rating > 0)  // 평점이 있는 선수만 필터링
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
  }

  const chungdongStats = calculateTeamStats(Team.CHUNGDONG)
  const jungbyungStats = calculateTeamStats(Team.JUNGBYUNG)
  const chungdongTopRatings = getTeamTopRatings(Team.CHUNGDONG)
  const jungbyungTopRatings = getTeamTopRatings(Team.JUNGBYUNG)

  return (
    <VStack spacing={8} w="full">
      <Box 
        w="full" 
        bg="white" 
        p={6} 
        borderRadius="xl" 
        boxShadow="sm" 
        borderWidth={1} 
        borderColor={borderColor}
      >
        <Heading size="md" mb={6}>승률 비교</Heading>
        <HStack spacing={4} mb={2}>
          <Text color="blue.500" fontWeight="bold" w="100px">
            {chungdongStats.winRate.toFixed(1)}%
          </Text>
          <Box flex={1} h="24px" bg="gray.100" borderRadius="full" overflow="hidden" position="relative">
            <Box
              position="absolute"
              left="0"
              top="0"
              bottom="0"
              width={`${chungdongStats.winRate}%`}
              bg="blue.500"
              transition="width 0.3s ease-in-out"
            />
            <Box
              position="absolute"
              right="0"
              top="0"
              bottom="0"
              width={`${jungbyungStats.winRate}%`}
              bg="red.500"
              transition="width 0.3s ease-in-out"
            />
          </Box>
          <Text color="red.500" fontWeight="bold" w="100px" textAlign="right">
            {jungbyungStats.winRate.toFixed(1)}%
          </Text>
        </HStack>
        <HStack justify="space-between" mt={2}>
          <Text fontSize="sm" color="blue.500">충동팀</Text>
          <Text fontSize="sm" color="red.500">정병팀</Text>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
        <Card p={6} boxShadow="sm" borderColor={borderColor}>
          <Heading size="md" mb={6} color="blue.500">충동팀 상세 기록</Heading>
          <SimpleGrid columns={2} spacing={6}>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 득점</StatLabel>
              <StatNumber>{chungdongStats.goalsPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>골</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 실점</StatLabel>
              <StatNumber>{chungdongStats.concededPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>골</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터 승률</StatLabel>
              <StatNumber>{chungdongStats.quarterWinRate.toFixed(1)}%</StatNumber>
              <Progress
                value={chungdongStats.quarterWinRate}
                size="sm"
                colorScheme="blue"
                mt={2}
              />
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터당 득실점</StatLabel>
              <StatNumber>
                {chungdongStats.goalsPerQuarter.toFixed(1)} : {chungdongStats.concededPerQuarter.toFixed(1)}
              </StatNumber>
              <StatHelpText>득점 : 실점</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 턴오버</StatLabel>
              <StatNumber>{chungdongStats.turnoversPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>회</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터당 턴오버</StatLabel>
              <StatNumber>{chungdongStats.turnoversPerQuarter.toFixed(1)}</StatNumber>
              <StatHelpText>회</StatHelpText>
            </Stat>
          </SimpleGrid>
          <Box mt={6}>
            <Heading size="sm" mb={4}>평점 TOP 5</Heading>
            <VStack align="stretch" spacing={2}>
              {chungdongTopRatings.map((player, index) => (
                <HStack key={player.id} justify="space-between">
                  <HStack>
                    <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text w="80px">{player.name}</Text>
                  </HStack>
                  <Text fontWeight="bold" w="50px" textAlign="right">{player.rating.toFixed(1)}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Card>

        <Card p={6} boxShadow="sm" borderColor={borderColor}>
          <Heading size="md" mb={6} color="red.500">정병팀 상세 기록</Heading>
          <SimpleGrid columns={2} spacing={6}>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 득점</StatLabel>
              <StatNumber>{jungbyungStats.goalsPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>골</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 실점</StatLabel>
              <StatNumber>{jungbyungStats.concededPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>골</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터 승률</StatLabel>
              <StatNumber>{jungbyungStats.quarterWinRate.toFixed(1)}%</StatNumber>
              <Progress
                value={jungbyungStats.quarterWinRate}
                size="sm"
                colorScheme="red"
                mt={2}
              />
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터당 득실점</StatLabel>
              <StatNumber>
                {jungbyungStats.goalsPerQuarter.toFixed(1)} : {jungbyungStats.concededPerQuarter.toFixed(1)}
              </StatNumber>
              <StatHelpText>득점 : 실점</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>경기당 턴오버</StatLabel>
              <StatNumber>{jungbyungStats.turnoversPerMatch.toFixed(1)}</StatNumber>
              <StatHelpText>회</StatHelpText>
            </Stat>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel>쿼터당 턴오버</StatLabel>
              <StatNumber>{jungbyungStats.turnoversPerQuarter.toFixed(1)}</StatNumber>
              <StatHelpText>회</StatHelpText>
            </Stat>
          </SimpleGrid>
          <Box mt={6}>
            <Heading size="sm" mb={4}>평점 TOP 5</Heading>
            <VStack align="stretch" spacing={2}>
              {jungbyungTopRatings.map((player, index) => (
                <HStack key={player.id} justify="space-between">
                  <HStack>
                    <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                      {index + 1}.
                    </Text>
                    <Text w="80px">{player.name}</Text>
                  </HStack>
                  <Text fontWeight="bold" w="50px" textAlign="right">{player.rating.toFixed(1)}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Card>
      </SimpleGrid>
    </VStack>
  )
} 