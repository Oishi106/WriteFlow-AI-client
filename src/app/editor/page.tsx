'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
} from 'lucide-react';
import { ApiError, aiApi, documentsApi, itemsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const getErrorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

function ResultBox({ content }: { content: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
      {content}
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-md w-full space-y-4">
          <h1 className="font-display text-xl font-bold">Please log in to use AI features</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to generate content, rewrite text, and chat with the writing assistant.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">AI Content Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Draft, rewrite, and brainstorm with three AI agents.
          </p>
        </div>

        <Tabs defaultValue="draft" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="draft" className="gap-2">
              <FileText className="w-4 h-4" />
              Content Draft
            </TabsTrigger>
            <TabsTrigger value="rewrite" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Rewrite &amp; Tone
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat Assistant
            </TabsTrigger>
          </TabsList>

          {/* Tab 1 — Content Draft */}
          <TabsContent value="draft" className="space-y-6 mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-1.5">
                  Topic <span className="text-destructive">*</span>
                </label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (topicError) setTopicError('');
                  }}
                  placeholder="e.g. 10 tips for remote workers"
                />
                {topicError && (
                  <p className="text-destructive text-sm mt-1">{topicError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Tone</label>
                <Select value={draftTone} onValueChange={setDraftTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRAFT_TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="audience" className="block text-sm font-medium mb-1.5">
                  Target Audience
                </label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. freelancers, marketers"
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={draftLoading}
                className="w-full sm:w-auto"
              >
                {draftLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is drafting your content...
                  </>
                ) : (
                  'Generate Content'
                )}
              </Button>
            </div>

            {draftError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {draftError}
              </div>
            )}

            {draftResult && (
              <div className="space-y-4">
                <ResultBox content={draftResult} />
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleSaveDocument} disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save as Document'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyText(draftResult, setDraftCopied)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {draftCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                  {showDocumentsLink && (
                    <Link
                      href="/dashboard/documents"
                      className="text-sm text-brand-500 hover:underline font-medium"
                    >
                      View in Documents →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 2 — Rewrite */}
          <TabsContent value="rewrite" className="space-y-6 mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label htmlFor="rewrite-text" className="block text-sm font-medium mb-1.5">
                  Paste Text
                </label>
                <textarea
                  id="rewrite-text"
                  value={rewriteText}
                  onChange={(e) => {
                    setRewriteText(e.target.value);
                    if (rewriteTextError) setRewriteTextError('');
                  }}
                  rows={6}
                  placeholder="Paste your text here to rewrite it..."
                  className={cn(
                    'flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                    'ring-offset-background placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'resize-y'
                  )}
                />
                {rewriteTextError && (
                  <p className="text-destructive text-sm mt-1">{rewriteTextError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {REWRITE_TONES.map((t) => (
                    <Button
                      key={t.value}
                      type="button"
                      size="sm"
                      variant={rewriteTone === t.value ? 'default' : 'outline'}
                      onClick={() => setRewriteTone(t.value)}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleRewrite}
                disabled={rewriteLoading}
                className="w-full sm:w-auto"
              >
                {rewriteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  'Rewrite'
                )}
              </Button>
            </div>

            {rewriteError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {rewriteError}
              </div>
            )}

            {rewriteResult && (
              <div className="space-y-4">
                <ResultBox content={rewriteResult} />
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setRewriteText(rewriteResult)}
                  >
                    Replace Original
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyText(rewriteResult, setRewriteCopied)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {rewriteCopied ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3 — Chat */}
          <TabsContent value="chat" className="mt-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-sm">Chat Assistant</h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={conversationHistory.length === 0}>
                      Clear Chat
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setConversationHistory([])}>
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div
                ref={messageListRef}
                className="flex flex-col gap-3 min-h-64 max-h-96 overflow-y-auto p-4"
              >
                {conversationHistory.length === 0 && !chatLoading && (
                  <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Hi! I&apos;m your writing assistant. Ask me anything about your content.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {CHAT_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setChatInput(s)}
                          className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors"
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
                    className={cn('flex flex-col max-w-[85%]', msg.role === 'user' ? 'ml-auto items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 text-sm',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-start">
                    <div className="bg-muted rounded-lg px-4 py-3 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Input
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
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => void handleSendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EditorPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorPageFallback />}>
      <EditorPageContent />
    </Suspense>
  );
}
