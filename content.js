// Card container - matches both thinking and streaming states
const CONTAINER_SELECTOR = 'article[data-testid^="conversation-turn"], .flex.w-full.items-start.justify-between.text-start.flex-col'
const DATA_HOLDER_ATTR = 'data-thinking-video-holder'

// Brainrot video collection
const BRAINROT_VIDEOS = ['img/vids/ai-baby-fruits.mp4', 'img/vids/italian-brainrot-baby.mp4', 'img/vids/italian-brainrot.mp4', 'img/vids/subway-surfers.mp4', 'img/vids/67.mp4', 'img/vids/drippy.mp4']

// Track recently played videos to avoid repeats
let recentVideos = []
const MAX_RECENT = Math.min(3, BRAINROT_VIDEOS.length - 1) // Remember last 3 videos, but never more than total-1

// Mute state persistence
let isMuted = localStorage.getItem('brainrot-muted') === 'true'

// Videos enabled state
let videosEnabled = true

// Load videos enabled state
chrome.storage.sync.get(['videosEnabled'], (result) => {
	videosEnabled = result.videosEnabled !== false // Default to true
	if (!videosEnabled) {
		// Remove any existing videos if they're disabled
		document.querySelectorAll(`div[${DATA_HOLDER_ATTR}]`).forEach(holder => {
			holder.parentNode?.removeChild(holder)
		})
	}
})

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'toggleVideos') {
		videosEnabled = message.enabled
		if (!videosEnabled) {
			// Remove all videos
			document.querySelectorAll(`div[${DATA_HOLDER_ATTR}]`).forEach(holder => {
				holder.parentNode?.removeChild(holder)
			})
		} else {
			// Re-scan for active thinking/streaming
			initialScan()
		}
	}
})

// Get random brainrot video (avoids recent repeats)
function getRandomBrainrotVideo() {
	try {
		let availableVideos = BRAINROT_VIDEOS.filter((video) => !recentVideos.includes(video))

		// If all videos are recent (shouldn't happen with proper MAX_RECENT), reset and use all
		if (availableVideos.length === 0) {
			recentVideos = []
			availableVideos = BRAINROT_VIDEOS
		}

		const randomIndex = Math.floor(Math.random() * availableVideos.length)
		const selectedVideo = availableVideos[randomIndex]

		// Add to recent list and maintain size
		recentVideos.push(selectedVideo)
		if (recentVideos.length > MAX_RECENT) {
			recentVideos.shift() // Remove oldest
		}

		return chrome.runtime.getURL(selectedVideo)
	} catch (e) {
		// Fallback if chrome.runtime is not available
		console.warn('Chrome runtime not available, extension may need reload')
		return null
	}
}

// Create mute/unmute button
function createMuteButton(video) {
	const btn = document.createElement('button')
	btn.style.cssText = `
		position: absolute;
		top: 8px;
		right: 8px;
		background: rgba(0,0,0,0.7);
		border: none;
		border-radius: 4px;
		color: white;
		font-size: 12px;
		padding: 6px;
		cursor: pointer;
		z-index: 10;
		transition: background 0.2s;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	`
	
	const updateIcon = () => {
		btn.innerHTML = isMuted 
			? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
			: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'
	}
	
	updateIcon()
	
	btn.addEventListener('click', () => {
		isMuted = !isMuted
		video.muted = isMuted
		updateIcon()
		localStorage.setItem('brainrot-muted', isMuted.toString())
	})
	
	btn.addEventListener('mouseenter', () => {
		btn.style.background = 'rgba(0,0,0,0.9)'
	})
	
	btn.addEventListener('mouseleave', () => {
		btn.style.background = 'rgba(0,0,0,0.7)'
	})
	
	return btn
}

// Create video: 400px, autoplay, loop, with sound, with fade-in effect
function createVideo() {
	const container = document.createElement('div')
	container.style.position = 'relative'
	container.style.display = 'inline-block'
	
	const v = document.createElement('video')
	const videoSrc = getRandomBrainrotVideo()
	if (!videoSrc) {
		// Extension context invalid, don't create video
		return null
	}
	v.src = videoSrc
	v.autoplay = true
	v.loop = true
	v.muted = isMuted
	v.playsInline = true
	v.volume = 1.0
	v.setAttribute('autoplay', '')
	v.setAttribute('loop', '')
	v.setAttribute('playsinline', '')
	v.preload = 'metadata'

	// Size and appearance - smaller for vertical videos
	v.style.width = '300px'
	v.style.maxHeight = '400px'
	v.style.height = 'auto'
	v.style.display = 'block'
	v.style.marginTop = '8px'
	v.style.objectFit = 'contain'

	// Fade-in effect
	container.style.opacity = '0'
	container.style.transform = 'translateY(4px)'
	container.style.transition = 'opacity 240ms ease, transform 240ms ease'

	const muteBtn = createMuteButton(v)
	container.appendChild(v)
	container.appendChild(muteBtn)

	return container
}

