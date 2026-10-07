// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top without repeated DOM queries.
const scrollButton = document.querySelector('.scroll-to-top');
window.addEventListener('scroll', () => {
    scrollButton?.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });

// Keeping inactive sources out of src prevents even metadata requests.
function loadVideo(video) {
    if (!video) return;
    let changed = false;
    video.querySelectorAll('source[data-src]').forEach(source => {
        source.src = source.dataset.src;
        delete source.dataset.src;
        changed = true;
    });
    if (changed || video.error || video.networkState === 3) {
        video.preload = 'auto';
        video.load();
    }
}

function initialiseDeck(deck) {
    const slides = Array.from(deck.querySelectorAll('.deck-slide'));
    const dotsWrap = deck.querySelector('.deck-dots');
    const toggle = deck.querySelector('[data-deck-toggle]');
    let index = 0;
    let playing = deck.dataset.autoplay === 'true';
    let visible = false;
    let requestedIndex = index;
    let transitionController = null;
    const getVideo = i => slides[i]?.querySelector('video');

    function prefetchNext() {
        // Fetch one slide ahead only after the visible slide has a decoded frame.
        if (visible && !document.hidden && getVideo(index)?.readyState >= 2) {
            loadVideo(getVideo((index + 1) % slides.length));
        }
    }

    function syncPlayback() {
        prefetchNext();
        const video = getVideo(index);
        if (!video) return;
        if (visible && playing && !document.hidden && !transitionController) {
            loadVideo(video);
            video.play().then(() => {
                // Scrolling or clicking Pause may happen while play() is pending.
                if (!visible || !playing || document.hidden || transitionController || video !== getVideo(index)) {
                    video.pause();
                }
            }).catch(() => {});
        } else {
            video.pause();
        }
    }

    function resetVideo(video) {
        if (!video) return;
        video.pause();
        if (video.readyState > 0 && video.currentTime !== 0) video.currentTime = 0;
    }

    function waitForFrame(video, signal) {
        return new Promise((resolve, reject) => {
            let timeout;
            function cleanup() {
                clearTimeout(timeout);
                ['loadeddata', 'canplay', 'seeked'].forEach(event => {
                    video.removeEventListener(event, check);
                });
                video.removeEventListener('error', failed, true);
                signal.removeEventListener('abort', aborted);
            }
            function check() {
                // A seek also needs to finish before exposing the first frame.
                if (video.readyState >= 2 && !video.seeking) {
                    cleanup();
                    resolve();
                }
            }
            function failed() {
                cleanup();
                reject(new Error('The next carousel video could not be loaded.'));
            }
            function aborted() {
                cleanup();
                reject(new DOMException('Slide selection changed.', 'AbortError'));
            }
            ['loadeddata', 'canplay', 'seeked'].forEach(event => {
                video.addEventListener(event, check);
            });
            video.addEventListener('error', failed, true);
            signal.addEventListener('abort', aborted);
            timeout = setTimeout(failed, 30000);
            if (signal.aborted) aborted();
            else if (video.error) failed();
            else check();
        });
    }

    async function goTo(nextIndex) {
        requestedIndex = (nextIndex + slides.length) % slides.length;
        transitionController?.abort();
        const controller = new AbortController();
        transitionController = controller;
        const targetIndex = requestedIndex;
        const oldVideo = getVideo(index);
        const video = getVideo(targetIndex);
        // Leave the old frame on screen throughout loading and seeking.
        oldVideo?.pause();
        deck.setAttribute('aria-busy', 'true');
        try {
            if (targetIndex !== index && video) {
                resetVideo(video);
                loadVideo(video);
                await waitForFrame(video, controller.signal);
            }
            if (controller.signal.aborted) return;
            index = targetIndex;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            Array.from(dotsWrap.children).forEach((dot, i) => {
                dot.classList.toggle('is-active', i === index);
            });
            // Reset the outgoing video only after its frame has been hidden.
            if (oldVideo !== video) resetVideo(oldVideo);
        } catch (error) {
            if (!controller.signal.aborted) {
                requestedIndex = index;
                console.warn('Unable to change carousel slide:', error);
            }
        } finally {
            // A superseded request must not resume playback or clear a newer one.
            if (transitionController === controller) {
                transitionController = null;
                deck.removeAttribute('aria-busy');
                syncPlayback();
            }
        }
    }

    slides.forEach((slide, i) => {
        const dot = document.createElement('button');
        dot.className = 'deck-dot' + (i === 0 ? ' is-active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        const video = getVideo(i);
        const missing = slide.querySelector('.missing-media');
        video?.addEventListener('error', () => missing?.classList.add('show'), true);
        video?.addEventListener('loadeddata', () => {
            missing?.classList.remove('show');
            if (i === index) prefetchNext();
        });
        video?.addEventListener('ended', () => {
            if (i === index && playing && visible && !document.hidden) goTo(index + 1);
        });
    });

    deck.querySelector('[data-deck-prev]').addEventListener('click', () => goTo(requestedIndex - 1));
    deck.querySelector('[data-deck-next]').addEventListener('click', () => goTo(requestedIndex + 1));
    toggle.addEventListener('click', () => {
        playing = !playing;
        toggle.textContent = playing ? 'Pause' : 'Play';
        toggle.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Play autoplay');
        syncPlayback();
    });
    toggle.textContent = playing ? 'Pause' : 'Play';
    document.addEventListener('visibilitychange', syncPlayback);

    if ('IntersectionObserver' in window) {
        // Warm up only the selected slide just before the deck enters view.
        const preloadObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadVideo(getVideo(index));
                preloadObserver.disconnect();
            }
        }, { rootMargin: '250px 0px' });
        preloadObserver.observe(deck);
        const playbackObserver = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            syncPlayback();
        });
        playbackObserver.observe(deck);
    } else {
        visible = true;
        loadVideo(getVideo(index));
        syncPlayback();
    }
}

function initialiseTeaser(video) {
    if (!video) return;
    let visible = false;
    // A click on Pause in the native controls survives scrolling away and back.
    let userPaused = false;
    video.addEventListener('pause', () => {
        if (visible && !document.hidden && !video.ended) userPaused = true;
    });
    video.addEventListener('play', () => { userPaused = false; });
    function syncPlayback() {
        if (visible && !document.hidden && !userPaused) {
            loadVideo(video);
            video.play().then(() => {
                if (!visible || document.hidden || userPaused) video.pause();
            }).catch(() => {});
        } else {
            video.pause();
        }
    }
    document.addEventListener('visibilitychange', syncPlayback);
    if ('IntersectionObserver' in window) {
        const preloadObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadVideo(video);
                preloadObserver.disconnect();
            }
        }, { rootMargin: '250px 0px' });
        preloadObserver.observe(video);
        const playbackObserver = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            syncPlayback();
        });
        playbackObserver.observe(video);
    } else {
        visible = true;
        syncPlayback();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-deck]').forEach(initialiseDeck);
    initialiseTeaser(document.getElementById('tree'));
});
