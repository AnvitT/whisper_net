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
    <div className="my-12 mx-4 md:mx-8 lg:mx-auto p-6 md:p-10 glass-panel text-white rounded-2xl max-w-4xl shadow-2xl flex-grow flex flex-col justify-center animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2 text-glow">Whisper Net</h1>
        <h2 className="text-xl font-medium text-white/80 mb-4">Where your identity remains a secret.</h2>
        <p className="text-lg bg-white/10 inline-block px-4 py-2 rounded-full border border-white/20">
          Send a message to <span className="font-bold text-primary">{params.username}</span>
        </p>
      </div>
      
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
                    className="resize-none w-full max-w-full bg-black/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-primary min-h-[120px] p-4 text-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center mt-6">
            {isSubmitting ? (
              <Button disabled className="bg-primary/50 text-white w-full md:w-auto px-8 py-6 text-lg rounded-xl">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || !messageContent} className="w-full md:w-auto bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 px-8 py-6 text-lg rounded-xl">
                Send It
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
      
      <div className="space-y-4 my-8">
        <div className="space-y-2 text-center">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4 bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-md"
            variant="outline"
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? 'Loading...' : 'Suggest Messages'}
          </Button>
          <p className="text-white/70">Click on any message below to select it.</p>
        </div>
        
        <Card className="glass-panel border-white/10 bg-black/20">
          <CardHeader>
            <h3 className="text-xl font-semibold text-white">Suggested Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                className="mb-2 break-words whitespace-pre-wrap p-4 min-h-[3rem] bg-white/5 hover:bg-white/10 text-left justify-start border-white/10 h-auto text-white/90 font-normal shadow-sm transition-all"
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