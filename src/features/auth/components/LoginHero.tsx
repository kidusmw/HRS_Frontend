const LoginHero = () => {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 lg:block">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        {/* Large circles */}
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-blue-400/30" />
        <div className="absolute right-20 top-10 h-48 w-48 rounded-full bg-blue-300/20" />
        <div className="absolute -bottom-20 -left-10 h-96 w-96 rounded-full bg-blue-700/20" />
        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-300/30" />

        {/* Chevron patterns */}
        <div className="absolute left-12 top-12 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-1">
              <div className="h-2 w-8 rotate-45 bg-white/20" />
              <div className="h-2 w-8 rotate-45 bg-white/20" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-32 right-12 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-1">
              <div className="h-2 w-8 rotate-45 bg-white/20" />
              <div className="h-2 w-8 rotate-45 bg-white/20" />
            </div>
          ))}
        </div>

        {/* Wave patterns */}
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2">
          <svg width="120" height="40" viewBox="0 0 120 40" className="opacity-30">
            <path d="M0 20 Q 15 10, 30 20 T 60 20 T 90 20 T 120 20" stroke="white" strokeWidth="3" fill="none" />
            <path d="M0 28 Q 15 18, 30 28 T 60 28 T 90 28 T 120 28" stroke="white" strokeWidth="3" fill="none" />
            <path d="M0 36 Q 15 26, 30 36 T 60 36 T 90 36 T 120 36" stroke="white" strokeWidth="3" fill="none" />
          </svg>
        </div>

        {/* Dotted pattern */}
        <div className="absolute right-8 top-1/3 grid grid-cols-8 gap-2">
          {[...Array(64)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white/30" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-16 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <div className="h-6 w-6 rounded-full bg-blue-500" />
          </div>
          <div className="text-lg font-semibold text-white">
            YOUR
            <br />
            LOGO
          </div>
        </div>

        {/* Main content */}
        <div className="mt-auto mb-auto flex flex-col justify-center">
          <h1 className="text-5xl font-bold leading-tight text-white">
            Hello,
            <br />
            welcome!
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/90">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mi risus.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginHero