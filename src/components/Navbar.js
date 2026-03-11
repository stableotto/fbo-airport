'use client';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container">
                <Link href="/" className="nav-logo">
                    <span className="nav-logo-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16V8C21 7.45 20.55 7 20 7H4C3.45 7 3 7.45 3 8V16C3 16.55 3.45 17 4 17H20C20.55 17 21 16.55 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 3L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
                            <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
                        </svg>
                    </span>
                    FBO Airport
                </Link>
                <div className="nav-links">
                    <Link href="/">Leaderboard</Link>
                    <Link href="/states/">By State</Link>
                    <Link href="/about/">About</Link>
                </div>
            </div>
        </nav>
    );
}

