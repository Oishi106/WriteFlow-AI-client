'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ApiError, aiApi, documentsApi, itemsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const DRAFT_TONES = [
  { label: 'Professional', value: 'Professional' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Persuasive', value: 'Persuasive' },
  { label: 'Friendly', value: 'Friendly' },
] as const;

const REWRITE_TONES = [
  { label: 'Formal', value: 'formal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Persuasive', value: 'persuasive' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Shorter', value: 'shorter' },
  { label: 'Longer', value: 'longer' },
  { label: 'Fix Grammar', value: 'fix-grammar' },
] as const;

const CHAT_SUGGESTIONS = [
  'Suggest blog post ideas',
  'Help me write an intro',
  'Review my paragraph',
];

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const extractContent = (res: unknown): string => {
  if (!res || typeof res !== 'object') return '';
  const payload = res as Record<string, unknown>;
  const data = payload.data;
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).content === 'string') {
    return (data as { content: string }).content;
  }
  return '';
};

const extractReply = (res: unknown): string => {
  if (!res || typeof res !== 'object') return '';
  const payload = res as Record<string, unknown>;
  const data = payload.data;
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).reply === 'string') {
    return (data as { reply: string }).reply;
  }
  return '';
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

const TAB_ORDER = ['draft', 'rewrite', 'chat'] as const;

function EditorBackground() {
  return (
    <div className="editor-pro-mesh" aria-hidden>
      <div className="editor-pro-grid" />
      <div className="editor-pro-blob editor-pro-blob-1" />
      <div className="editor-pro-blob editor-pro-blob-2" />
      <div className="editor-pro-blob editor-pro-blob-3" />
    </div>
  );
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="editor-pro-label">
      <span className="editor-pro-label-dot" />
      {children}
      {required && <span className="text-red-400">*</span>}
    </label>
  );
}

function PrimaryCta({
  onClick,
  disabled,
  loading,
  loadingText,
  children,
  icon: Icon = Sparkles,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className="editor-pro-cta">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          {children}
        </>
      )}
    </button>
  );
}

function ResultBox({ content }: { content: string }) {
  return <div className="editor-pro-result">{content}</div>;
}

