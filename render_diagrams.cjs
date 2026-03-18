const fs = require('fs');
const https = require('https');
const path = require('path');

const umlFile = path.resolve('docs/UML_DIAGRAMS.md');
const timelineFile = path.resolve('docs/timeline.mmd');
const outputDir = path.resolve('diagrams');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function processDiagram(code, type, filename) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            diagram_source: code,
            diagram_type: type,
            output_format: 'png'
        });

        const req = https.request('https://kroki.io', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'User-Agent': 'MealMate-Automated-Script'
            }
        }, (res) => {
            if (res.statusCode !== 200) {
                res.on('data', d => console.error(d.toString()));
                return reject(`Failed with status ${res.statusCode} on ${filename}`);
            }
            const outputPath = path.join(outputDir, filename);
            const f = fs.createWriteStream(outputPath);
            res.pipe(f);
            f.on('finish', () => {
                console.log(`Saved: ${outputPath}`);
                resolve();
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    // 1. Process PlantUML blocks in UML_DIAGRAMS.md
    const umlText = fs.readFileSync(umlFile, 'utf8');
    const plantUmlRegex = /```plantuml\r?\n([\s\S]*?)\r?\n```/g;
    
    let match;
    let count = 0;
    const umlNames = ['use_case_diagram.png', 'component_diagram.png'];
    
    while ((match = plantUmlRegex.exec(umlText)) !== null) {
        if (count < umlNames.length) {
            console.log(`Rendering ${umlNames[count]}...`);
            await processDiagram(match[1], 'plantuml', umlNames[count]);
            count++;
        }
    }

    // 2. Process Timeline (Mermaid)
    console.log(`Rendering timeline.png...`);
    const timelineText = fs.readFileSync(timelineFile, 'utf8');
    await processDiagram(timelineText, 'mermaid', 'timeline.png');

    console.log("All diagram rendering completed.");
}

main().catch(console.error);
