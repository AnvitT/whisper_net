import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "Whisper Net",
  description: "Whisper Net - Where your identity remains a secret.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
