'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ResultsList } from './ResultsList';

export function ResultsMounter() {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = document.getElementById('react-results-root');
        if (el) {
            setMountNode(el);
        }
    }, []);

    if (!mountNode) return null;

    return createPortal(<ResultsList />, mountNode);
}
