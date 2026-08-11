import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Send, MessageSquare, Sparkles } from 'lucide-react'

export default function App() {
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setMessages(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || content.length > 250) return

    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('messages')
      .insert([{ content: content.trim() }])

    if (insertError) {
      setError('Failed to send confession. Please try again.')
    } else {
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Live Anonymous Board
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Confessions Wall
          </h1>
          <p className="text-sm text-zinc-400">
            Drop a thought anonymously. It appears instantly across all screens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={250}
            rows={3}
            placeholder="What's on your mind?..."
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${content.length > 220 ? 'text-amber-400' : 'text-zinc-500'}`}>
              {content.length}/250
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Confess'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="group relative bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between space-y-4 shadow-md"
            >
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/50">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Anonymous
                </span>
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}