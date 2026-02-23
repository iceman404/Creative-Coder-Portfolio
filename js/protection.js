/**
 * Basic Protection - Makes copying harder
 * Note: True protection is impossible, but we can make it annoying
 */

(function() {
  'use strict';

  const Protection = {
    init() {
      // Disable right-click context menu
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showMessage('🚫 This portfolio is protected');
      });

      // Disable common keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U') ||
          (e.ctrlKey && e.key === 'S')
        ) {
          e.preventDefault();
          this.showMessage('🔒 Developer tools disabled');
        }
      });

      // Detect DevTools opening
      let devtools = { open: false };
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 ||
            window.outerWidth - window.innerWidth > 200) {
          if (!devtools.open) {
            devtools.open = true;
            this.showMessage('[WARNING] Developer tools detected');
            // You could redirect or blur content here
            document.body.style.filter = 'blur(5px)';
            setTimeout(() => {
              document.body.style.filter = '';
            }, 2000);
          }
        } else {
          devtools.open = false;
        }
      }, 500);

      // Disable text selection (can be annoying, use sparingly)
      // document.addEventListener('selectstart', (e) => e.preventDefault());
      
      // Disable drag
      document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
        }
      });
    },

    showMessage(text) {
      const msg = document.createElement('div');
      msg.textContent = text;
      msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: #00b9cc;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 100000;
        font-family: monospace;
        box-shadow: 0 0 20px rgba(0, 185, 204, 0.5);
        animation: fadeInOut 2s ease-out;
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);
    }
  };

  // Add fade animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; transform: translateY(-20px); }
      20%, 80% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  Protection.init();
  window.Protection = Protection;
})();
