'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Cheapest100LLStatesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/cheapest-100ll/');
    }, [router]);

    return null;
}
