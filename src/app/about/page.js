import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
    title: 'About FBO Airport',
    description: 'FBO Airport is the comprehensive directory of Fixed Base Operators across the United States.',
};

export default function AboutPage() {
    return (
        <div className="page-content">
            <div className="container" style={{ maxWidth: '720px' }}>
                <Breadcrumbs items={[
                    { label: 'Home', href: '/' },
                    { label: 'About' },
                ]} />
                <h1 style={{ fontStyle: 'italic', marginBottom: 'var(--space-lg)' }}>About FBO Airport</h1>
                <div className="detail-section">
                    <p>FBO Airport is the most comprehensive directory of Fixed Base Operators (FBOs) in the United States. We help pilots, aircraft owners, and flight departments find the right FBO services at any airport nationwide.</p>
                </div>
                <div className="detail-section">
                    <h2>What is an FBO?</h2>
                    <p>A Fixed Base Operator (FBO) is a commercial business that provides aeronautical services such as fueling, hangaring, tie-down and parking, aircraft rental, aircraft maintenance, and flight instruction. FBOs are the primary gateway for general aviation at airports across the country.</p>
                </div>
                <div className="detail-section">
                    <h2>For FBO Owners</h2>
                    <p>If you own or manage an FBO, you can claim your listing to update your information, add photos, and manage your online presence. Contact us at <a href="mailto:listings@fboairport.com" style={{ color: 'var(--color-accent)' }}>listings@fboairport.com</a>.</p>
                </div>
            </div>
        </div>
    );
}
