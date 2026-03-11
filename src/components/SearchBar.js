'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function SearchBar({ fbos, airports }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleSearch(value) {
        setQuery(value);
        if (value.length < 2) { setResults([]); setIsOpen(false); return; }
        const q = value.toLowerCase();

        const fboResults = fbos
            .filter(f =>
                f.name.toLowerCase().includes(q) ||
                f.airportCode.toLowerCase().includes(q) ||
                f.city.toLowerCase().includes(q) ||
                f.state.toLowerCase().includes(q)
            )
            .slice(0, 6)
            .map(f => ({
                type: 'fbo',
                name: f.name,
                sub: `${f.airportCode} · ${f.city}, ${f.state}`,
                href: `/fbo/${f.slug}/`,
                icon: f.name.split(' ').map(w => w[0]).join('').slice(0, 2),
                price: f.fuelPrices?.jetA ? `$${f.fuelPrices.jetA.toFixed(2)}` : null,
            }));

        const aptResults = airports
            .filter(a =>
                a.icao.toLowerCase().includes(q) ||
                a.name.toLowerCase().includes(q) ||
                a.city.toLowerCase().includes(q)
            )
            .slice(0, 4)
            .map(a => ({
                type: 'airport',
                name: a.icao,
                sub: `${a.name} · ${a.city}, ${a.state}`,
                href: `/airport/${a.icao}/`,
                icon: '✈️',
                price: null,
            }));

        const combined = [...fboResults, ...aptResults].slice(0, 8);
        setResults(combined);
        setIsOpen(combined.length > 0 || value.length >= 2);
    }

    return (
        <div className="search-wrapper" ref={wrapperRef}>
            <input
                type="text"
                className="search-bar"
                placeholder="Search by FBO name, airport code, or city..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            />
            {isOpen && (
                <div className="search-results">
                    {results.length > 0 ? results.map((r, i) => (
                        <Link key={i} href={r.href} className="search-result-item" onClick={() => setIsOpen(false)}>
                            <div className="search-result-icon">{r.icon}</div>
                            <div className="search-result-text">
                                <div className="search-result-name">{r.name}</div>
                                <div className="search-result-sub">{r.sub}</div>
                            </div>
                            {r.price && <div className="search-result-price">{r.price}</div>}
                        </Link>
                    )) : (
                        <div className="search-no-results">No results found for &ldquo;{query}&rdquo;</div>
                    )}
                </div>
            )}
        </div>
    );
}
