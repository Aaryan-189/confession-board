import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { MessageSquare, Sparkles, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Feed() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('realtime-feed')
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
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Wall
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> All Anonymous Confessions
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Public Archive
          </h1>
          <p className="text-sm text-zinc-400">
            A complete historical stream of every anonymous thought shared.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-zinc-600 py-12">Loading archive...</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between space-y-4 shadow-md"
              >
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-600 pt-2 border-t border-zinc-900">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Anonymous
                  </span>
                  <span>
                    {new Date(msg.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}