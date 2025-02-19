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
  IconButton,
  useToast,
  Stack,
  useBreakpointValue,
  Card,
  CardBody,
  Text,
  HStack,
  VStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Icon,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
import { Member } from '@prisma/client'
import { Team } from '@/types'
import { useState } from 'react'

interface MemberListProps {
  members: Member[]
  onEdit: (member: Member) => void
  onDelete: (id: number) => Promise<void>
}

type SortField = 'name' | 'number' | 'birthDate' | 'generation'
type SortOrder = 'asc' | 'desc'

export function MemberList({ members, onEdit, onDelete }: MemberListProps) {
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        await onDelete(id)
        toast({
          title: '회원이 삭제되었습니다.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: '회원 삭제에 실패했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <Icon as={FaSort} />
    return sortOrder === 'asc' ? <Icon as={FaSortUp} /> : <Icon as={FaSortDown} />
  }

  const sortedMembers = [...members].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name)
      case 'number':
        return multiplier * (a.number - b.number)
      case 'birthDate':
        return multiplier * (new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime())
      case 'generation':
        return multiplier * (a.generation - b.generation)
      default:
        return 0
    }
  })

  const MemberTable = ({ filteredMembers }: { filteredMembers: Member[] }) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th cursor="pointer" onClick={() => handleSort('name')}>
            <HStack spacing={1}>
              <Text>이름</Text>
              {getSortIcon('name')}
            </HStack>
          </Th>
          <Th>연락처</Th>
          <Th cursor="pointer" onClick={() => handleSort('number')}>
            <HStack spacing={1}>
              <Text>등번호</Text>
              {getSortIcon('number')}
            </HStack>
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('birthDate')}>
            <HStack spacing={1}>
              <Text>생년월일</Text>
              {getSortIcon('birthDate')}
            </HStack>
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('generation')}>
            <HStack spacing={1}>
              <Text>기수</Text>
              {getSortIcon('generation')}
            </HStack>
          </Th>
          <Th>소속팀</Th>
          <Th>관리</Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredMembers.map((member) => (
          <Tr key={member.id}>
            <Td>{member.name}</Td>
            <Td>{member.phoneNumber}</Td>
            <Td>{member.number}</Td>
            <Td>{new Date(member.birthDate).toLocaleDateString()}</Td>
            <Td>{member.generation}</Td>
            <Td>{member.team === Team.CHUNGDONG ? '충동팀' : '정병팀'}</Td>
            <Td>
              <IconButton
                aria-label="Edit member"
                icon={<FaEdit />}
                mr={2}
                onClick={() => onEdit(member)}
                colorScheme="blue"
                size="sm"
              />
              <IconButton
                aria-label="Delete member"
                icon={<FaTrash />}
                onClick={() => handleDelete(member.id)}
                colorScheme="red"
                size="sm"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )

  const MemberCards = ({ filteredMembers }: { filteredMembers: Member[] }) => (
    <Stack spacing={4}>
      {filteredMembers.map((member) => (
        <Card key={member.id} size="sm">
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="bold">{member.name}</Text>
                <Text>{member.team === Team.CHUNGDONG ? '충동팀' : '정병팀'}</Text>
              </HStack>
              <Text color="gray.600">등번호: {member.number}</Text>
              <Text color="gray.600">{member.phoneNumber}</Text>
              <Text color="gray.600">
                {new Date(member.birthDate).toLocaleDateString()} ({member.generation}기)
              </Text>
              <HStack justify="flex-end" spacing={2}>
                <IconButton
                  aria-label="Edit member"
                  icon={<FaEdit />}
                  onClick={() => onEdit(member)}
                  colorScheme="blue"
                  size="sm"
                />
                <IconButton
                  aria-label="Delete member"
                  icon={<FaTrash />}
                  onClick={() => handleDelete(member.id)}
                  colorScheme="red"
                  size="sm"
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </Stack>
  )

  return (
    <Box>
      <Tabs variant="enclosed">
        <TabList mb={4}>
          <Tab>전체</Tab>
          <Tab>충동팀</Tab>
          <Tab>정병팀</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            {isMobile ? (
              <MemberCards filteredMembers={sortedMembers} />
            ) : (
              <Box overflowX="auto">
                <MemberTable filteredMembers={sortedMembers} />
              </Box>
            )}
          </TabPanel>
          <TabPanel px={0}>
            {isMobile ? (
              <MemberCards filteredMembers={sortedMembers.filter(member => member.team === Team.CHUNGDONG)} />
            ) : (
              <Box overflowX="auto">
                <MemberTable filteredMembers={sortedMembers.filter(member => member.team === Team.CHUNGDONG)} />
              </Box>
            )}
          </TabPanel>
          <TabPanel px={0}>
            {isMobile ? (
              <MemberCards filteredMembers={sortedMembers.filter(member => member.team === Team.JUNGBYUNG)} />
            ) : (
              <Box overflowX="auto">
                <MemberTable filteredMembers={sortedMembers.filter(member => member.team === Team.JUNGBYUNG)} />
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
} 