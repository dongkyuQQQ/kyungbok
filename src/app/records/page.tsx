'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { TeamStats } from '@/components/TeamStats'
import { PlayerStats } from '@/components/PlayerStats'
import { useEffect, useState } from 'react'
import { Member, Match, Goal, Entry, Rating, Turnover } from '@prisma/client'

export default function RecordsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [turnovers, setTurnovers] = useState<Turnover[]>([])
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [
        membersResponse,
        matchesResponse,
        goalsResponse,
        entriesResponse,
        ratingsResponse,
        turnoversResponse,
      ] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/schedule'),
        fetch('/api/records/goals'),
        fetch('/api/records/entries'),
        fetch('/api/records/ratings'),
        fetch('/api/records/turnovers'),
      ])

      if (!membersResponse.ok || !matchesResponse.ok || !goalsResponse.ok || 
          !entriesResponse.ok || !ratingsResponse.ok || !turnoversResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const [
        membersData,
        matchesData,
        goalsData,
        entriesData,
        ratingsData,
        turnoversData,
      ] = await Promise.all([
        membersResponse.json(),
        matchesResponse.json(),
        goalsResponse.json(),
        entriesResponse.json(),
        ratingsResponse.json(),
        turnoversResponse.json(),
      ])

      setMembers(Array.isArray(membersData) ? membersData : [])
      setMatches(Array.isArray(matchesData) ? matchesData : [])
      setGoals(Array.isArray(goalsData) ? goalsData : [])
      setEntries(Array.isArray(entriesData) ? entriesData : [])
      setRatings(Array.isArray(ratingsData) ? ratingsData : [])
      setTurnovers(Array.isArray(turnoversData) ? turnoversData : [])

      if (!Array.isArray(membersData)) console.error('Received non-array members data:', membersData)
      if (!Array.isArray(matchesData)) console.error('Received non-array matches data:', matchesData)
      if (!Array.isArray(goalsData)) console.error('Received non-array goals data:', goalsData)
      if (!Array.isArray(entriesData)) console.error('Received non-array entries data:', entriesData)
      if (!Array.isArray(ratingsData)) console.error('Received non-array ratings data:', ratingsData)
      if (!Array.isArray(turnoversData)) console.error('Received non-array turnovers data:', turnoversData)

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: '데이터를 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setMembers([])
      setMatches([])
      setGoals([])
      setEntries([])
      setRatings([])
      setTurnovers([])
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Card borderRadius="lg" boxShadow="lg" bg="white">
            <CardHeader>
              <Heading size="lg" color="blue.600">경기 기록</Heading>
            </CardHeader>
            <CardBody>
              <Tabs variant="soft-rounded" colorScheme="blue">
                <TabList mb={4}>
                  <Tab _selected={{ color: 'blue.600', bg: 'blue.50' }}>팀 기록</Tab>
                  <Tab _selected={{ color: 'blue.600', bg: 'blue.50' }}>개인 기록</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <TeamStats
                      members={members}
                      matches={matches}
                      goals={goals}
                      entries={entries}
                      turnovers={turnovers}
                      ratings={ratings}
                    />
                  </TabPanel>
                  <TabPanel px={0}>
                    <PlayerStats
                      members={members}
                      matches={matches}
                      goals={goals}
                      entries={entries}
                      ratings={ratings}
                      turnovers={turnovers}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
} 