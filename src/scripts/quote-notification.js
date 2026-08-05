import { funQuotes } from '../data/quotes';

  document.addEventListener('DOMContentLoaded', () => {
    const lastShown = localStorage.getItem('lastQuoteShownTime');
    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000;

    // Check if we should show a quote (if never shown or > 4 hours ago)
    if (!lastShown || (now - parseInt(lastShown) > FOUR_HOURS)) {
      const notification = document.getElementById('quote-notification');
      const quoteText = document.getElementById('quote-text');
      const closeBtn = document.getElementById('close-quote');

      if (notification && quoteText) {
        // Select random quote
        const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
        quoteText.textContent = `"${randomQuote}"`;

        // Show notification with a slight delay for better UX
        setTimeout(() => {
          notification.classList.remove('hidden');
          // Trigger reflow to enable transition
          void notification.offsetWidth;
          notification.classList.remove('translate-y-10', 'opacity-0');

          // Update timestamp immediately when shown
          localStorage.setItem('lastQuoteShownTime', now.toString());
        }, 1500);

        // Close handler
        closeBtn?.addEventListener('click', () => {
          notification.classList.add('translate-y-10', 'opacity-0');
          setTimeout(() => {
            notification.classList.add('hidden');
          }, 500);
        });
      }
    }
  });
