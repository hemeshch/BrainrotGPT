document.addEventListener('DOMContentLoaded', () => {
	const openChatGPTBtn = document.getElementById('open-chatgpt')
	const openClaudeBtn = document.getElementById('open-claude')

	if (openChatGPTBtn) {
		openChatGPTBtn.addEventListener('click', () => {
			chrome.tabs.create({ url: 'https://chatgpt.com/?model=gpt-5-thinking' })
		})
	}

	if (openClaudeBtn) {
		openClaudeBtn.addEventListener('click', () => {
			chrome.tabs.create({ url: 'https://claude.ai' })
		})
	}
})
