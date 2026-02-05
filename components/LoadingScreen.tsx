export default function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <div className="text-4xl font-mono text-cyber-blue text-glow mb-4" role="banner" aria-label="Orbit Command">
          ORBIT COMMAND
        </div>
        <p className="text-sm font-mono text-gray-400 animate-pulse">
          Initializing Solar System...
        </p>
      </div>
    </div>
  );
}
