function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 md:px-6 py-4">

        <h1 className="text-2xl font-bold text-blue-500">
          🚀 Page Pulse
        </h1>

        <nav className="flex items-center gap-6 text-slate-300">
          <a href="/" className="transition hover:text-blue-400">
            Home
          </a>

          <a href="#" className="transition hover:text-blue-400">
            About
          </a>

          <a href="#" className="transition hover:text-blue-400">
            GitHub
          </a>

          <div className="ml-4 flex items-center gap-3">
            {typeof window !== 'undefined' && (() => {
              try {
                const token = localStorage.getItem('pp_token');
                if (token) {
                  const user = JSON.parse(localStorage.getItem('pp_user') || 'null');
                  return (
                    <>
                      <a href="/profile" className="text-sm text-slate-200 hover:text-white">{user?.name ?? 'Profile'}</a>
                      <button onClick={() => { localStorage.removeItem('pp_token'); localStorage.removeItem('pp_user'); window.location.href = '/'; }} className="text-sm rounded-md bg-red-600 px-3 py-1">Sign out</button>
                    </>
                  );
                }
              } catch (e) { }
              return (
                <>
                  <a href="/login" className="text-sm text-slate-200 hover:text-white">Sign in</a>
                  <a href="/register" className="text-sm rounded-md bg-blue-600 px-3 py-1">Get started</a>
                </>
              );
            })()}
          </div>
        </nav>

      </div>
    </header>
  );
}

export default Header;