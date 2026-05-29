import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from '@/components/ContactForm';

export const metadata = {
    title: 'Contact FBO Airport',
    description: 'Get in touch with FBO Airport — report a fuel price, claim an FBO listing, ask about advertising, or send a general question.',
    alternates: { canonical: '/contact/' },
    openGraph: { title: 'Contact FBO Airport', description: 'Report a fuel price, claim a listing, or get in touch.', url: '/contact/', type: 'website' },
};

export default function ContactPage() {
    return (
        <div className="page-content">
            <div className="container container--narrow">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
                <h1 style={{ fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>Contact us</h1>
                <p style={{ maxWidth: 640, marginBottom: 'var(--space-xl)' }}>
                    Fuel price corrections, FBO listing claims, advertising, or a general question —
                    send us a note and we’ll get back to you by email.
                </p>
                <ContactForm />
            </div>
        </div>
    );
}
