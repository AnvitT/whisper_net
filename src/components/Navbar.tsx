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
    <nav className='p-4 md:p-6 sticky top-0 z-50 glass-nav'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
        <a href='#' className='text-2xl font-bold mb-4 md:mb-0 text-glow tracking-tight text-white'>Whisper Net</a>
        {
          session ? (
            <div className='w-full flex justify-end items-center md:w-auto'>
              <span className='mr-4 hidden md:inline text-white/90'>Welcome, {user?.username || user?.email}</span>
              <div className='flex space-x-2'>
                {pathname === '/' && user && (
                  <Button className='w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/20' onClick={() => router.replace(`/dashboard`)}>Dashboard</Button>
                )}
                <Button className='w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/20' onClick={() => signOut()}>Logout</Button>
              </div>
            </div>
          ) : (
            <div className='w-full flex justify-end md:w-auto'>
              <Link href='/sign-in'>
                <Button className='w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg hover:shadow-primary/20'>Login</Button>
              </Link>
            </div>
          )
        }
      </div>
    </nav>
  )
}

export default Navbar