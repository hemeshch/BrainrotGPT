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

        // Send message to content scripts
        const tabs = await chrome.tabs.query({ url: ['https://chat.openai.com/*', 'https://chatgpt.com/*'] });
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggleVideos',
                enabled: enabled
            }).catch(() => {
                // Ignore errors for tabs where content script isn't loaded
            });
        });
    });

    function updateStatus(enabled) {
        toggleText.textContent = enabled ? 'BRAINROT ACTIVATED' : 'BRAINROT INACTIVE';
        status.textContent = enabled ? '*** VIDEOS ENABLED ***' : '*** VIDEOS DISABLED ***';
        status.style.color = enabled ? '#00ff00' : '#ff0000';
    }
});