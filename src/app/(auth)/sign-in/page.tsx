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
import { Loader2, Eye, EyeOff } from 'lucide-react'

function SignIn() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className='flex justify-center items-center min-h-screen gradient-bg animate-gradient'>
      <div className='w-full max-w-md p-8 space-y-8 glass-panel text-white'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-glow'>
            Whisper Net  
          </h1>
          <p className='mb-4 text-white/80'>Sign in to start anonymous messaging to your friends</p>
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
                    <Input className="bg-black/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary" placeholder="Enter username" {...field} />
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
                    <div className="relative">
                      <Input 
                        className="bg-black/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary"
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all" type="submit" disabled={isSubmitting}>
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
        <div className='text-center mt-4 text-white/80'>
          <p>
            Don&#39;t have an account?{' '}
            <Link href="/sign-up" className='text-primary hover:text-primary/80 underline font-medium'>Sign Up</Link>
          </p>
        </div>
      </div> 
    </div>
  )
}

export default SignIn