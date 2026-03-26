r/**
 * PremiumAutocomplete - Production-ready autocomplete component
 * Standalone vanilla JS with zero dependencies
 *
 * Features:
 * - Smooth animations (fade, slide, scale)
 * - Staggered item entrance animations
 * - Hover effects with shine animation
 * - Keyboard navigation (arrows, enter, escape)
 * - Accessibility (ARIA labels, focus management)
 * - Dark mode support
 * - Custom scrollbar styling
 * - Empty state UI
 * - Performance optimized (will-change, transforms)
 */

class PremiumAutocomplete {
    constructor(config) {
        // Configuration
        this.config = {
            inputSelector: '#searchInput',
            dropdownSelector: '#dropdown',
            suggestionsSelector: '#suggestionsList',
            maxSuggestions: 10,
            debounceDelay: 200,
            matchType: 'startsWith', // 'startsWith' or 'includes'
            ...config
        };

        // DOM Elements
        this.input = document.querySelector(this.config.inputSelector);
        this.dropdown = document.querySelector(this.config.dropdownSelector);
        this.suggestionsList = document.querySelector(this.config.suggestionsSelector);

        if (!this.input || !this.dropdown || !this.suggestionsList) {
            console.error('PremiumAutocomplete: Required DOM elements not found');
            return;
        }

        // State
        this.allSuggestions = [];
        this.filteredSuggestions = [];
        this.currentFocusIndex = -1;
        this.debounceTimer = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize event listeners and setup
     */
    init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', () => this.openDropdown());
        this.input.addEventListener('keydown', (e) => this.handleKeyboard(e));
        this.input.addEventListener('blur', () => this.scheduleClose());

        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Set ARIA attributes
        this.input.setAttribute('role', 'combobox');
        this.input.setAttribute('aria-autocomplete', 'list');
        this.input.setAttribute('aria-controls', 'suggestionsList');
        this.input.setAttribute('aria-expanded', 'false');
        this.suggestionsList.setAttribute('role', 'listbox');
    }