function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="editor-pro editor-pro-shell">
      <EditorBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function EditorPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const itemId = searchParams.get('itemId');
  const docId = searchParams.get('docId');

  // Tab 1 — Content Draft
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState('');
  const [draftTone, setDraftTone] = useState<string>('Professional');
  const [audience, setAudience] = useState('');
  const [draftResult, setDraftResult] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDocumentsLink, setShowDocumentsLink] = useState(false);
  const [draftCopied, setDraftCopied] = useState(false);

  // Tab 2 — Rewrite
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteTextError, setRewriteTextError] = useState('');
  const [rewriteTone, setRewriteTone] = useState<string>('formal');
  const [rewriteResult, setRewriteResult] = useState('');
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteCopied, setRewriteCopied] = useState(false);

  // Tab 3 — Chat
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('draft');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itemId) return;
    itemsApi
      .getItemById(itemId)
      .then((res) => {
        const payload = res as Record<string, unknown>;
        const data = (payload?.data ?? payload) as Record<string, unknown>;
        const item = (data?.data ?? data) as { title?: string };
        if (item?.title) setTopic(item.title);
      })
      .catch(() => {
        // leave topic empty
      });
  }, [itemId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, chatLoading]);

  const copyText = useCallback(async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  }, [toast]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setTopicError('Topic is required');
      return;
    }
    setTopicError('');
    setDraftError('');
    setDraftLoading(true);
    setShowDocumentsLink(false);

    try {
      const res = await aiApi.generateContent({
        title: topic.trim(),
        topic: topic.trim(),
        tone: draftTone,
        audience: audience.trim(),
      });
      const content = extractContent(res);
      if (!content) throw new ApiError('No content returned from AI', 500);
      setDraftResult(content);
    } catch (err) {
      setDraftError(getErrorMessage(err));
      setDraftResult('');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!draftResult.trim()) return;
    setSaveLoading(true);
    const wordCount = countWords(draftResult);

    try {
      if (docId) {
        await documentsApi.updateDocument(docId, {
          content: draftResult,
          wordCount,
          status: 'DRAFT',
        });
      } else {
        await documentsApi.createDocument({
          title: topic.trim(),
          content: draftResult,
          status: 'DRAFT',
          wordCount,
        });
      }
      setShowDocumentsLink(true);
      toast({ title: 'Document saved!' });
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) {
      setRewriteTextError('Please paste some text to rewrite');
      return;
    }
    setRewriteTextError('');
    setRewriteError('');
    setRewriteLoading(true);

    try {
      const res = await aiApi.rewriteContent({
        text: rewriteText.trim(),
        tone: rewriteTone,
      });
      const content = extractContent(res);
      if (!content) throw new ApiError('No rewritten content returned', 500);
      setRewriteResult(content);
    } catch (err) {
      setRewriteError(getErrorMessage(err));
      setRewriteResult('');
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleSendChat = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const historyForApi = [...conversationHistory, userMessage].map((h) => ({
      role: h.role === 'ai' ? 'assistant' : 'user',
      content: h.content,
    }));

    setConversationHistory((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await aiApi.chat({ message, history: historyForApi });
      const reply = extractReply(res);
      if (!reply) throw new ApiError('No reply from assistant', 500);

      setConversationHistory((prev) => [
        ...prev,
        { role: 'ai', content: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: 'destructive' });
    } finally {
      setChatLoading(false);
    }
  };

  const tabIndex = TAB_ORDER.indexOf(activeTab as (typeof TAB_ORDER)[number]);

  if (status === 'loading') {
    return (
      <EditorLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </EditorLayout>
    );
  }

  if (!session) {
    return (
      <EditorLayout>
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="editor-pro-glass w-full max-w-md space-y-5 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <Zap className="h-7 w-7 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Please log in to use AI features</h1>
            <p className="text-sm text-slate-400">
              Sign in to generate content, rewrite text, and chat with the writing assistant.
            </p>
            <Link href="/login" className="editor-pro-cta w-full">
              <Sparkles className="h-4 w-4" />
              Log In
            </Link>
          </div>
        </div>
      </EditorLayout>
    );
  }

  return (
    <EditorLayout>
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <Link href="/dashboard" className="editor-pro-back mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Hero header */}
        <header className="editor-pro-hero mb-8">
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by WriteFlow AI
            </div>
            <h1 className="editor-pro-title">AI Content Editor</h1>
            <p className="mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Draft, rewrite, and brainstorm with three intelligent agents — built for premium content workflows.
            </p>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Pill tabs + sliding indicator */}
          <div className="editor-pro-tabs-wrap">
            <TabsList className="editor-pro-tabs">
              <TabsTrigger value="draft" className="editor-pro-tab flex-1">
                <FileText className="h-4 w-4" />
                Content Draft
              </TabsTrigger>
              <TabsTrigger value="rewrite" className="editor-pro-tab flex-1">
                <RefreshCw className="h-4 w-4" />
                Rewrite &amp; Tone
              </TabsTrigger>
              <TabsTrigger value="chat" className="editor-pro-tab flex-1">
                <MessageSquare className="h-4 w-4" />
                Chat Assistant
              </TabsTrigger>
            </TabsList>
            <div className="relative mt-3 h-0.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="editor-pro-tab-indicator top-0"
                style={{
                  width: `${100 / TAB_ORDER.length}%`,
                  transform: `translateX(${Math.max(0, tabIndex) * 100}%)`,
                }}
              />
            </div>
          </div>

          <div className="relative mt-8">
            <div className="editor-pro-card-glow" aria-hidden />

          {/* Tab 1 — Content Draft */}
          <TabsContent value="draft" className="mt-0 space-y-6 focus-visible:outline-none">
            <div className="editor-pro-glass space-y-5">
              <div>
                <FieldLabel htmlFor="topic" required>
                  Topic
                </FieldLabel>
                <input
                  id="topic"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (topicError) setTopicError('');
                  }}
                  placeholder="e.g. 10 tips for remote workers"
                  className="editor-pro-input"
                />
                {topicError && <p className="mt-1.5 text-sm text-red-400">{topicError}</p>}
              </div>

              <div>
                <FieldLabel>Tone</FieldLabel>
                <Select value={draftTone} onValueChange={setDraftTone}>
                  <SelectTrigger className="editor-pro-select border-0 shadow-none focus:ring-0">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#121a2e] text-slate-200">
                    {DRAFT_TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="focus:bg-white/10 focus:text-white">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel htmlFor="audience">Target Audience</FieldLabel>
                <input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. freelancers, marketers"
                  className="editor-pro-input"
                />
              </div>

              <PrimaryCta
                onClick={handleGenerate}
                disabled={draftLoading}
                loading={draftLoading}
                loadingText="AI is drafting your content..."
              >
                Generate Content
              </PrimaryCta>
            </div>

            {draftError && (
              <div className="editor-pro-error">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {draftError}
              </div>
            )}

            {draftResult && (
              <div className="space-y-4">
                <ResultBox content={draftResult} />
                <div className="flex flex-wrap items-center gap-3">
                  <PrimaryCta
                    onClick={handleSaveDocument}
                    disabled={saveLoading}
                    loading={saveLoading}
                    loadingText="Saving..."
                    icon={FileText}
                  >
                    Save as Document
                  </PrimaryCta>
                  <button
                    type="button"
                    className="editor-pro-ghost-btn inline-flex items-center gap-2"
                    onClick={() => copyText(draftResult, setDraftCopied)}
                  >
                    <Copy className="h-4 w-4" />
                    {draftCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  {showDocumentsLink && (
                    <Link href="/dashboard/documents" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      View in Documents →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 2 — Rewrite */}
          <TabsContent value="rewrite" className="mt-0 space-y-6 focus-visible:outline-none">
            <div className="editor-pro-glass space-y-5">
              <div>
                <FieldLabel htmlFor="rewrite-text">Paste Text</FieldLabel>
                <textarea
                  id="rewrite-text"
                  value={rewriteText}
                  onChange={(e) => {
                    setRewriteText(e.target.value);
                    if (rewriteTextError) setRewriteTextError('');
                  }}
                  rows={6}
                  placeholder="Paste your text here to rewrite it..."
                  className="editor-pro-input min-h-[160px] resize-y"
                />
                {rewriteTextError && <p className="mt-1.5 text-sm text-red-400">{rewriteTextError}</p>}
              </div>

              <div>
                <FieldLabel>Tone</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {REWRITE_TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={cn(
                        'editor-pro-tone-pill',
                        rewriteTone === t.value && 'editor-pro-tone-pill-active'
                      )}
                      onClick={() => setRewriteTone(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <PrimaryCta
                onClick={handleRewrite}
                disabled={rewriteLoading}
                loading={rewriteLoading}
                loadingText="Rewriting..."
                icon={RefreshCw}
              >
                Rewrite
              </PrimaryCta>
            </div>

            {rewriteError && (
              <div className="editor-pro-error">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {rewriteError}
              </div>
            )}

            {rewriteResult && (
              <div className="space-y-4">
                <ResultBox content={rewriteResult} />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="editor-pro-ghost-btn border border-white/10 bg-white/5"
                    onClick={() => setRewriteText(rewriteResult)}
                  >
                    Replace Original
                  </button>
                  <button
                    type="button"
                    className="editor-pro-ghost-btn inline-flex items-center gap-2"
                    onClick={() => copyText(rewriteResult, setRewriteCopied)}
                  >
                    <Copy className="h-4 w-4" />
                    {rewriteCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3 — Chat */}
          <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
            <div className="editor-pro-glass flex min-h-[38rem] flex-col overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Chat Assistant</h2>
                  <p className="text-xs text-slate-500">Ask questions, brainstorm ideas, or refine your writing</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={conversationHistory.length === 0}
                      className="editor-pro-ghost-btn disabled:opacity-40"
                    >
                      Clear Chat
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-[#121a2e] text-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => setConversationHistory([])}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div
                ref={messageListRef}
                className="flex min-h-[30rem] flex-1 flex-col gap-4 overflow-y-auto p-6"
              >
                {conversationHistory.length === 0 && !chatLoading && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/10">
                      <MessageSquare className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="max-w-md text-sm text-slate-400">
                      Hi! I&apos;m your writing assistant. Ask me anything about your content.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {CHAT_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setChatInput(s)}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {conversationHistory.map((msg, index) => (
                  <div
                    key={`${msg.timestamp.getTime()}-${index}`}
                    className={cn('flex max-w-[88%] flex-col', msg.role === 'user' ? 'ml-auto items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        msg.role === 'user' ? 'editor-pro-chat-user text-white' : 'editor-pro-chat-ai text-slate-200'
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="mt-1.5 text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-start">
                    <div className="editor-pro-chat-ai flex gap-1 rounded-2xl px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-3 border-t border-white/10 p-5">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendChat();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={chatLoading}
                  className="editor-pro-input h-12 flex-1 text-base"
                />
                <button
                  type="button"
                  onClick={() => void handleSendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  aria-label="Send message"
                  className="editor-pro-cta flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </div>
    </EditorLayout>
  );
}

function EditorPageFallback() {
  return (
    <EditorLayout>
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    </EditorLayout>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorPageFallback />}>
      <EditorPageContent />
    </Suspense>
  );
}
