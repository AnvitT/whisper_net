'use client'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { messageSchema } from '@/schemas/messageSchema'
import { ApiResponse } from '@/types/ApiResponse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const LLM_MESSAGE_SEPARATOR = '||'
const INITIAL_MESSAGES = `What is your name?${LLM_MESSAGE_SEPARATOR}Where are you from?${LLM_MESSAGE_SEPARATOR}What do you do?`

const parseStringMessages = (messageString: string): string[] => 
  messageString.split(LLM_MESSAGE_SEPARATOR).map(msg => msg.trim()).filter(Boolean);

function Message() {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });
  const messageContent = form.watch('content');
  const { toast } = useToast();
  const params = useParams<{ username: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<string[]>(
    parseStringMessages(INITIAL_MESSAGES)
  );
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setMessages([]);

    try {
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userPrompt: messageContent?.trim() })
      });
      
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentPartial = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        currentPartial += chunk;

        // Check for complete messages
        const parts = currentPartial.split(LLM_MESSAGE_SEPARATOR);
        
        if (parts.length > 1) {
          // Process complete messages
          const completeMessages = parts.slice(0, -1);
          setMessages(prev => [
            ...prev, 
            ...completeMessages.map(msg => msg.trim())
          ]);

          // Keep the last partial message
          currentPartial = parts[parts.length - 1];
        }
      }

      // Final processing
      if (currentPartial.trim()) {
        setMessages(prev => [...prev, currentPartial.trim()]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error fetching messages",
        description: "An error occurred while fetching messages",
        variant: "destructive"
      });
    } finally {
      setIsSuggestLoading(false);
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => { 
    try {
      setIsSubmitting(true);
      const response = await axios.post(`/api/send-message`, {
        username: params.username,
        content: data.content
      });
      
      toast({
        title: "Message sent",
        description: response.data.message
      });
      
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      console.error("Error sending message: ", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message ?? "Error sending message";
      
      toast({
        title: "Sending message failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded max-w-6xl">
      <h1 className="text-4xl font-bold mb-1">Whisper Net</h1>
      <h1 className="text-2xl font-bold mb-4">Where your identity remains a secret.</h1>
      <p className="mb-4">Send a message to {params.username}</p>
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none w-full max-w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isSubmitting ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
      
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? 'Loading...' : 'Suggest Messages'}
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                className="mb-2 break-words whitespace-pre-wrap p-6 min-h-[3rem]"
                onClick={() => handleMessageClick(message)}
              >
                {message}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Message;