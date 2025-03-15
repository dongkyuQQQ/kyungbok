'use client'

import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Member, Match, Goal, Entry, Rating, Turnover } from '@prisma/client'
import { useMemo, useState } from 'react'

interface PlayerStatsProps {
  members: Member[]
  matches: Match[]
  goals: Goal[]
  entries: Entry[]
  ratings: Rating[]
  turnovers: Turnover[]
}

interface PlayerRecord {
  id: string
  name: string
  team: string
  matches: number
  goals: number
  assists: number
  mom: number
  matchWinRate: number
  quarterWinRate: number
  turnoversPerMatch: number
  turnoversPerQuarter: number
  rating: number
}

export function PlayerStats({ members, matches, goals, entries, ratings, turnovers }: PlayerStatsProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.800')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [sortField, setSortField] = useState<keyof PlayerRecord>('goals')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const playerRecords = useMemo(() => {
    return members.map(member => {
      // 출전 경기 수
      const memberMatches = new Set(entries.filter(e => e.memberId === member.id).map(e => e.matchId))
      const matchCount = memberMatches.size

      // 경기 승률
      const matchResults = Array.from(memberMatches).map(matchId => {
        const matchGoals = goals.filter(g => g.matchId === matchId)
        const teamGoals = matchGoals.filter(g => g.team === member.team).length
        const opposingGoals = matchGoals.filter(g => g.team !== member.team).length
        
        if (teamGoals > opposingGoals) return 'win'
        if (teamGoals < opposingGoals) return 'loss'
        return 'draw'
      })

      const matchWins = matchResults.filter(r => r === 'win').length
      const matchDraws = matchResults.filter(r => r === 'draw').length
      const matchWinRate = matchCount > 0
        ? ((matchWins + matchDraws * 0.5) / matchCount) * 100
        : 0

      // 득점 수
      const goalCount = goals.filter(g => g.scorerId === member.id).length

      // 어시스트 수
      const assistCount = goals.filter(g => g.assistId === member.id).length

      // MOM 수
      const momCount = matches.filter(m => m.momId === member.id).length

      // 쿼터 승률
      const memberEntries = entries.filter(e => e.memberId === member.id)
      const quarterResults = memberEntries.map(entry => {
        const quarterGoals = goals.filter(g => 
          g.matchId === entry.matchId && g.quarter === entry.quarter
        )
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
      const turnoversPerMatch = matchCount > 0 ? totalTurnovers / matchCount : 0

      // 쿼터당 평균 턴오버
      const totalQuarters = memberEntries.length
      const turnoversPerQuarter = totalQuarters > 0 ? totalTurnovers / totalQuarters : 0

      // 평균 평점
      const playerRatings = ratings.filter(r => r.memberId === member.id)
      const averageRating = playerRatings.length > 0
        ? playerRatings.reduce((sum, r) => sum + r.score, 0) / playerRatings.length
        : 0

      return {
        id: member.id,
        name: member.name,
        team: member.team,
        matches: matchCount,
        goals: goalCount,
        assists: assistCount,
        mom: momCount,
        matchWinRate,
        quarterWinRate,
        turnoversPerMatch,
        turnoversPerQuarter,
        rating: averageRating,
      }
    })
  }, [members, matches, goals, entries, ratings, turnovers])

  const sortedPlayerRecords = useMemo(() => {
    return [...playerRecords].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })
  }, [playerRecords, sortField, sortDirection])

  // TOP 5 목록을 위한 독립적인 정렬
  const topScorers = useMemo(() => {
    return [...playerRecords]
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5)
  }, [playerRecords])

  const topAssisters = useMemo(() => {
    return [...playerRecords]
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 5)
  }, [playerRecords])

  const topMoms = useMemo(() => {
    return [...playerRecords]
      .sort((a, b) => b.mom - a.mom)
      .slice(0, 5)
  }, [playerRecords])

  const handleSort = (field: keyof PlayerRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortableHeader = ({ field, children, ...props }: { 
    field: keyof PlayerRecord, 
    children: React.ReactNode,
    [key: string]: any 
  }) => (
    <Th
      {...props}
      cursor="pointer"
      userSelect="none"
      onClick={() => handleSort(field)}
      position={field === 'name' && isMobile ? "sticky" : "relative"}
    >
      <HStack spacing={1} justify={props.isNumeric ? "flex-end" : "flex-start"}>
        <Text>{children}</Text>
        {sortField === field && (
          <Text fontSize="xs" color="gray.500">
            {sortDirection === 'asc' ? '▲' : '▼'}
          </Text>
        )}
      </HStack>
    </Th>
  )

  const StatTable = ({ data }: { data: PlayerRecord[] }) => (
    <Box overflowX="auto">
      <Table size={isMobile ? "sm" : "md"} variant="simple">
        <Thead>
          <Tr>
            <SortableHeader field="name">선수</SortableHeader>
            <SortableHeader field="matches" isNumeric>경기</SortableHeader>
            <SortableHeader field="goals" isNumeric>득점</SortableHeader>
            <SortableHeader field="assists" isNumeric>도움</SortableHeader>
            <SortableHeader field="mom" isNumeric>MOM</SortableHeader>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(player => (
            <Tr key={player.id}>
              <Td>{player.name}</Td>
              <Td isNumeric>{player.matches}</Td>
              <Td isNumeric>{player.goals}</Td>
              <Td isNumeric>{player.assists}</Td>
              <Td isNumeric>{player.mom}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )

  const WinRateTable = ({ data }: { data: PlayerRecord[] }) => (
    <Box overflowX="auto">
      <Table size={isMobile ? "sm" : "md"} variant="simple">
        <Thead>
          <Tr>
            <SortableHeader field="name">선수</SortableHeader>
            <SortableHeader field="matchWinRate" isNumeric>경기 승률</SortableHeader>
            <SortableHeader field="quarterWinRate" isNumeric>쿼터 승률</SortableHeader>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(player => (
            <Tr key={player.id}>
              <Td>{player.name}</Td>
              <Td isNumeric>{player.matchWinRate.toFixed(1)}%</Td>
              <Td isNumeric>{player.quarterWinRate.toFixed(1)}%</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )

  const TurnoverTable = ({ data }: { data: PlayerRecord[] }) => (
    <Box overflowX="auto">
      <Table size={isMobile ? "sm" : "md"} variant="simple">
        <Thead>
          <Tr>
            <SortableHeader field="name">선수</SortableHeader>
            <SortableHeader field="turnoversPerMatch" isNumeric>경기당 턴오버</SortableHeader>
            <SortableHeader field="turnoversPerQuarter" isNumeric>쿼터당 턴오버</SortableHeader>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(player => (
            <Tr key={player.id}>
              <Td>{player.name}</Td>
              <Td isNumeric>{player.turnoversPerMatch.toFixed(1)}</Td>
              <Td isNumeric>{player.turnoversPerQuarter.toFixed(1)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )

  return (
    <VStack spacing={8} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        <Card borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Heading size="md" mb={4} color="blue.500">득점 TOP 5</Heading>
            {topScorers.map((player, index) => (
              <HStack key={player.id} justify="space-between" mb={2}>
                <HStack>
                  <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                    {index + 1}.
                  </Text>
                  <Text w="80px">{player.name}</Text>
                </HStack>
                <Text fontWeight="bold" w="50px" textAlign="right">{player.goals}골</Text>
              </HStack>
            ))}
          </CardBody>
        </Card>

        <Card borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Heading size="md" mb={4} color="blue.500">어시스트 TOP 5</Heading>
            {topAssisters.map((player, index) => (
              <HStack key={player.id} justify="space-between" mb={2}>
                <HStack>
                  <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                    {index + 1}.
                  </Text>
                  <Text w="80px">{player.name}</Text>
                </HStack>
                <Text fontWeight="bold" w="50px" textAlign="right">{player.assists}도움</Text>
              </HStack>
            ))}
          </CardBody>
        </Card>

        <Card borderColor={borderColor} boxShadow="sm">
          <CardBody>
            <Heading size="md" mb={4} color="blue.500">MOM TOP 5</Heading>
            {topMoms.map((player, index) => (
              <HStack key={player.id} justify="space-between" mb={2}>
                <HStack>
                  <Text w="24px" textAlign="right" color={index < 3 ? "blue.500" : "gray.500"} fontWeight="bold">
                    {index + 1}.
                  </Text>
                  <Text w="80px">{player.name}</Text>
                </HStack>
                <Text fontWeight="bold" w="50px" textAlign="right">{player.mom}회</Text>
              </HStack>
            ))}
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card borderColor={borderColor} boxShadow="sm">
        <CardBody>
          {isMobile ? (
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>기본 기록</Tab>
                <Tab>승률</Tab>
                <Tab>턴오버</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <StatTable data={sortedPlayerRecords} />
                </TabPanel>
                <TabPanel px={0}>
                  <WinRateTable data={sortedPlayerRecords} />
                </TabPanel>
                <TabPanel px={0}>
                  <TurnoverTable data={sortedPlayerRecords} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : (
            <Box position="relative" overflowX="auto">
              <Table size="md" variant="simple">
                <Thead>
                  <Tr>
                    <SortableHeader field="name">선수</SortableHeader>
                    <SortableHeader field="matches" isNumeric>경기</SortableHeader>
                    <SortableHeader field="goals" isNumeric>득점</SortableHeader>
                    <SortableHeader field="assists" isNumeric>도움</SortableHeader>
                    <SortableHeader field="mom" isNumeric>MOM</SortableHeader>
                    <SortableHeader field="matchWinRate" isNumeric>경기 승률</SortableHeader>
                    <SortableHeader field="quarterWinRate" isNumeric>쿼터 승률</SortableHeader>
                    <SortableHeader field="turnoversPerMatch" isNumeric>턴오버(경기)</SortableHeader>
                    <SortableHeader field="turnoversPerQuarter" isNumeric>턴오버(쿼터)</SortableHeader>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedPlayerRecords.map(player => (
                    <Tr key={player.id}>
                      <Td>{player.name}</Td>
                      <Td isNumeric>{player.matches}</Td>
                      <Td isNumeric>{player.goals}</Td>
                      <Td isNumeric>{player.assists}</Td>
                      <Td isNumeric>{player.mom}</Td>
                      <Td isNumeric>{player.matchWinRate.toFixed(1)}%</Td>
                      <Td isNumeric>{player.quarterWinRate.toFixed(1)}%</Td>
                      <Td isNumeric>{player.turnoversPerMatch.toFixed(1)}</Td>
                      <Td isNumeric>{player.turnoversPerQuarter.toFixed(1)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  )
} 