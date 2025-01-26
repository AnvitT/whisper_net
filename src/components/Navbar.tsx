"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from './ui/button'
import { useRouter, usePathname } from 'next/navigation'

function Navbar() {
  const { data: session } = useSession()
  const user: User = session?.user as User
  const router = useRouter()
  const pathname = usePathname()
  
  return (
    <nav className='p-4 md:p-6 shadow-md'>
      <div className='container mx-auto flex flex- md:flex-row justify-between items-center'>
        <a href='#' className='text-xl font-bold mb-4 md:mb-0'>Whisper Net</a>
        {
          session ? (
            <div className='w-full flex justify-end items-center md:w-auto'>
              <span className='mr-4 hidden md:inline'>Welcome, {user?.username || user?.email}</span>
              <div className='flex space-x-2'>
                {pathname === '/' && user && (
                  <Button className='w-full md:w-auto' onClick={() => router.replace(`/dashboard`)}>Dashboard</Button>
                )}
                <Button className='w-full md:w-auto' onClick={() => signOut()}>Logout</Button>
              </div>
            </div>
          ) : (
            <div className='w-full flex justify-end md:w-auto'>
              <Link href='/sign-in'>
                <Button className='w-full md:w-auto'>Login</Button>
              </Link>
            </div>
          )
        }
      </div>
    </nav>
  )
}

export default Navbar