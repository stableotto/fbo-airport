'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheapestJetAStatesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/cheapest-jet-a/');
    }, [router]);

    return null;
}
