export const metadata = {
  title: "Whisper Net",
  description: "Whisper Net - Where your identity remains a secret.",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  )
}
