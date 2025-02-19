'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Member, Rating } from '@prisma/client'
import { Team } from '@/types'

interface RatingFormProps {
  members: Member[]
  ratings: Rating[]
  onUpdate: (memberId: number, score: number) => Promise<void>
}

export function RatingForm({ members, ratings, onUpdate }: RatingFormProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team>(Team.CHUNGDONG)
  const toast = useToast()

  const getRating = (memberId: number) => {
    const rating = ratings.find((r) => r.memberId === memberId)
    return rating?.score || 0
  }

  const handleRatingChange = async (memberId: number, score: string) => {
    try {
      await onUpdate(memberId, parseInt(score))
    } catch (error) {
      toast({
        title: '평점 등록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
            <Th>평점</Th>
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
                  <Select
                    value={getRating(member.id)}
                    onChange={(e) =>
                      handleRatingChange(member.id, e.target.value)
                    }
                  >
                    <option value={0}>선택</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(
                      (score) => (
                        <option key={score} value={score}>
                          {score}
                        </option>
                      )
                    )}
                  </Select>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </Box>
  )
} 