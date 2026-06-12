import JsonLd from './JsonLd';
import { faqPage } from '@/lib/structured-data';

// Visible, crawlable FAQ rendered with native <details> (no client JS). The same Q&A is
// emitted as FAQPage JSON-LD so AI answer engines can lift it. Visible text and markup
// are kept identical, per Google's FAQ guidelines.
export default function FAQ({ items, heading = 'Frequently Asked Questions' }) {
    const valid = (items || []).filter(it => it && it.q && it.a);
    if (!valid.length) return null;

    return (
        <section className="faq" style={{ marginTop: 'var(--space-2xl)' }}>
            <JsonLd data={faqPage(valid)} />
            <h2>{heading}</h2>
            <div className="faq-list">
                {valid.map((it, i) => (
                    <details key={i} className="faq-item" {...(i === 0 ? { open: true } : {})}>
                        <summary>{it.q}</summary>
                        <div className="faq-answer">{it.a}</div>
                    </details>
                ))}
            </div>
        </section>
    );
}
