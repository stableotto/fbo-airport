'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelfServeFuelStatesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/self-serve-fuel/');
    }, [router]);

    return null;
}
