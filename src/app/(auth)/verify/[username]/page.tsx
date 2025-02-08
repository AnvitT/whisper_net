'use client'
import { useToast } from '@/hooks/use-toast'
import { verifySchema } from '@/schemas/verifySchema'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function VerifyOtpPage() {
  const router = useRouter()
  const params = useParams<{ username: string }>()
  const { toast } = useToast()
  const [resendTimer, setResendTimer] = useState(30)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: ''
    }
  })

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setIsResendDisabled(false)
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current!)
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    const combinedOtp = newOtpValues.join('')
    form.setValue('code', combinedOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (!/^\d{6}$/.test(pastedData)) return

    const digits = pastedData.split('')
    setOtpValues(digits)
    form.setValue('code', pastedData)
  }

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsVerifying(true)
    try {
      const response = await axios.post(`/api/verify-code`, {
        username: params.username,
        code: data.code
      })

      toast({
        title: "Success",
        description: response.data.message
      })

      router.replace(`/sign-in`)
    } catch (error) {
      console.error("Error verifying user ", error)
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message ?? "Error verifying user"
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await axios.post('/api/resend-code', {
        username: params.username
      })

      setResendTimer(30)
      setIsResendDisabled(true)
      startTimer()
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email"
      })
    } catch (error) {
      console.error("Error resending code ", error)
      const axiosError = error as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message ?? "Error resending verification code"
      toast({
        title: "Failed to resend code",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
            Verify your Account
          </h1>
          <p className='mb-4'>Enter the verification code sent to your email</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className="flex justify-center gap-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>
            {form.formState.errors.code && (
              <p className="text-sm text-red-500 text-center mt-2">
                {form.formState.errors.code.message}
              </p>
            )}
            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ?
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Verifying..
                  </> : 'Verify'}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isResendDisabled || isResending}
                  className="text-sm w-full"
                >
                  {isResending 
                    ? <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Resending..
                      </>
                    : isResendDisabled 
                      ? `Resend code in ${resendTimer}s`
                      : 'Resend code'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default VerifyOtpPage