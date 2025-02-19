'use client'

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  VStack,
  HStack,
  Text,
  useBreakpointValue,
  Card,
  CardBody,
  Stack,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  useDisclosure,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaUsers, FaFutbol } from 'react-icons/fa'
import { Match } from '@prisma/client'
import Link from 'next/link'
import { format } from 'date-fns'
import { useState } from 'react'

interface ScheduleListProps {
  matches: Match[]
  onEdit: (match: Match) => void
  onDelete: (id: number) => Promise<void>
}

export function ScheduleList({ matches, onEdit, onDelete }: ScheduleListProps) {
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [password, setPassword] = useState('')
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)

  const handleDeleteClick = (id: number) => {
    setSelectedMatchId(id)
    setPassword('')
    onOpen()
  }

  const handleDelete = async () => {
    if (password !== '1234') {
      toast({
        title: '비밀번호가 일치하지 않습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (selectedMatchId) {
      try {
        await onDelete(selectedMatchId)
        toast({
          title: '일정이 삭제되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      } catch (error) {
        toast({
          title: '일정 삭제에 실패했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const ActionButtons = ({ match }: { match: Match }) => (
    <Stack direction={isMobile ? "column" : "row"} spacing={2} width={isMobile ? "full" : "auto"} justifyContent="flex-end" alignItems="center">
      <Link href={`/schedule/${match.id}/entry`} passHref style={{ width: isMobile ? '100%' : 'auto' }}>
        <Button
          as="a"
          leftIcon={<FaUsers />}
          colorScheme="green"
          size={isMobile ? "sm" : "sm"}
          width={isMobile ? "full" : "auto"}
        >
          출전 선수 등록
        </Button>
      </Link>
      <Link href={`/schedule/${match.id}/match`} passHref style={{ width: isMobile ? '100%' : 'auto' }}>
        <Button
          as="a"
          leftIcon={<FaFutbol />}
          colorScheme="purple"
          size={isMobile ? "sm" : "sm"}
          width={isMobile ? "full" : "auto"}
        >
          기록 입력
        </Button>
      </Link>
      <Button
        leftIcon={<FaEdit />}
        onClick={() => onEdit(match)}
        colorScheme="blue"
        size={isMobile ? "sm" : "sm"}
        width={isMobile ? "full" : "auto"}
        aria-label="일정 수정"
      >
        {isMobile && "수정"}
      </Button>
      <Button
        leftIcon={<FaTrash />}
        onClick={() => handleDeleteClick(match.id)}
        colorScheme="red"
        size={isMobile ? "sm" : "sm"}
        width={isMobile ? "full" : "auto"}
        aria-label="일정 삭제"
      >
        {isMobile && "삭제"}
      </Button>
    </Stack>
  )

  if (isMobile) {
    return (
      <Stack spacing={4}>
        {matches.map((match) => (
          <Card key={match.id} size="sm">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">
                    {format(new Date(match.date), 'yyyy-MM-dd')}
                  </Text>
                  <Text color="gray.600">{match.location}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">
                    {format(new Date(match.startTime), 'HH:mm')} ~{' '}
                    {format(new Date(match.endTime), 'HH:mm')}
                  </Text>
                  <Text color="gray.600">{match.quarters}쿼터</Text>
                </HStack>
                <Divider />
                <ActionButtons match={match} />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    )
  }

  return (
    <>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>날짜</Th>
              <Th>시작 시간</Th>
              <Th>종료 시간</Th>
              <Th>장소</Th>
              <Th>쿼터 수</Th>
              <Th>관리</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matches.map((match) => (
              <Tr key={match.id}>
                <Td>{format(new Date(match.date), 'yyyy-MM-dd')}</Td>
                <Td>{format(new Date(match.startTime), 'HH:mm')}</Td>
                <Td>{format(new Date(match.endTime), 'HH:mm')}</Td>
                <Td>{match.location}</Td>
                <Td>{match.quarters}</Td>
                <Td>
                  <ActionButtons match={match} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>일정 삭제 확인</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2} color="red.500" fontWeight="bold">
              주의: 일정을 삭제하면 다음 기록이 모두 함께 삭제됩니다.
            </Text>
            <Text mb={4} color="red.500">
              - 출전 선수 명단<br />
              - 득점 및 어시스트 기록<br />
              - 턴오버 기록<br />
              - 선수 평점<br />
              - MOM 선정 결과
            </Text>
            <Text mb={4}>삭제를 진행하려면 비밀번호를 입력하세요.</Text>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDelete}>
              삭제
            </Button>
            <Button variant="ghost" onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 