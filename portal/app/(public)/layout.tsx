export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F5F0E8] font-[family-name:var(--font-sans)]">
      {children}
    </div>
  )
}
