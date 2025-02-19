'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Match } from '@prisma/client'

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => Promise<void>
  initialData?: Match | null
}

export interface ScheduleFormData {
  date: string
  startTime: string
  endTime: string
  location: string
  quarters: number
}

export function ScheduleForm({ onSubmit, initialData }: ScheduleFormProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: '',
    startTime: '12:00',
    endTime: '15:00',
    location: '경복고등학교',
    quarters: 6,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: new Date(initialData.date).toISOString().split('T')[0],
        startTime: new Date(initialData.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(initialData.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        location: initialData.location,
        quarters: initialData.quarters,
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
          date: '',
          startTime: '12:00',
          endTime: '15:00',
          location: '경복고등학교',
          quarters: 6,
        })
      }
      toast({
        title: initialData ? '일정이 수정되었습니다.' : '일정이 등록되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: initialData ? '일정 수정에 실패했습니다.' : '일정 등록에 실패했습니다.',
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
          <FormLabel>날짜</FormLabel>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>시작 시간</FormLabel>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>종료 시간</FormLabel>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>장소</FormLabel>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>쿼터 수</FormLabel>
          <NumberInput
            value={formData.quarters}
            min={1}
            max={12}
            onChange={(value) => setFormData({ ...formData, quarters: parseInt(value) })}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
        >
          {initialData ? '일정 수정' : '일정 등록'}
        </Button>
      </VStack>
    </Box>
  )
} 