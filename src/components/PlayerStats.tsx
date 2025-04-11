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
  TableContainer,
} from '@chakra-ui/react'
import { Entry, Goal, Member, Turnover, Rating } from '@prisma/client'
import type { Match } from '@prisma/client'
import { useMemo, useState } from 'react'

interface PlayerStatsProps {
  members: Member[];
  matches: MatchExtended[];
  goals: Goal[];
  entries: Entry[];
  ratings: RatingExtended[];
  turnovers: Turnover[];
  view?: 'basic' | 'scoring' | 'winrate' | 'rating';
}

interface PlayerRecord {
  id: number;
  name: string;
  team: string;
  matches: number;
  goals: number;
  assists: number;
  mom: number;
  matchWinRate: number;
  quarterWinRate: number;
  turnoversPerMatch: number;
  turnoversPerQuarter: number;
  rating: number;
}

interface MatchExtended {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  startTime: Date;
  endTime: Date;
  location: string;
  quarters: number;
  momId: number | null;
  scoreA: number;
  scoreB: number;
}

interface RatingExtended {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  matchId: number;
  memberId: number;
  score: number;
  rating: number;
  isMom: boolean;
}

export default function PlayerStats({
  members,
  matches,
  goals,
  entries,
  ratings,
  turnovers,
  view = 'basic'
}: PlayerStatsProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerBg = useColorModeValue('gray.50', 'gray.800')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [sortField, setSortField] = useState<keyof PlayerRecord>('goals')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const playerRecords = useMemo(() => {
    return members.map(member => {
      const playerMatches = matches.filter(match => 
        entries.some(entry => entry.matchId === match.id && entry.memberId === member.id)
      );

      const playerWins = playerMatches.filter(match => {
        const entry = entries.find(e => e.matchId === match.id && e.memberId === member.id);
        if (!entry) return false;
        return entry.team === 'A' ? Number(match.scoreA) > Number(match.scoreB) : Number(match.scoreB) > Number(match.scoreA);
      }).length;

      const winRate = playerMatches.length > 0 ? Math.round((playerWins / playerMatches.length) * 100) : 0;
      
      const momCount = ratings.filter(rating => 
        rating.memberId === member.id && rating.isMom === true
      ).length;

      return {
        id: member.id,
        name: member.name,
        team: member.team,
        matches: playerMatches.length,
        goals: goals.filter(goal => goal.scorerId === member.id).length,
        assists: goals.filter(goal => goal.assistId === member.id).length,
        mom: momCount,
        matchWinRate: winRate,
        quarterWinRate: 0,
        turnoversPerMatch: turnovers.filter(turnover => turnover.memberId === member.id).length,
        turnoversPerQuarter: 0,
        rating: ratings.filter(rating => rating.memberId === member.id).reduce((sum, rating) => sum + rating.rating, 0) / ratings.filter(rating => rating.memberId === member.id).length
      }
    })
  }, [members, matches, entries, goals, turnovers, ratings])

  const sortedPlayerRecords = useMemo(() => {
    return [...playerRecords].sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return sortOrder === 'asc' 
        ? (a[sortField] as number) - (b[sortField] as number)
        : (b[sortField] as number) - (a[sortField] as number);
    });
  }, [playerRecords, sortField, sortOrder]);

  const topScorers = useMemo(() => {
    return [...playerRecords].sort((a, b) => b.goals - a.goals).slice(0, 5);
  }, [playerRecords]);

  const topAssisters = useMemo(() => {
    return [...playerRecords].sort((a, b) => b.assists - a.assists).slice(0, 5);
  }, [playerRecords]);

  const topMoms = useMemo(() => {
    return [...playerRecords].sort((a, b) => b.mom - a.mom).slice(0, 5);
  }, [playerRecords]);

  const handleSort = (field: keyof PlayerRecord) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
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
            {sortOrder === 'asc' ? '▲' : '▼'}
          </Text>
        )}
      </HStack>
    </Th>
  )

  const sortMatches = (matches: MatchExtended[]) => {
    return [...matches].sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const calculateStats = (matches: MatchExtended[], ratings: RatingExtended[]) => {
    const totalMatches = matches.length;
    const wins = matches.filter(match => match.scoreA > match.scoreB).length;
    const draws = matches.filter(match => match.scoreA === match.scoreB).length;
    const losses = matches.filter(match => match.scoreA < match.scoreB).length;
    const momCount = ratings.filter(rating => rating.isMom).length;
    const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;

    return {
      totalMatches,
      wins,
      draws,
      losses,
      momCount,
      averageRating: isNaN(averageRating) ? 0 : averageRating
    };
  };

  return (
    <Box>
      {view === 'basic' && (
        <TableContainer>
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                <SortableHeader field="name" position="sticky" left={0} zIndex={1} bg={headerBg}>
                  선수
                </SortableHeader>
                <SortableHeader field="matches" isNumeric>경기</SortableHeader>
                <SortableHeader field="goals" isNumeric>득점</SortableHeader>
                <SortableHeader field="assists" isNumeric>도움</SortableHeader>
                <SortableHeader field="mom" isNumeric>MOM</SortableHeader>
                <SortableHeader field="matchWinRate" isNumeric>승률</SortableHeader>
              </Tr>
            </Thead>
            <Tbody>
              {sortedPlayerRecords.map((record) => (
                <Tr key={record.id}>
                  <Td position="sticky" left={0} bg={useColorModeValue('white', 'gray.800')} zIndex={1}>
                    <HStack spacing={2}>
                      <Avatar size="sm" name={record.name} />
                      <Text>{record.name}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>{record.matches}</Td>
                  <Td isNumeric>{record.goals}</Td>
                  <Td isNumeric>{record.assists}</Td>
                  <Td isNumeric>{record.mom}</Td>
                  <Td isNumeric>
                    <Badge colorScheme={record.matchWinRate >= 50 ? 'green' : 'red'}>
                      {record.matchWinRate}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {view === 'scoring' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">득점 순위</Heading>
                {topScorers.map((player, index) => (
                  <HStack key={player.id} justify="space-between" p={2} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                    <HStack>
                      <Text fontWeight="bold" w={8}>{index + 1}.</Text>
                      <Avatar size="sm" name={player.name} />
                      <Text>{player.name}</Text>
                    </HStack>
                    <Badge colorScheme="green">{player.goals}골</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">어시스트 순위</Heading>
                {topAssisters.map((player, index) => (
                  <HStack key={player.id} justify="space-between" p={2} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                    <HStack>
                      <Text fontWeight="bold" w={8}>{index + 1}.</Text>
                      <Avatar size="sm" name={player.name} />
                      <Text>{player.name}</Text>
                    </HStack>
                    <Badge colorScheme="blue">{player.assists}도움</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {view === 'rating' && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">MOM 순위</Heading>
                {topMoms.map((player, index) => (
                  <HStack key={player.id} justify="space-between" p={2} bg={index % 2 === 0 ? 'transparent' : useColorModeValue('gray.50', 'gray.700')}>
                    <HStack>
                      <Text fontWeight="bold" w={8}>{index + 1}.</Text>
                      <Avatar size="sm" name={player.name} />
                      <Text>{player.name}</Text>
                    </HStack>
                    <Badge colorScheme="purple">{player.mom}회</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Box>
  )
} 