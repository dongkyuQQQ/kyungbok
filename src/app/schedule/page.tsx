'use client'

import {
  Box,
  Container,
  Heading,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { ScheduleForm, ScheduleFormData } from '@/components/ScheduleForm'
import { ScheduleList } from '@/components/ScheduleList'
import { useEffect, useState } from 'react'
import { Match } from '@prisma/client'
import { format } from 'date-fns'

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setMatches(data)
      } else {
        console.error('Received non-array data:', data)
        setMatches([])
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      toast({
        title: '일정 목록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setMatches([])
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const handleSubmit = async (data: ScheduleFormData) => {
    try {
      if (selectedMatch) {
        await fetch('/api/schedule', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            id: selectedMatch.id,
          }),
        })
      } else {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      fetchMatches()
      setSelectedMatch(null)
      onClose()
    } catch (error) {
      throw error
    }
  }

  const handleEdit = (match: Match) => {
    setSelectedMatch(match)
    onOpen()
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/schedule?id=${id}`, {
        method: 'DELETE',
      })
      fetchMatches()
    } catch (error) {
      throw error
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={10}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
          <Heading>일정 관리</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            일정 등록
          </Button>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedMatch ? '일정 수정' : '일정 등록'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <ScheduleForm
                onSubmit={handleSubmit}
                initialData={selectedMatch}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        <ScheduleList
          matches={matches}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Container>
    </Box>
  )
} 