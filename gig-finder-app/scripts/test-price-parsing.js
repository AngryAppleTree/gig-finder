
const prices = ["£10.00", "15.00", "Free", "£5 adv"];

prices.forEach(p => {
    const val = parseFloat(p) || 0;
    const fixedVal = parseFloat(p?.replace(/[^\d.]/g, '')) || 0;
    console.log(`Original: "${p}" -> Parsed: ${val} -> Fixed: ${fixedVal}`);
});
