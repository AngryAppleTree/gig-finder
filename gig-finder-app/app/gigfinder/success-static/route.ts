import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gig Added - GigFinder</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <!-- Inline styles/critical CSS since we are bypassing layout -->
    <style>
        :root {
            --color-bg: #0a0a0a;
            --color-surface: #1a1a1a;
            --color-primary: #ff3366;
            --color-secondary: #00ff88;
            --color-text: #ffffff;
            --color-border: #333333;
        }
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--color-bg); color: var(--color-text); min-height: 100vh; font-family: 'Inter', sans-serif; }
        .main-title { position: absolute; top: 1rem; left: 1rem; font-size: 3rem; margin: 0; font-family: 'Permanent Marker', cursive; padding-left: 20px;}
        .success-box { background: var(--color-surface); padding: 3rem 2rem; border: 3px solid var(--color-border); box-shadow: 8px 8px 0 var(--color-secondary); text-align: center; max-width: 600px; margin: 20px;}
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h2 { font-family: 'Permanent Marker', cursive; font-size: 2.5rem; margin-bottom: 1rem; color: #fff; text-transform: uppercase; }
        p { font-size: 1.2rem; line-height: 1.6; margin-bottom: 2rem; }
        .btn-primary { display: inline-block; text-decoration: none; font-size: 1.2rem; padding: 1rem 2rem; background: var(--color-primary); color: #000; font-family: 'Permanent Marker', cursive; border: 2px solid #fff; margin-bottom: 1rem; transition: transform 0.2s;}
        .btn-primary:hover { transform: scale(1.05); }
        .btn-back { color: #fff; text-decoration: none; display: block; margin-top: 1rem; }
        .btn-back:hover { text-decoration: underline; }
        @media(max-width: 600px) { .main-title { font-size: 2rem; position: relative; top: auto; left: auto; margin-bottom: 2rem; } }
    </style>
</head>
<body>
    <h1 class="main-title">GIG<br>FINDER</h1>
    
    <div class="success-box">
        <div class="icon">🤘</div>
        <h2>NICE ONE!</h2>
        <p>Your gig has been added to the database.<br>It's now live for everyone to find.</p>
        
        <a href="/gigfinder/add-event" class="btn-primary">ADD ANOTHER GIG +</a>
        <a href="/gigfinder" class="btn-back">← Back to Finder</a>
    </div>
</body>
</html>
    `;

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}
