// Background script to handle extension install/update events
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome page only on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});