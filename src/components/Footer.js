import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-brand-name">FBO Airport</div>
                        <p>The comprehensive directory of Fixed Base Operators across the United States. Find FBO services, fuel prices, and amenities at airports nationwide.</p>
                    </div>
                    <div className="footer-links-group">
                        <h4>Browse</h4>
                        <Link href="/states/">All States</Link>
                        <Link href="/state/california/">California</Link>
                        <Link href="/state/texas/">Texas</Link>
                        <Link href="/state/florida/">Florida</Link>
                    </div>
                    <div className="footer-links-group">
                        <h4>Company</h4>
                        <Link href="/about/">About</Link>
                        <a href="mailto:hello@fboairport.com">Contact</a>
                        <Link href="/privacy/">Privacy Policy</Link>
                    </div>
                    <div className="footer-links-group">
                        <h4>For FBOs</h4>
                        <a href="mailto:listings@fboairport.com">Claim Your Listing</a>
                        <a href="mailto:advertise@fboairport.com">Advertise</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} FBOAirport.com — All rights reserved. Not affiliated with the FAA.
                </div>
            </div>
        </footer>
    );
}
