async function testUrl() {
    const prompt = "coloring page of a cat, simple black lines, white background";
    const encodedPrompt = encodeURIComponent(prompt);

    const variations = [
        { name: "Minimal", url: `https://image.pollinations.ai/prompt/${encodedPrompt}` },
        { name: "With Seed", url: `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=123` },
        { name: "With NoLogo", url: `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true` },
        { name: "With Turbo", url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo` },
        { name: "Standard (Prev)", url: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true&seed=123` },
    ];

    console.log("Starting URL tests...");

    for (const v of variations) {
        console.log(`\nTesting: ${v.name}`);
        console.log(`URL: ${v.url}`);
        try {
            const response = await fetch(v.url);
            console.log(`Status: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                console.log(`Success! Content Length: ${buffer.byteLength}`);
            } else {
                console.log("Failed.");
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

testUrl();
