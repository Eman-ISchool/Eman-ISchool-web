export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden lg:block w-64 border-e bg-white">
          Sidebar
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white">
            TopBar
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
