'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QuickSearch } from './QuickSearch';

export function SearchMounter() {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = document.getElementById('quick-search-mount');
        if (el) {
            setMountNode(el);
        }
    }, []);

    if (!mountNode) return null;

    return createPortal(<QuickSearch />, mountNode);
}
