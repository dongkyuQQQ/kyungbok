'use client'

import {
  Box,
  Flex,
  Link as ChakraLink,
  Stack,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  useBreakpointValue,
  Text,
  HStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBars, FaHome } from 'react-icons/fa'

export function Navigation() {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const isActive = (path: string) => pathname === path

  const NavLinks = ({ isMobileView = false }) => (
    <>
      <ChakraLink
        as={Link}
        href="/"
        fontWeight={isActive('/') ? 'bold' : 'normal'}
        color={isActive('/') ? 'blue.400' : isMobileView ? 'gray.800' : 'white'}
        _hover={{ color: 'blue.400', textDecoration: 'none' }}
        transition="all 0.2s"
        fontSize={isMobileView ? "lg" : "md"}
        py={isMobileView ? 2 : 0}
      >
        <HStack spacing={2}>
          <FaHome />
          <Text>홈</Text>
        </HStack>
      </ChakraLink>
      <ChakraLink
        as={Link}
        href="/members"
        fontWeight={isActive('/members') ? 'bold' : 'normal'}
        color={isActive('/members') ? 'blue.400' : isMobileView ? 'gray.800' : 'white'}
        _hover={{ color: 'blue.400', textDecoration: 'none' }}
        transition="all 0.2s"
        fontSize={isMobileView ? "lg" : "md"}
        py={isMobileView ? 2 : 0}
      >
        회원 관리
      </ChakraLink>
      <ChakraLink
        as={Link}
        href="/schedule"
        fontWeight={isActive('/schedule') ? 'bold' : 'normal'}
        color={isActive('/schedule') ? 'blue.400' : isMobileView ? 'gray.800' : 'white'}
        _hover={{ color: 'blue.400', textDecoration: 'none' }}
        transition="all 0.2s"
        fontSize={isMobileView ? "lg" : "md"}
        py={isMobileView ? 2 : 0}
      >
        일정 관리
      </ChakraLink>
      <ChakraLink
        as={Link}
        href="/records"
        fontWeight={isActive('/records') ? 'bold' : 'normal'}
        color={isActive('/records') ? 'blue.400' : isMobileView ? 'gray.800' : 'white'}
        _hover={{ color: 'blue.400', textDecoration: 'none' }}
        transition="all 0.2s"
        fontSize={isMobileView ? "lg" : "md"}
        py={isMobileView ? 2 : 0}
      >
        경기 기록
      </ChakraLink>
    </>
  )

  return (
    <Box as="nav" bg="blue.600" color="white" position="sticky" top={0} zIndex={1000} boxShadow="md">
      <Flex maxW="container.xl" mx="auto" p={4} align="center" justify="space-between">
        <ChakraLink
          as={Link}
          href="/"
          fontSize="xl"
          fontWeight="bold"
          _hover={{ textDecoration: 'none', opacity: 0.8 }}
          transition="all 0.2s"
        >
          경복FC
        </ChakraLink>

        {isMobile ? (
          <>
            <IconButton
              aria-label="메뉴 열기"
              icon={<FaBars />}
              onClick={onOpen}
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.500' }}
            />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerBody>
                  <VStack spacing={4} mt={12} align="stretch">
                    <NavLinks isMobileView={true} />
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Stack direction="row" spacing={8}>
            <NavLinks />
          </Stack>
        )}
      </Flex>
    </Box>
  )
} 