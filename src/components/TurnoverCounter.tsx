'use client'

import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Text,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Member, Turnover } from '@prisma/client'
import { Team } from '@/types'
import { FaMinus, FaPlus } from 'react-icons/fa'

interface TurnoverCounterProps {
  members: Member[]
  turnovers: Turnover[]
  quarter: number
  onUpdate: (memberId: number, count: number) => Promise<void>
}

export function TurnoverCounter({
  members,
  turnovers,
  quarter,
  onUpdate,
}: TurnoverCounterProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team>(Team.CHUNGDONG)

  const getTurnoverCount = (memberId: number) => {
    const turnover = turnovers.find(
      (t) => t.memberId === memberId && t.quarter === quarter
    )
    return turnover?.count || 0
  }

  const handleIncrement = async (memberId: number) => {
    const currentCount = getTurnoverCount(memberId)
    await onUpdate(memberId, currentCount + 1)
  }

  const handleDecrement = async (memberId: number) => {
    const currentCount = getTurnoverCount(memberId)
    if (currentCount > 0) {
      await onUpdate(memberId, currentCount - 1)
    }
  }

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <FormControl mb={4}>
        <FormLabel>팀 선택</FormLabel>
        <Select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value as Team)}
        >
          <option value={Team.CHUNGDONG}>충동팀</option>
          <option value={Team.JUNGBYUNG}>정병팀</option>
        </Select>
      </FormControl>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>이름</Th>
            <Th>등번호</Th>
            <Th>턴오버</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members
            .filter((member) => member.team === selectedTeam)
            .map((member) => (
              <Tr key={member.id}>
                <Td>{member.name}</Td>
                <Td>{member.number}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => handleDecrement(member.id)}
                      leftIcon={<FaMinus />}
                    />
                    <Text fontWeight="bold">
                      {getTurnoverCount(member.id)}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => handleIncrement(member.id)}
                      leftIcon={<FaPlus />}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </Box>
  )
} 