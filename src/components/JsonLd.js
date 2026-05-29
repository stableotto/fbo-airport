// Renders one or more schema.org JSON-LD blocks.
// `data` may be a single object or an array of objects.
export default function JsonLd({ data }) {
    const blocks = Array.isArray(data) ? data : [data];
    return (
        <>
            {blocks.filter(Boolean).map((block, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
                />
            ))}
        </>
    );
}
