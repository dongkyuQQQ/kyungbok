'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Team } from '@/types'
import { Member } from '@prisma/client'

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void>
  initialData?: Member | null
}

export interface MemberFormData {
  name: string
  phoneNumber: string
  number: number
  birthDate: string
  generation: number
  team: Team
}

export function MemberForm({ onSubmit, initialData }: MemberFormProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    phoneNumber: '',
    number: 0,
    birthDate: '',
    generation: 1,
    team: Team.CHUNGDONG
  })

  useEffect(() => {
    if (initialData) {
      const birthDate = new Date(initialData.birthDate)
      const formattedBirthDate = birthDate.toISOString().split('T')[0]
      setFormData({
        name: initialData.name,
        phoneNumber: initialData.phoneNumber,
        number: initialData.number,
        birthDate: formattedBirthDate,
        generation: initialData.generation,
        team: initialData.team as Team
      })
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
      if (!initialData) {
        setFormData({
          name: '',
          phoneNumber: '',
          number: 0,
          birthDate: '',
          generation: 1,
          team: Team.CHUNGDONG
        })
      }
      toast({
        title: initialData ? '회원이 수정되었습니다.' : '회원이 등록되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: initialData ? '회원 수정에 실패했습니다.' : '회원 등록에 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} bg="white" borderRadius="md">
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>이름</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>연락처</FormLabel>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>등번호</FormLabel>
          <Input
            type="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>생년월일</FormLabel>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>기수</FormLabel>
          <Input
            type="number"
            value={formData.generation}
            onChange={(e) => setFormData({ ...formData, generation: parseInt(e.target.value) })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>소속팀</FormLabel>
          <Select
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value as Team })}
          >
            <option value={Team.CHUNGDONG}>충동팀</option>
            <option value={Team.JUNGBYUNG}>정병팀</option>
          </Select>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
        >
          {initialData ? '회원 수정' : '회원 등록'}
        </Button>
      </VStack>
    </Box>
  )
} 