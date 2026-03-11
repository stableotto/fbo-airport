import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'Privacy Policy',
    description: 'FBO Airport privacy policy.',
};

export default function PrivacyPage() {
    return (
        <div className="page-content">
            <div className="container" style={{ maxWidth: '720px' }}>
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
                <h1 style={{ fontStyle: 'italic', marginBottom: 'var(--space-lg)' }}>Privacy Policy</h1>
                <div className="detail-section">
                    <p>FBO Airport respects your privacy. We collect only anonymous analytics data to improve our service. We do not sell or share personal information with third parties. For questions, contact <a href="mailto:privacy@fboairport.com" style={{ color: 'var(--color-accent)' }}>privacy@fboairport.com</a>.</p>
                </div>
            </div>
        </div>
    );
}
