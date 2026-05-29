'use client';

import { useEffect, useState } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnjrrven';

// Keys double as ?topic= values used by the CTA links across the site.
const TOPICS = {
    general: 'General inquiry',
    price: 'Report a fuel price',
    listing: 'Claim or update an FBO listing',
    advertise: 'Advertise / partnership',
    privacy: 'Privacy question',
};

const PLACEHOLDERS = {
    general: 'How can we help?',
    price: 'Which FBO/airport, the fuel type, and the current price you saw…',
    listing: 'Tell us which FBO you manage and what you’d like to update.',
    advertise: 'Tell us a bit about what you’d like to promote.',
    privacy: 'Your privacy-related question or request…',
};

export default function ContactForm() {
    const [topic, setTopic] = useState('general');
    const [reference, setReference] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [error, setError] = useState('');

    // Preselect the reason and capture page context from the URL (?topic=, ?ref=).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('topic');
        if (t && TOPICS[t]) setTopic(t);
        const r = params.get('ref');
        if (r) setReference(r);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus('submitting');
        setError('');
        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                setStatus('success');
                form.reset();
            } else {
                const json = await res.json().catch(() => ({}));
                setError(
                    (json.errors && json.errors.map(x => x.message).join(', ')) ||
                        'Something went wrong sending your message. Please try again.'
                );
                setStatus('error');
            }
        } catch {
            setError('Network error — please check your connection and try again.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="contact-success card">
                <h2>Message sent</h2>
                <p>Thanks for reaching out — we’ve received your message and will reply by email.</p>
            </div>
        );
    }

    return (
        <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label htmlFor="cf-name">Name</label>
                <input id="cf-name" name="name" type="text" required autoComplete="name" placeholder="Your name" />
            </div>

            <div className="form-row">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </div>

            <div className="form-row">
                <label htmlFor="cf-topic">Reason for contact</label>
                <select id="cf-topic" value={topic} onChange={e => setTopic(e.target.value)}>
                    {Object.entries(TOPICS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="form-row">
                <label htmlFor="cf-message">Message</label>
                <textarea id="cf-message" name="message" rows={6} required placeholder={PLACEHOLDERS[topic]} />
            </div>

            {/* Hidden context + spam honeypot for Formspree */}
            <input type="hidden" name="topic" value={TOPICS[topic]} />
            {reference && <input type="hidden" name="reference" value={reference} />}
            <input type="hidden" name="_subject" value={`FBO Airport contact — ${TOPICS[topic]}${reference ? ` (${reference})` : ''}`} />
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />

            {status === 'error' && <p className="form-error">{error}</p>}

            <button type="submit" className="btn" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send message'}
            </button>
        </form>
    );
}
