'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSection() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !/\S+@\S+\.\S+/.test(email)) {
			setStatus('error');
			return;
		}
		setStatus('loading');
		await new Promise((r) => setTimeout(r, 1000));
		setStatus('success');
		setEmail('');
	};

	return (
		<section className="py-24 bg-background">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<div className="p-10 rounded-3xl bg-gradient-to-br from-brand-500/10 via-brand-600/5 to-transparent border border-brand-500/20">
					<Mail className="w-10 h-10 text-brand-500 mx-auto mb-4" />
					<h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
						Get writing tips <span className="gradient-text">in your inbox</span>
					</h2>
					<p className="text-muted-foreground mb-8">Join 5,000+ writers getting weekly AI writing strategies and template drops.</p>

					{status === 'success' ? (
						<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 font-medium">
							You&apos;re in! Check your inbox for a welcome email.
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="your@email.com"
								className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
							/>
							<button
								type="submit"
								disabled={status === 'loading'}
								className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
							>
								{status === 'loading' ? 'Subscribing...' : 'Subscribe'}
							</button>
						</form>
					)}
					{status === 'error' && (
						<p className="text-red-500 text-sm mt-2">Please enter a valid email address.</p>
					)}
					<p className="text-muted-foreground text-xs mt-4">No spam. Unsubscribe anytime.</p>
				</div>
			</div>
		</section>
	);
}