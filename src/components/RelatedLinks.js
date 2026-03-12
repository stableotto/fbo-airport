import Link from 'next/link';

export default function RelatedLinks({ links, title = "Related Pages" }) {
    if (!links || links.length === 0) return null;

    return (
        <div className="related-links">
            <h3>{title}</h3>
            <div className="related-links-grid">
                {links.map((link, idx) => (
                    <Link key={idx} href={link.href} className="related-link-card">
                        <span className="related-link-label">{link.label}</span>
                        <span className="related-link-title">{link.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
