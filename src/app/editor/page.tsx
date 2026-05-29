'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Sparkles, RefreshCw, MessageSquare, Send, Copy, Download, ChevronDown } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AgentTab = 'draft' | 'rewrite' | 'chat';

const TONES = ['professional', 'casual', 'formal', 'friendly', 'persuasive'];
const CONTENT_TYPES = [
  { value: 'blog', label: '✍️ Blog Post' },
  { value: 'social', label: '📱 Social Caption' },
  { value: 'email', label: '📧 Email' },
  { value: 'ad-copy', label: '📢 Ad Copy' },
];
const REWRITE_ACTIONS = [
  { value: 'rewrite', label: 'Rewrite in new tone' },
  { value: 'shorten', label: 'Shorten (50%)' },
  { value: 'expand', label: 'Expand (2×)' },
  { value: 'fix-grammar', label: 'Fix Grammar' },
  { value: 'improve-clarity', label: 'Improve Clarity' },
];

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<AgentTab>('draft');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Agent 1 state
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [draftResult, setDraftResult] = useState<{ title?: string; content?: string; metaDescription?: string; tags?: string[] } | null>(null);

  // Agent 2 state
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteTone, setRewriteTone] = useState('formal');
  const [rewriteAction, setRewriteAction] = useState('rewrite');
  const [rewriteResult, setRewriteResult] = useState('');

  // Agent 3 state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [docContext, setDocContext] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleDraft = async () => {
    if (!topic.trim()) { toast({ title: 'Topic required', description: 'Enter a topic for your content.', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data } = await aiApi.generate({ topic, tone, targetAudience: audience || 'general', contentType });
      setDraftResult(data.data);
      toast({ title: 'Content generated!', description: 'Your draft is ready to edit.' });
    } catch {
      toast({ title: 'Generation failed', description: 'Please try again.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleRewrite = async () => {
    if (!rewriteInput.trim()) { toast({ title: 'Content required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data } = await aiApi.rewrite({ content: rewriteInput, tone: rewriteTone, action: rewriteAction });
      setRewriteResult(data.data.rewrittenContent);
      toast({ title: 'Content rewritten!' });
    } catch {
      toast({ title: 'Rewrite failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setLoading(true);
    try {
      const { data } = await aiApi.chat({ messages: newMessages, documentContext: docContext });
      setMessages([...newMessages, { role: 'model', content: data.data.response }]);
    } catch {
      toast({ title: 'Chat failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">AI Content Editor</h1>
          <p className="text-muted-foreground">Three powerful AI agents to help you write, rewrite, and brainstorm.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
          {([
            { id: 'draft', label: '✨ Draft Agent', icon: Sparkles },
            { id: 'rewrite', label: '🔄 Rewrite Agent', icon: RefreshCw },
            { id: 'chat', label: '💬 Chat Assistant', icon: MessageSquare },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn('px-5 py-2.5 rounded-lg text-sm font-medium transition-all', activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Agent 1: Content Draft */}
        {activeTab === 'draft' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Configure your content</h2>
              <div>
                <label className="text-sm font-medium block mb-1.5">Content Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button key={ct.value} onClick={() => setContentType(ct.value)} className={cn('py-2 px-3 rounded-lg border text-sm font-medium transition-all', contentType === ct.value ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border hover:bg-muted')}>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Topic *</label>
                <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3} placeholder="e.g. How to use AI for content marketing in 2025" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Target Audience</label>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="e.g. Marketers, Devs" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <button onClick={handleDraft} disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate Content</>}
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              {draftResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Generated Content</h2>
                    <button onClick={() => copyToClipboard(`${draftResult.title}\n\n${draftResult.content}`)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" /> Copy all
                    </button>
                  </div>
                  {draftResult.title && <div className="p-3 bg-brand-500/5 border border-brand-500/20 rounded-xl"><p className="text-xs text-brand-500 font-medium mb-1">Title</p><p className="font-semibold text-sm">{draftResult.title}</p></div>}
                  {draftResult.metaDescription && <div className="p-3 bg-muted rounded-xl"><p className="text-xs text-muted-foreground font-medium mb-1">Meta Description</p><p className="text-sm">{draftResult.metaDescription}</p></div>}
                  {draftResult.tags && <div className="flex flex-wrap gap-2">{draftResult.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-xs rounded-full">#{tag}</span>)}</div>}
                  <div className="border-t border-border pt-4 max-h-64 overflow-y-auto">
                    <p className="text-xs text-muted-foreground font-medium mb-2">Content</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{draftResult.content}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="w-10 h-10 text-brand-500/30 mb-4" />
                  <p className="text-muted-foreground">Your generated content will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent 2: Rewrite */}
        {activeTab === 'rewrite' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">Rewrite & Tone Agent</h2>
              <div>
                <label className="text-sm font-medium block mb-1.5">Your Text *</label>
                <textarea value={rewriteInput} onChange={e => setRewriteInput(e.target.value)} rows={8} placeholder="Paste the text you want to rewrite..." className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none" />
                <p className="text-xs text-muted-foreground mt-1">{rewriteInput.length}/5000 characters</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Action</label>
                  <select value={rewriteAction} onChange={e => setRewriteAction(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {REWRITE_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Tone</label>
                  <select value={rewriteTone} onChange={e => setRewriteTone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleRewrite} disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Rewriting...</> : <><RefreshCw className="w-4 h-4" />Rewrite Now</>}
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              {rewriteResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Rewritten Content</h2>
                    <button onClick={() => copyToClipboard(rewriteResult)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  </div>
                  <div className="p-4 bg-muted rounded-xl max-h-96 overflow-y-auto">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{rewriteResult}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <RefreshCw className="w-10 h-10 text-brand-500/30 mb-4" />
                  <p className="text-muted-foreground">Rewritten content will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agent 3: Chat */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl flex flex-col h-[600px]">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-500" />
                <h2 className="font-semibold">AI Writing Assistant</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-brand-500/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Ask me anything about writing, brainstorming, or improving your content.</p>
                    <div className="mt-4 grid grid-cols-1 gap-2 max-w-xs mx-auto">
                      {['Give me 5 blog post ideas about AI', 'How do I write a compelling headline?', 'Create an outline for an article about climate change'].map(s => (
                        <button key={s} onClick={() => setChatInput(s)} className="text-xs text-left px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'bg-brand-500 text-white' : 'bg-muted text-foreground')}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-3 rounded-2xl">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                    placeholder="Ask anything about writing..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button onClick={handleChat} disabled={loading || !chatInput.trim()} className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors disabled:opacity-60">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-sm">Document Context (Optional)</h3>
              <p className="text-xs text-muted-foreground mb-3">Paste your current document text so the assistant can give contextual advice.</p>
              <textarea
                value={docContext}
                onChange={e => setDocContext(e.target.value)}
                rows={10}
                placeholder="Paste your document content here..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">{docContext.length}/500 characters used</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
