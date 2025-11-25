async function testSimplePrompt() {
    // Test with the absolute simplest prompt possible
    const testPrompts = [
        "cat",
        "dog",
        "tree",
        "coloring page",
        "simple drawing"
    ];

    for (const prompt of testPrompts) {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        console.log(`\nTesting: "${prompt}"`);
        console.log(`URL: ${url}`);

        try {
            const response = await fetch(url);
            console.log(`Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                console.log(`✓ Success! Size: ${buffer.byteLength} bytes`);
            } else {
                console.log(`✗ Failed`);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

testSimplePrompt();