function fadeIn(el) {
	// Double requestAnimationFrame for proper transition start
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			el.style.opacity = '1'
			el.style.transform = 'translateY(0)'
		})
	})
}

function ensureHolder(column) {
	let holder = column.querySelector(`div[${DATA_HOLDER_ATTR}]`)
	if (holder) return holder

	holder = document.createElement('div')
	holder.setAttribute(DATA_HOLDER_ATTR, '1')

	// For article elements, find the best place to insert
	if (column.tagName === 'ARTICLE') {
		// Look for the assistant message content area
		const messageArea = column.querySelector('[data-message-author-role="assistant"]')
		if (messageArea) {
			messageArea.parentElement.insertBefore(holder, messageArea)
		} else {
			column.appendChild(holder)
		}
	} else {
		// Original logic for other containers
		const firstChild = column.firstElementChild
		if (firstChild && firstChild.tagName === 'BUTTON') {
			firstChild.after(holder)
		} else {
			column.appendChild(holder)
		}
	}
	return holder
}

function removeHolder(column) {
	const holder = column.querySelector(`div[${DATA_HOLDER_ATTR}]`)
	if (holder && holder.parentNode) holder.parentNode.removeChild(holder)
}

function updateColumn(column) {
	if (!column || !(column instanceof Element)) return

	// Skip if videos are disabled
	if (!videosEnabled) {
		removeHolder(column)
		return
	}

	// Check for both thinking (.loading-shimmer) and streaming (.streaming-animation) states
	const isThinking = !!column.querySelector('.loading-shimmer')
	const isStreaming = !!column.querySelector('.streaming-animation')
	const shouldShowVideo = isThinking || isStreaming

	console.log('BrainrotGPT: Column update - thinking:', isThinking, 'streaming:', isStreaming, 'enabled:', videosEnabled)

	if (shouldShowVideo) {
		const holder = ensureHolder(column)
		if (!holder.querySelector('video')) {
			console.log('BrainrotGPT: Creating new video (thinking:', isThinking, 'streaming:', isStreaming, ')')
			const v = createVideo()
			if (v) {
				holder.replaceChildren(v)
				fadeIn(v)
				console.log('BrainrotGPT: Video added successfully')
			} else {
				console.log('BrainrotGPT: Failed to create video')
			}
		}
	} else {
		removeHolder(column)
	}
}

function initialScan() {
	document.querySelectorAll(CONTAINER_SELECTOR).forEach(updateColumn)
}

function observe() {
	const observer = new MutationObserver((mutations) => {
		const touched = new Set()

		for (const m of mutations) {
			const nodes = []
			if (m.type === 'childList') {
				m.addedNodes.forEach((n) => nodes.push(n))
				m.removedNodes.forEach((n) => nodes.push(n))
			} else if (m.type === 'characterData' || m.type === 'attributes') {
				nodes.push(m.target)
			}

			for (const n of nodes) {
				const el = n instanceof Text ? n.parentElement : n
				if (!el) continue

				let column = el.matches?.(CONTAINER_SELECTOR) ? el : el.closest?.(CONTAINER_SELECTOR)
				if (!column && el instanceof Element) {
					el.querySelectorAll?.(CONTAINER_SELECTOR).forEach((c) => touched.add(c))
				} else if (column) {
					touched.add(column)
				}
			}
		}

		touched.forEach(updateColumn)
	})

	observer.observe(document.documentElement || document.body, {
		childList: true,
		subtree: true,
		characterData: true,
		attributes: true,
		attributeFilter: ['class', 'style'],
	})
}

// Debug logging
console.log('BrainrotGPT: Extension loaded')

// Start
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		console.log('BrainrotGPT: DOM loaded, starting')
		initialScan()
		observe()
	})
} else {
	console.log('BrainrotGPT: Starting immediately')
	initialScan()
	observe()
}
