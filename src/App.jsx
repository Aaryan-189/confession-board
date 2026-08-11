import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Send, MessageSquare, Sparkles, Layers, ShieldCheck, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

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
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium" style={{ color: '#24b55e' }}>
            <Sparkles className="w-3.5 h-3.5" /> Live Anonymous Board
          </div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5" /> View All Archive
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
            Confessions Wall
          </h1>
          <p className="text-sm text-slate-400">
            Drop a thought anonymously. It appears instantly across all screens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={250}
            rows={3}
            placeholder="What's on your mind?..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none"
            style={{ focusBorderColor: '#24b55e' }}
            onFocus={(e) => e.target.style.borderColor = '#24b55e'}
            onBlur={(e) => e.target.style.borderColor = ''}
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${content.length > 220 ? 'text-amber-400' : 'text-slate-500'}`}>
              {content.length}/250
            </span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ backgroundColor: '#24b55e', boxShadow: '0 10px 25px -5px rgba(36, 181, 94, 0.3)' }}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Confess'}
            </button>
          </div>
        </form>

        {messages.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 border border-slate-800/50 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No confessions yet.</p>
            <p className="text-xs text-slate-600 mt-1">Be the first person to share a thought!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="group relative bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between space-y-4 shadow-md"
              >
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
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
        )}
      </div>

      <footer className="w-full max-w-2xl mx-auto mt-16 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: '#24b55e' }} />
          <span>100% Secure & Encrypted Anonymity</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 animate-pulse" style={{ color: '#24b55e' }} />
          <span>Realtime Feed Operational</span>
        </div>
      </footer>
    </div>
  )
}