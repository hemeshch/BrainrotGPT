document.addEventListener('DOMContentLoaded', () => {
	const openChatGPTBtn = document.getElementById('open-chatgpt')

	if (openChatGPTBtn) {
		openChatGPTBtn.addEventListener('click', () => {
			chrome.tabs.create({ url: 'https://chatgpt.com/?model=gpt-5-thinking' })
		})
	}
})
