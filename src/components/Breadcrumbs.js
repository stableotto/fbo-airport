import Link from 'next/link';

export default function Breadcrumbs({ items }) {
    return (
        <div className="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>
                    {i > 0 && <span className="separator"> › </span>}
                    {item.href ? (
                        <Link href={item.href}>{item.label}</Link>
                    ) : (
                        <span>{item.label}</span>
                    )}
                </span>
            ))}
        </div>
    );
}
