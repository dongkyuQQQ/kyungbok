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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { useEffect, useState } from 'react'
import { Member, Match, Entry } from '@prisma/client'
import { Team } from '@/types'
import { format } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaFutbol, FaUsers } from 'react-icons/fa'

interface EntryPageProps {
  params: {
    id: string
  }
}

export default function EntryPage({ params }: EntryPageProps) {
  const searchParams = useSearchParams()
  const initialQuarter = parseInt(searchParams.get('quarter') || '1')
  const [match, setMatch] = useState<Match | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter)
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])
  const [tabIndex, setTabIndex] = useState(searchParams.has('quarter') ? 1 : 0)
  const toast = useToast()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    fetchMatch()
    fetchMembers()
    fetchEntries()
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

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/schedule/${params.id}/entry`)
      const data = await response.json()
      setEntries(data)
      
      // 전체 출전 선수 목록 업데이트
      const uniqueMemberIds = [...new Set(data.map((entry: Entry) => entry.memberId))] as number[]
      setSelectedMembers(uniqueMemberIds)
    } catch (error) {
      toast({
        title: '출전 선수 목록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleMemberToggle = async (memberId: number) => {
    try {
      const isCurrentlySelected = isSelected(memberId)
      
      if (isCurrentlySelected) {
        // 참가 선수 등록 해제 시 확인
        const shouldRemove = window.confirm(
          '참가 선수 등록을 해제하면 해당 선수의 모든 출전 기록이 삭제됩니다.\n정말로 해제하시겠습니까?'
        )
        
        if (!shouldRemove) {
          return
        }
      }

      if (isCurrentlySelected) {
        // 전체 참가 명단에서 제외
        await Promise.all(
          entries
            .filter(e => e.memberId === memberId)
            .map(e => 
              fetch(`/api/schedule/${params.id}/entry/${e.id}`, {
                method: 'DELETE',
              })
            )
        )
        setSelectedMembers(prev => prev.filter(id => id !== memberId))
      } else {
        // 전체 참가 명단에 추가
        const member = members.find(m => m.id === memberId)
        if (member) {
          setSelectedMembers(prev => [...prev, memberId])
          
          await fetch(`/api/schedule/${params.id}/entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId,
              quarter: selectedQuarter,
              team: member.team,
            }),
          })
        }
      }
      fetchEntries()
    } catch (error) {
      toast({
        title: '참가 선수 등록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleQuarterEntryToggle = async (memberId: number, team: Team) => {
    try {
      const existingEntry = entries.find(
        e => e.memberId === memberId && e.quarter === selectedQuarter
      )

      if (existingEntry) {
        // 쿼터 출전 해제 시 확인
        const shouldRemove = window.confirm(
          `${selectedQuarter}쿼터 출전 명단에서 제외하시겠습니까?\n\n주의: 해당 선수의 ${selectedQuarter}쿼터 기록(득점, 어시스트, 턴오버 등)이 모두 삭제됩니다.`
        )
        
        if (!shouldRemove) {
          return
        }

        await fetch(`/api/schedule/${params.id}/entry/${existingEntry.id}`, {
          method: 'DELETE',
        })
      } else {
        // 전체 참가 명단에 있는 선수만 쿼터 출전 가능
        if (selectedMembers.includes(memberId)) {
          await fetch(`/api/schedule/${params.id}/entry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId,
              quarter: selectedQuarter,
              team,
            }),
          })
        } else {
          toast({
            title: '전체 참가 명단에 없는 선수입니다.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          })
          return
        }
      }
      fetchEntries()
    } catch (error) {
      toast({
        title: '출전 선수 등록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleGoToMatch = () => {
    router.push(`/schedule/${params.id}/match?quarter=${selectedQuarter}`)
  }

  if (!match) return null

  const quarterButtons = Array.from({ length: match.quarters }, (_, i) => i + 1)

  const isSelected = (memberId: number) => selectedMembers.includes(memberId)
  const isQuarterSelected = (memberId: number, quarter: number) => {
    return entries.some(e => e.memberId === memberId && e.quarter === quarter)
  }

  const getQuarterCount = (memberId: number) => {
    return entries.filter(e => e.memberId === memberId).length
  }

  const TeamMemberSelection = ({ team }: { team: Team }) => (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>이름</Th>
            <Th>등번호</Th>
            <Th>출전</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members
            .filter((member) => member.team === team)
            .map((member) => (
              <Tr key={member.id}>
                <Td>{member.name}</Td>
                <Td>{member.number}</Td>
                <Td>
                  <Checkbox
                    isChecked={isSelected(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                  />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </Box>
  )

  const ParticipatingMembersList = () => (
    <Accordion allowToggle defaultIndex={[]}>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="bold">전체 참가 선수 목록</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Heading size="md" mb={2}>충동팀</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>이름</Th>
                    <Th>등번호</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {members
                    .filter(m => m.team === Team.CHUNGDONG && isSelected(m.id))
                    .map(member => (
                      <Tr key={member.id}>
                        <Td>{member.name}</Td>
                        <Td>{member.number}</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Box>
            <Box>
              <Heading size="md" mb={2}>정병팀</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>이름</Th>
                    <Th>등번호</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {members
                    .filter(m => m.team === Team.JUNGBYUNG && isSelected(m.id))
                    .map(member => (
                      <Tr key={member.id}>
                        <Td>{member.name}</Td>
                        <Td>{member.number}</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading>출전 선수 엔트리</Heading>

          <Box>
            <Text fontSize="lg" mb={2}>
              {format(new Date(match?.date || ''), 'yyyy년 MM월 dd일')} -{' '}
              {match?.location}
            </Text>
            <Text fontSize="lg" mb={4}>
              {format(new Date(match?.startTime || ''), 'HH:mm')} ~{' '}
              {format(new Date(match?.endTime || ''), 'HH:mm')}
            </Text>
          </Box>

          <Box>
            <Button
              leftIcon={<FaUsers />}
              colorScheme="blue"
              onClick={onOpen}
              mb={4}
            >
              전체 참가 선수 등록
            </Button>
            <ParticipatingMembersList />
          </Box>

          <Box>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
              <HStack spacing={4}>
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
              <Button
                colorScheme="purple"
                leftIcon={<FaFutbol />}
                onClick={handleGoToMatch}
              >
                기록 입력
              </Button>
            </Box>

            <Tabs variant="enclosed">
              <TabList>
                <Tab>충동팀</Tab>
                <Tab>정병팀</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    mb={4}
                    onClick={async () => {
                      const chungdongMembers = members
                        .filter((member) => member.team === Team.CHUNGDONG && isSelected(member.id))
                      
                      const nonPlayingMembers = chungdongMembers.filter(
                        member => !isQuarterSelected(member.id, selectedQuarter)
                      )
                      
                      await Promise.all(
                        nonPlayingMembers.map(member =>
                          handleQuarterEntryToggle(member.id, Team.CHUNGDONG)
                        )
                      )
                    }}
                  >
                    충동팀 전체 선택
                  </Button>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>이름</Th>
                        <Th>등번호</Th>
                        <Th>출전</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {members
                        .filter((member) => member.team === Team.CHUNGDONG && isSelected(member.id))
                        .map((member) => (
                          <Tr key={member.id}>
                            <Td>{member.name} {getQuarterCount(member.id) > 0 && `(${getQuarterCount(member.id)})`}</Td>
                            <Td>{member.number}</Td>
                            <Td>
                              <Checkbox
                                isChecked={isQuarterSelected(member.id, selectedQuarter)}
                                onChange={() =>
                                  handleQuarterEntryToggle(member.id, Team.CHUNGDONG)
                                }
                              />
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TabPanel>

                <TabPanel>
                  <Button
                    colorScheme="red"
                    size="sm"
                    mb={4}
                    onClick={async () => {
                      const jungbyungMembers = members
                        .filter((member) => member.team === Team.JUNGBYUNG && isSelected(member.id))
                      
                      const nonPlayingMembers = jungbyungMembers.filter(
                        member => !isQuarterSelected(member.id, selectedQuarter)
                      )
                      
                      await Promise.all(
                        nonPlayingMembers.map(member =>
                          handleQuarterEntryToggle(member.id, Team.JUNGBYUNG)
                        )
                      )
                    }}
                  >
                    정병팀 전체 선택
                  </Button>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>이름</Th>
                        <Th>등번호</Th>
                        <Th>출전</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {members
                        .filter((member) => member.team === Team.JUNGBYUNG && isSelected(member.id))
                        .map((member) => (
                          <Tr key={member.id}>
                            <Td>{member.name} {getQuarterCount(member.id) > 0 && `(${getQuarterCount(member.id)})`}</Td>
                            <Td>{member.number}</Td>
                            <Td>
                              <Checkbox
                                isChecked={isQuarterSelected(member.id, selectedQuarter)}
                                onChange={() =>
                                  handleQuarterEntryToggle(member.id, Team.JUNGBYUNG)
                                }
                              />
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>전체 참가 선수 등록</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Tabs variant="enclosed">
                  <TabList>
                    <Tab>충동팀</Tab>
                    <Tab>정병팀</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <TeamMemberSelection team={Team.CHUNGDONG} />
                    </TabPanel>
                    <TabPanel>
                      <TeamMemberSelection team={Team.JUNGBYUNG} />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  )
} 