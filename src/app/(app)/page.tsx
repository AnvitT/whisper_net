'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Mail } from 'lucide-react';
import React from 'react'
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

const autoplay = Autoplay({ delay: 2000 });

function Home() {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-24 gradient-bg animate-gradient text-white min-h-[calc(100vh-80px)]">
        <section className="text-center mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Explore the Realm of <br className="hidden md:block" /> Confidential Feedback
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Whisper Net - Where your identity remains a secret.
          </p>
        </section>

        <Carousel
          plugins={[autoplay]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="glass-panel border-white/10 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold tracking-tight">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                    <div className="p-3 bg-white/10 rounded-full">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 leading-relaxed mb-2">{message.content}</p>
                      <p className="text-xs text-white/50 font-medium">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      <footer className="text-center p-6 bg-black/90 text-white/60 border-t border-white/10 text-sm">
        © {new Date().getFullYear()} Whisper Net. All rights reserved.
      </footer>
    </>
  );
}

export default Home