'use client'

import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Button,
  useToast,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Member } from '@prisma/client'

interface MomSelectorProps {
  members: Member[]
  currentMomId: number | null
  onSelect: (memberId: number | null) => Promise<void>
}

export function MomSelector({
  members,
  currentMomId,
  onSelect,
}: MomSelectorProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentMomId?.toString() || ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSelect(selectedMemberId ? parseInt(selectedMemberId) : null)
      toast({
        title: 'MOM이 선정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'MOM 선정에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <FormControl>
        <FormLabel>MOM 선정</FormLabel>
        {currentMomId && (
          <Text mb={4} color="blue.500" fontWeight="bold">
            현재 MOM:{' '}
            {members.find((m) => m.id === currentMomId)?.name}
          </Text>
        )}
        <Select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          mb={4}
        >
          <option value="">선수 선택</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.team === 'CHUNGDONG' ? '충동팀' : '정병팀'})
            </option>
          ))}
        </Select>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={isLoading}
          isDisabled={!selectedMemberId}
        >
          MOM 선정
        </Button>
      </FormControl>
    </Box>
  )
} 