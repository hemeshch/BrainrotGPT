document.addEventListener('DOMContentLoaded', async () => {
    const toggle = document.getElementById('video-toggle');
    const status = document.getElementById('status');
    const toggleText = document.getElementById('toggle-text');

    // Load saved state
    const result = await chrome.storage.sync.get(['videosEnabled']);
    const isEnabled = result.videosEnabled !== false; // Default to true
    toggle.checked = isEnabled;
    updateStatus(isEnabled);

    // Handle toggle change
    toggle.addEventListener('change', async (e) => {
        const enabled = e.target.checked;

        // Save to storage
        await chrome.storage.sync.set({ videosEnabled: enabled });

        // Update status text
        updateStatus(enabled);

        // Get all tabs with ChatGPT or Claude
        const tabs = await chrome.tabs.query({ url: ['https://chat.openai.com/*', 'https://chatgpt.com/*', 'https://claude.ai/*'] });

        // Reload all matching tabs
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });

        // Close the popup after triggering reload
        if (tabs.length > 0) {
            setTimeout(() => {
                window.close();
            }, 100);
        }
    });

    function updateStatus(enabled) {
        toggleText.textContent = enabled ? 'BRAINROT ACTIVATED' : 'BRAINROT INACTIVE';
        status.textContent = enabled ? '*** VIDEOS ENABLED ***' : '*** VIDEOS DISABLED ***';
        status.style.color = enabled ? '#00ff00' : '#ff0000';
    }
});