'use client'

import {
  Box,
  Container,
  Heading,
  useDisclosure,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Navigation } from '@/components/Navigation'
import { MemberForm, MemberFormData } from '@/components/MemberForm'
import { MemberList } from '@/components/MemberList'
import { useEffect, useState } from 'react'
import { Member } from '@prisma/client'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setMembers(data)
      } else {
        console.error('Received non-array data:', data)
        setMembers([])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: '회원 목록을 불러오는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setMembers([])
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleSubmit = async (data: MemberFormData) => {
    try {
      if (selectedMember) {
        await fetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: selectedMember.id }),
        })
      } else {
        await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      fetchMembers()
      setSelectedMember(null)
      onClose()
    } catch (error) {
      throw error
    }
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    onOpen()
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      })
      fetchMembers()
    } catch (error) {
      throw error
    }
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Container maxW="container.xl" py={10}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
          <Heading>회원 관리</Heading>
          <Button colorScheme="blue" onClick={onOpen}>
            회원 등록
          </Button>
        </Box>
        
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedMember ? '회원 수정' : '회원 등록'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <MemberForm
                onSubmit={handleSubmit}
                initialData={selectedMember}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        <MemberList
          members={members}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Container>
    </Box>
  )
} 