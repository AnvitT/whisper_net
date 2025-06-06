'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { signInSchema } from '@/schemas/signInSchema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

function SignIn() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    const response = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password
    })
    if (response?.error) {
      let errorMessage = "Incorrect username or password"
      if (response.error.trim() === "Error: No user found") {
        errorMessage = "No user found"
      }
      if (response.error.trim() === "Error: User not verified") {
        errorMessage = "User not verified"
      }
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
    if (response?.url) {
      router.replace('/dashboard')
    }
    setIsSubmitting(false)
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
            Whisper Net  
          </h1>
          <p className='mb-4'>Sign in to start anonymous messaging to your friends</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold'>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold'>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {
                isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Please wait
                  </>
                ) : ("Sign In")
              }
            </Button>
          </form>
        </Form>
        <div className='text-center mt-4'>
          <p>
            Don&#39;t have an account?{' '}
            <Link href="/sign-up" className='text-blue-600 hover:text-blue-800'>Sign Up</Link>
          </p>
        </div>
      </div> 
    </div>
  )
}

export default SignIn