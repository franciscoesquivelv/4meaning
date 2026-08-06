import WorkspaceNav from './WorkspaceNav'

export default function PersonaLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '100vh' }}>
      <WorkspaceNav />
      <main style={{ flex: 1, minWidth: 0, padding: '34px 32px 90px', maxWidth: 1180 }}>
        {children}
      </main>
    </div>
  )
}
