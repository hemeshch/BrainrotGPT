// Card container
const CONTAINER_SELECTOR = '.flex.w-full.items-start.justify-between.text-start.flex-col'
const DATA_HOLDER_ATTR = 'data-thinking-video-holder'

// Brainrot YouTube Shorts collection
const BRAINROT_SHORTS = ['35QU958Q7cg', 'lzLSg0ND9k8', 'uSFCckKC6ew', 'BcgsU3Fe7S0', 'CALkaXtze-4', 'DNcD408AcMk', '68pN3RYpjnY', 'AplkpWBRMNg']

// Get random brainrot YouTube Short
function getRandomBrainrotShort() {
	const randomIndex = Math.floor(Math.random() * BRAINROT_SHORTS.length)
	return BRAINROT_SHORTS[randomIndex]
}

// Create YouTube Short iframe
function createVideo() {
	const videoId = getRandomBrainrotShort()

	// Create container div
	const container = document.createElement('div')
	container.id = 'tpYtContainer'

	// Create iframe
	const iframe = document.createElement('iframe')
	iframe.width = '300'
	iframe.height = '500'
	iframe.src = `https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1&fs=0&disablekb=1&controls=0&modestbranding=1&mute=0`
	iframe.frameBorder = '0'
	iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'

	// Styling
	container.style.display = 'block'
	container.style.marginTop = '8px'
	iframe.style.borderRadius = '8px'

	// Fade-in effect
	container.style.opacity = '0'
	container.style.transform = 'translateY(4px)'
	container.style.transition = 'opacity 240ms ease, transform 240ms ease'

	// Set up auto-refresh when video ends
	setupVideoRefresh(container, iframe)

	container.appendChild(iframe)
	return container
}

// Setup video refresh mechanism
function setupVideoRefresh(container, iframe) {
	const refreshVideo = () => {
		const newVideoId = getRandomBrainrotShort()
		iframe.src = `https://www.youtube.com/embed/${newVideoId}?loop=1&autoplay=1&fs=0&disablekb=1&controls=0&modestbranding=1&mute=0`
	}

	// Refresh video every 20 seconds for continuous brainrot
	const refreshInterval = setInterval(() => {
		if (!document.contains(container)) {
			clearInterval(refreshInterval)
			return
		}
		refreshVideo()
	}, 20000)
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
		if (!holder.querySelector('iframe') && !holder.querySelector('#tpYtContainer')) {
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
