// Card container
const CONTAINER_SELECTOR = '.flex.w-full.items-start.justify-between.text-start.flex-col'
const DATA_HOLDER_ATTR = 'data-thinking-video-holder'

// Brainrot video collection
const BRAINROT_VIDEOS = ['img/vids/ai-baby-fruits.mp4', 'img/vids/italian-brainrot-baby.mp4', 'img/vids/italian-brainrot.mp4', 'img/vids/my-mother-ate-fries.mp4', 'img/vids/subway-surfers.mp4', 'img/vids/67.mp4', 'img/vids/drippy.mp4']

// Get random brainrot video
function getRandomBrainrotVideo() {
	const randomIndex = Math.floor(Math.random() * BRAINROT_VIDEOS.length)
	try {
		return chrome.runtime.getURL(BRAINROT_VIDEOS[randomIndex])
	} catch (e) {
		// Fallback if chrome.runtime is not available
		console.warn('Chrome runtime not available, extension may need reload')
		return null
	}
}

// Create video: 400px, autoplay, loop, with sound, with fade-in effect
function createVideo() {
	const v = document.createElement('video')
	const videoSrc = getRandomBrainrotVideo()
	if (!videoSrc) {
		// Extension context invalid, don't create video
		return null
	}
	v.src = videoSrc
	v.autoplay = true
	v.loop = true
	v.muted = false // Enable sound for brainrot experience
	v.playsInline = true
	v.volume = 1.0 // Full volume brainrot experience
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
	v.style.opacity = '0'
	v.style.transform = 'translateY(4px)'
	v.style.transition = 'opacity 240ms ease, transform 240ms ease'

	return v
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

	// Insert right after the first button-header
	const firstChild = column.firstElementChild
	if (firstChild && firstChild.tagName === 'BUTTON') {
		firstChild.after(holder)
	} else {
		column.appendChild(holder)
	}
	return holder
}

function removeHolder(column) {
	const holder = column.querySelector(`div[${DATA_HOLDER_ATTR}]`)
	if (holder && holder.parentNode) holder.parentNode.removeChild(holder)
}

function updateColumn(column) {
	if (!column || !(column instanceof Element)) return

	const loading = !!column.querySelector('.loading-shimmer')

	if (loading) {
		const holder = ensureHolder(column)
		if (!holder.querySelector('video')) {
			const v = createVideo()
			if (v) {
				holder.replaceChildren(v)
				fadeIn(v)
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

// Start
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		initialScan()
		observe()
	})
} else {
	initialScan()
	observe()
}
