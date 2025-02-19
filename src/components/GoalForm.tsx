'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  useToast,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Member, Goal } from '@prisma/client'
import { Team } from '@/types'

interface GoalFormProps {
  members: Member[]
  onSubmit: (data: { scorerId: number; assisterId?: number; quarter: number; team: Team }) => void
  quarter: number
  goals: (Goal & {
    scorer: Member
    assist?: Member
  })[]
}

export function GoalForm({ members, onSubmit, quarter, goals }: GoalFormProps) {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedTeam, setSelectedTeam] = useState<Team>(Team.CHUNGDONG)
  const [scorerId, setScorerId] = useState<number>(0)
  const [assisterId, setAssisterId] = useState<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scorerId) {
      onSubmit({
        scorerId,
        assisterId: assisterId || undefined,
        quarter,
        team: selectedTeam,
      })
      setScorerId(0)
      setAssisterId(0)
      onClose()
    }
  }

  const handleTeamGoal = (team: Team) => {
    setSelectedTeam(team)
    setScorerId(0)
    setAssisterId(0)
    onOpen()
  }

  const teamMembers = members.filter(m => m.team === selectedTeam)

  // 현재 쿼터의 골 기록만 필터링
  const quarterGoals = goals.filter(g => g.quarter === quarter)
  const chungdongGoals = quarterGoals.filter(g => g.team === Team.CHUNGDONG)
  const jungbyungGoals = quarterGoals.filter(g => g.team === Team.JUNGBYUNG)

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="md" mb={4}>
            충동팀
          </Heading>
          <Button
            colorScheme="blue"
            onClick={() => handleTeamGoal(Team.CHUNGDONG)}
            size="lg"
            width="full"
            mb={4}
          >
            골 추가
          </Button>
          {chungdongGoals.length > 0 && (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>득점자</Th>
                  <Th>어시스트</Th>
                </Tr>
              </Thead>
              <Tbody>
                {chungdongGoals.map((goal) => (
                  <Tr key={goal.id}>
                    <Td>{goal.scorer.name}</Td>
                    <Td>{goal.assist?.name || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            정병팀
          </Heading>
          <Button
            colorScheme="red"
            onClick={() => handleTeamGoal(Team.JUNGBYUNG)}
            size="lg"
            width="full"
            mb={4}
          >
            골 추가
          </Button>
          {jungbyungGoals.length > 0 && (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>득점자</Th>
                  <Th>어시스트</Th>
                </Tr>
              </Thead>
              <Tbody>
                {jungbyungGoals.map((goal) => (
                  <Tr key={goal.id}>
                    <Td>{goal.scorer.name}</Td>
                    <Td>{goal.assist?.name || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>
            {selectedTeam === Team.CHUNGDONG ? '충동팀' : '정병팀'} 득점 기록
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>득점자</FormLabel>
                <Select
                  value={scorerId}
                  onChange={(e) => setScorerId(Number(e.target.value))}
                  placeholder="득점자 선택"
                >
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>어시스트</FormLabel>
                <Select
                  value={assisterId}
                  onChange={(e) => setAssisterId(Number(e.target.value))}
                  placeholder="어시스트 선택"
                >
                  {teamMembers
                    .filter((m) => m.id !== scorerId)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>
            <Button colorScheme="blue" type="submit">
              기록
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
} 