'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Sparkles } from 'lucide-react';
import { itemsApi, aiApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  usageCount: number;
  tone?: string;
  estimatedWordCount?: number;
  prompt?: string;
  sampleOutput?: string;
}

const CATEGORIES = ['blog', 'social', 'email', 'ad-copy'];
const TONES = ['professional', 'casual', 'formal', 'friendly', 'persuasive'];

const emptyForm = { title: '', description: '', category: 'blog', tone: 'professional', estimatedWordCount: 500, prompt: '', sampleOutput: '' };

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [genDesc, setGenDesc] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await itemsApi.getAll({ page, limit: 10 });
      setTemplates(data.data);
      setMeta(data.meta);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, category: t.category, tone: t.tone || 'professional', estimatedWordCount: t.estimatedWordCount || 500, prompt: t.prompt || '', sampleOutput: t.sampleOutput || '' });
    setShowModal(true);
  };

  const handleGenerateDesc = async () => {
    if (!form.title) { toast({ title: 'Enter a title first', variant: 'destructive' }); return; }
    setGenDesc(true);
    try {
      const { data } = await aiApi.generateDescription({ title: form.title, category: form.category });
      setForm(f => ({ ...f, description: data.data.description }));
      toast({ title: 'Description generated!' });
    } catch { toast({ title: 'Generation failed', variant: 'destructive' }); }
    finally { setGenDesc(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { toast({ title: 'Title and description are required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await itemsApi.update(editing._id, form);
        toast({ title: 'Template updated!' });
      } else {
        await itemsApi.create(form);
        toast({ title: 'Template created!' });
      }
      setShowModal(false);
      fetchTemplates();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await itemsApi.delete(id);
      toast({ title: 'Template deleted.' });
      fetchTemplates();
    } catch { toast({ title: 'Delete failed', variant: 'destructive' }); }
  };

  const catColors: Record<string, string> = {
    blog: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    social: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    email: 'bg-green-500/10 text-green-600 dark:text-green-400',
    'ad-copy': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">{meta?.total ?? 0} templates on the platform.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors w-fit">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Template', 'Category', 'Rating', 'Uses', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : templates.map(t => (
                <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${catColors[t.category]}`}>{t.category}</span>
                  </td>
                  <td className="px-5 py-4 text-sm">⭐ {t.rating.toFixed(1)}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{t.usageCount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t._id, t.title)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Page {page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-bold text-lg">{editing ? 'Edit Template' : 'Create New Template'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. SEO Blog Post Generator" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Description *</label>
                  <button onClick={handleGenerateDesc} disabled={genDesc} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium disabled:opacity-60">
                    {genDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI Generate
                  </button>
                </div>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What does this template do?" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Tone</label>
                  <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Estimated Word Count</label>
                <input type="number" value={form.estimatedWordCount} onChange={e => setForm(f => ({ ...f, estimatedWordCount: Number(e.target.value) }))} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">AI Prompt (Optional)</label>
                <textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} rows={2} placeholder="Custom prompt instructions for this template..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Sample Output (Optional)</label>
                <textarea value={form.sampleOutput} onChange={e => setForm(f => ({ ...f, sampleOutput: e.target.value }))} rows={2} placeholder="Example of what the AI generates..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : editing ? 'Update Template' : 'Create Template'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
