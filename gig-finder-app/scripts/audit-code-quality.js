
const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'scraper', 'public', 'scripts'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css'];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (EXTENSIONS.includes(path.extname(file))) {
                arrayOfFiles.push(path.join(dirPath, "/" + file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(__dirname + '/..', []);
const largeFiles = [];
const todos = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    // Check line count
    if (lines.length > 300) {
        largeFiles.push({ file: path.relative(__dirname + '/..', file), lines: lines.length });
    }

    // Check TODOs
    lines.forEach((line, index) => {
        if (line.includes('TODO') || line.includes('FIXME')) {
            todos.push({
                file: path.relative(__dirname + '/..', file),
                line: index + 1,
                content: line.trim()
            });
        }
    });
});

console.log(`\n📂 Code Quality Audit Report\nScanning ${files.length} files...\n`);

console.log('--- 🍝 Large Files (>300 lines) ---');
if (largeFiles.length === 0) console.log('✅ No large files found.');
largeFiles.sort((a, b) => b.lines - a.lines).forEach(f => {
    console.log(`${f.lines} lines: ${f.file}`);
});

console.log('\n--- 📝 Technical Debt (TODOs/FIXMEs) ---');
if (todos.length === 0) console.log('✅ No TODOs found.');
todos.forEach(t => {
    console.log(`[${t.file}:${t.line}] ${t.content}`);
});

console.log('\n--- End of Report ---');