    /**
     * Handle input with debouncing
     */
    handleInput(e) {
        clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            this.currentFocusIndex = -1;

            // Filter suggestions
            if (!query) {
                this.filteredSuggestions = [...this.allSuggestions];
            } else {
                const matchFn = this.config.matchType === 'startsWith'
                    ? item => item.toLowerCase().startsWith(query)
                    : item => item.toLowerCase().includes(query);

                this.filteredSuggestions = this.allSuggestions
                    .filter(matchFn)
                    .slice(0, this.config.maxSuggestions);
            }

            this.renderSuggestions(query);

            if (this.filteredSuggestions.length > 0 || query) {
                this.openDropdown();
            }
        }, this.config.debounceDelay);
    }

    /**
     * Render suggestions to DOM
     */
    renderSuggestions(query = '') {
        this.suggestionsList.innerHTML = '';

        if (this.filteredSuggestions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <span class="empty-icon">🔍</span>
                <div class="empty-text">
                    ${query ? 'No suggestions found' : 'Start typing to see suggestions'}
                </div>
            `;
            this.suggestionsList.parentElement.appendChild(emptyState);
            return;
        }

        // Remove empty state if exists
        const emptyState = this.dropdown.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        this.filteredSuggestions.forEach((suggestion, index) => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.setAttribute('role', 'option');
            li.setAttribute('data-index', index);
            li.setAttribute('tabindex', '-1');

            const textSpan = document.createElement('span');
            textSpan.className = 'suggestion-text';
            textSpan.innerHTML = this.highlightMatch(suggestion, query);

            li.appendChild(textSpan);

            // Event listeners
            li.addEventListener('click', () => this.selectSuggestion(suggestion));
            li.addEventListener('mouseenter', () => this.setFocus(index));

            this.suggestionsList.appendChild(li);
        });
    }

    /**
     * Highlight matching text in suggestions
     */
    highlightMatch(suggestion, query) {
        if (!query) return suggestion;

        const index = suggestion.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return suggestion;

        const before = suggestion.slice(0, index);
        const match = suggestion.slice(index, index + query.length);
        const after = suggestion.slice(index + query.length);

        return `${before}<strong style="color: #667eea; font-weight: 600;">${match}</strong>${after}`;
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboard(e) {
        const isDropdownOpen = this.dropdown.classList.contains('open');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isDropdownOpen) {
                    this.openDropdown();
                } else {
                    this.setFocus(this.currentFocusIndex + 1);
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (isDropdownOpen) {
                    this.setFocus(this.currentFocusIndex - 1);
                }
                break;

            case 'Enter':
                e.preventDefault();
                if (isDropdownOpen && this.currentFocusIndex >= 0) {
                    this.selectSuggestion(this.filteredSuggestions[this.currentFocusIndex]);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                break;

            case 'Tab':
                this.closeDropdown();
                break;
        }
    }

    /**
     * Set focus to a suggestion item
     */
    setFocus(index) {
        if (this.filteredSuggestions.length === 0) return;

        // Remove previous focus styling
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.classList.remove('focused');
            item.setAttribute('aria-selected', 'false');
        });

        // Clamp index
        if (index < 0) index = -1;
        if (index >= this.filteredSuggestions.length) index = -1;

        this.currentFocusIndex = index;

        if (index >= 0) {
            const items = document.querySelectorAll('.suggestion-item');
            const focusedItem = items[index];

            if (focusedItem) {
                focusedItem.classList.add('focused');
                focusedItem.setAttribute('aria-selected', 'true');
                focusedItem.focus();

                // Smooth scroll into view
                focusedItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }

    /**
     * Select a suggestion
     */
    selectSuggestion(suggestion) {
        this.input.value = suggestion;
        this.closeDropdown();
        this.filteredSuggestions = [];
        this.suggestionsList.innerHTML = '';

        // Dispatch custom event
        this.input.dispatchEvent(new CustomEvent('suggestionSelected', {
            detail: { suggestion },
            bubbles: true
        }));

        // Callback
        if (this.config.onSelect) {
            this.config.onSelect(suggestion);
        }
    }

    /**
     * Open dropdown
     */
    openDropdown() {
        this.dropdown.classList.add('open');
        this.input.setAttribute('aria-expanded', 'true');
    }

    /**
     * Close dropdown
     */
    closeDropdown() {
        this.dropdown.classList.remove('open');
        this.input.setAttribute('aria-expanded', 'false');
        this.currentFocusIndex = -1;
    }

    /**
     * Schedule close on blur (with delay for click detection)
     */
    scheduleClose() {
        setTimeout(() => {
            if (!this.dropdown.querySelector('.suggestion-item:hover')) {
                this.closeDropdown();
            }
        }, 100);
    }

    /**
     * Handle clicks outside the component
     */
    handleOutsideClick(e) {
        if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
            this.closeDropdown();
        }
    }

    /**
     * Public API: Set suggestions
     */
    setSuggestions(suggestions) {
        this.allSuggestions = Array.isArray(suggestions) ? suggestions : [];
        this.allSuggestions.sort();
    }

    /**
     * Public API: Add a suggestion
     */
    addSuggestion(suggestion) {
        if (!this.allSuggestions.includes(suggestion)) {
            this.allSuggestions.push(suggestion);
            this.allSuggestions.sort();
        }
    }

    /**
     * Public API: Remove a suggestion
     */
    removeSuggestion(suggestion) {
        const index = this.allSuggestions.indexOf(suggestion);
        if (index > -1) {
            this.allSuggestions.splice(index, 1);
        }
    }

    /**
     * Public API: Clear all suggestions
     */
    clear() {
        this.input.value = '';
        this.filteredSuggestions = [];
        this.suggestionsList.innerHTML = '';
        this.closeDropdown();
    }

    /**
     * Public API: Get current query
     */
    getQuery() {
        return this.input.value.trim();
    }

    /**
     * Public API: Destroy component
     */
    destroy() {
        this.input.removeEventListener('input', this.handleInput);
        this.input.removeEventListener('focus', this.openDropdown);
        this.input.removeEventListener('keydown', this.handleKeyboard);
        this.dropdown.remove();
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumAutocomplete;
}
