document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('.content');
  const webFrame = document.querySelector('#web-frame');
  const iframe = document.querySelector('#browser-iframe');
  const closeFrameBtn = document.querySelector('.close-frame');
  const addressBarInput = document.querySelector('.address-bar input');
  
  const backBtn = document.querySelector('.nav-btn.back');
  const forwardBtn = document.querySelector('.nav-btn.forward');
  const reloadBtn = document.querySelector('.nav-btn.reload');

  // Function to open link in browser frame
  function openLinkInFrame(url) {
    try {
      // Validate URL
      new URL(url);
      
      // Update address bar
      addressBarInput.value = url;
      
      // Load URL in iframe
      iframe.src = url;
      
      // Hide main content, show web frame
      content.style.display = 'none';
      webFrame.style.display = 'block';
    } catch (error) {
      console.error('Invalid URL:', error);
      alert('Cannot open invalid URL');
    }
  }

  // Close frame and return to main content
  closeFrameBtn.addEventListener('click', () => {
    webFrame.style.display = 'none';
    content.style.display = 'block';
    iframe.src = ''; // Clear iframe
  });

  // Navigation button handlers
  backBtn.addEventListener('click', () => {
    try {
      iframe.contentWindow.history.back();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  });

  forwardBtn.addEventListener('click', () => {
    try {
      iframe.contentWindow.history.forward();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  });

  reloadBtn.addEventListener('click', () => {
    try {
      iframe.contentWindow.location.reload();
    } catch (error) {
      console.error('Reload error:', error);
    }
  });

  // Add click event listeners to all external links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLinkInFrame(link.href);
    });
  });

  // Specific link handling for Chrome and Tor links
  const chromeLink = document.querySelector('a[href="https://www.google.com/chrome/"]');
  const torLink = document.querySelector('a[href="https://www.torproject.org/download/"]');
  const chaosVPNLink = document.querySelector('a[href="https://oldwiki.hamburg.ccc.de/ChaosVPN"]');
  const i2pLink = document.querySelector('a[href="https://geti2p.net/en/"]');
  const freenetLink = document.querySelector('a[href="https://freenet.org"]');

  [chromeLink, torLink, chaosVPNLink, i2pLink, freenetLink].forEach(link => {
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLinkInFrame(link.href);
      });
    }
  });
});
