require('dotenv').config({ path: '.env.production.local' });
const { Resend } = require('resend');

async function testEmailSending() {
    console.log('📧 Testing Resend Email Configuration...\n');

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('❌ FATAL: RESEND_API_KEY is missing from .env.production.local');
        return;
    }

    console.log(`✅ API Key found: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log(`✅ Sender Address: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);

    const resend = new Resend(apiKey);
    const testEmail = 'delivered@resend.dev'; // Resend's test sink address

    console.log(`\nAttempting to send test email to ${testEmail}...`);

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: testEmail,
            subject: 'GigFinder Email Test',
            html: '<h1>If you can read this, email sending is working!</h1><p>Checking configuration...</p>'
        });

        if (error) {
            console.error('\n❌ RESEND API ERROR:');
            console.error(error);
        } else {
            console.log('\n✅ SUCCESS! Email sent via Resend API.');
            console.log('   ID:', data.id);
            console.log('\nIf this worked but you aren\'t receiving ticket emails:');
            console.log('1. Check if the production environment variables match these');
            console.log('2. Check if your real email address requires a verified domain to send TO');
            console.log('   (onboarding@resend.dev can only send to the dashboard email unless domain is verified)');
        }

    } catch (err) {
        console.error('\n❌ UNEXPECTED ERROR:');
        console.error(err);
    }
}

testEmailSending().catch(console.error);
