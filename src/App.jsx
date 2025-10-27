import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br bg-red-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Logo Section */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <a 
            href="https://vite.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
          </a>
          <a 
            href="https://react.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
          >
          </a>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-orange-300 to-yellow-300 mb-4">
          Vite + React
        </h1>

        {/* Counter Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 mb-6 text-xl"
          >
            count is {count}
          </button>
          <p className="text-gray-200 text-lg">
            Edit <code className="bg-white/10 px-2 py-1 rounded font-mono text-red-300">src/App.jsx</code> and save to test HMR
          </p>
        </div>

        {/* Info Section */}
        <p className="text-gray-400 text-sm">
          Click on the Vite and React logos to learn more
        </p>

        {/* Additional Info */}
        <div className="mt-12 text-gray-500 text-xs">
          <p>Built with using Vite, React, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App
