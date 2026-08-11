import React from 'react'
import { Sparkles, Send } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-medium text-sm">
          <Sparkles className="w-4 h-4" /> Tailwind v4 + Lucide Ready
        </div>
        <button className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
          <Send className="w-4 h-4" /> Submit
        </button>
      </div>
    </div>
  )
}