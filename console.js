// Create and inject the download button script for RedGifs
(function() {
  // Store detected video URLs with timestamps and metadata
  let detectedM4sUrls = [];
  
  // Function to create notification
  function showNotification(message, isError = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = isError ? '#FF4136' : '#E5194D';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.fontSize = '14px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    notification.textContent = message;
    
    // Add notification to the page
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  // Monkey patch XMLHttpRequest to track video file requests
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && url.includes('.m4s')) {
      const videoId = getFilenameFromUrl(url);
      console.log("Detected m4s request:", url, "for ID:", getCurrentVideoId());
      
      // Store with the currently visible video ID, not the one in the URL
      const currentId = getCurrentVideoId()?.toLowerCase() || '';
      
      // Add new entry
      detectedM4sUrls.push({
        url: url,
        timestamp: Date.now(),
        videoId: videoId,
        pageVideoId: currentId
      });
    }
    return originalOpen.apply(this, arguments);
  };
  
  // Also monkey patch fetch to capture those requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('.m4s')) {
      const videoId = getFilenameFromUrl(url);
      console.log("Detected m4s fetch:", url, "for ID:", getCurrentVideoId());
      
      // Store with the currently visible video ID, not the one in the URL
      const currentId = getCurrentVideoId()?.toLowerCase() || '';
      
      // Add new entry
      detectedM4sUrls.push({
        url: url,
        timestamp: Date.now(),
        videoId: videoId,
        pageVideoId: currentId
      });
    }
    return originalFetch.apply(this, [url, options]);
  };
  
  // Function to get the creator name
  function getCreatorName() {
    const creatorElement = document.querySelector('.UserInfo-UserLink span');
    return creatorElement ? creatorElement.textContent.trim() : 'unknown';
  }
  
  // Function to extract filename from URL
  function getFilenameFromUrl(url) {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    return lastPart.split('.')[0]; // Remove extension
  }
  
  // Function to get current video ID from page
  function getCurrentVideoId() {
    // Try to get from URL first
    if (window.location.pathname.includes('/watch/')) {
      return window.location.pathname.split('/watch/')[1];
    }
    // Or try to get from the GifPreview ID
    else if (document.querySelector('.GifPreview')) {
      return document.querySelector('.GifPreview').id.replace('gif_', '');
    }
    return null;
  }
  
  // Function to add download button next to the "more" button
  function addDownloadButton() {
    // Find all "more" buttons in the sidebar
    const moreButtons = document.querySelectorAll('.MoreRoundButton');
    
    moreButtons.forEach(moreButton => {
      // Check if we already added a download button next to this one
      const parentItem = moreButton.closest('.SideBar-Item');
      if (parentItem && !parentItem.nextElementSibling?.classList.contains('download-button-item')) {
        // Create a new list item for the download button
        const newItem = document.createElement('li');
        newItem.className = 'SideBar-Item download-button-item';
        
        // Create the download button
        const downloadButton = document.createElement('button');
        downloadButton.className = 'rg-button download-button';
        downloadButton.setAttribute('aria-label', 'download video');
        downloadButton.style.backgroundColor = '#E5194D';
        
        // Use the new download icon
        downloadButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M23 22C23 22.5523 22.5523 23 22 23H2C1.44772 23 1 22.5523 1 22C1 21.4477 1.44772 21 2 21H22C22.5523 21 23 21.4477 23 22Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3099 18.6881C12.5581 19.3396 11.4419 19.3396 10.6901 18.6881L5.87088 14.5114C4.47179 13.2988 5.32933 11 7.18074 11L9.00001 11V3C9.00001 1.89543 9.89544 1 11 1L13 1C14.1046 1 15 1.89543 15 3L15 11H16.8193C18.6707 11 19.5282 13.2988 18.1291 14.5114L13.3099 18.6881ZM11.3451 16.6091C11.7209 16.9348 12.2791 16.9348 12.6549 16.6091L16.8193 13H14.5C13.6716 13 13 12.3284 13 11.5V3L11 3V11.5C11 12.3284 10.3284 13 9.50001 13L7.18074 13L11.3451 16.6091Z" fill="white"/>
          </svg>
        `;
        
        // Add click event to download the video
        downloadButton.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Get the current video ID at time of click
          const currentVideoId = getCurrentVideoId()?.toLowerCase();
          
          if (!currentVideoId) {
            showNotification("Cannot determine which video to download", true);
            return;
          }
          
          // Filter URLs by the current video ID (using BOTH methods)
          const matchingUrls = detectedM4sUrls.filter(item => 
            // Match either by the URL's filename or by the stored page ID
            item.pageVideoId === currentVideoId || 
            item.videoId.toLowerCase().includes(currentVideoId)
          );
          
          console.log("Current video ID:", currentVideoId);
          console.log("Found matching URLs:", matchingUrls.length);
          
          if (matchingUrls.length > 0) {
            // Sort by timestamp (newest first) and take the most recent
            matchingUrls.sort((a, b) => b.timestamp - a.timestamp);
            const targetUrl = matchingUrls[0].url;
            const targetFilename = matchingUrls[0].videoId;
            
            // Get creator name
            const creator = getCreatorName();
            
            // Construct complete filename - removed date timestamp
            const downloadFilename = `${creator}_${targetFilename}`;
            console.log("Selected URL:", targetUrl);
            console.log("Download filename:", downloadFilename);
            
            // Show notification with info - removed date timestamp from notification
            showNotification(`Downloading: ${creator}_${targetFilename}.m4s`);
            
            // Direct download using a blob
            fetch(targetUrl)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
              })
              .then(blob => {
                // Create a blob URL
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Create a download link
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = downloadFilename + '.m4s';
                a.style.display = 'none';
                
                // Add to document, click, and remove
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => {
                  window.URL.revokeObjectURL(blobUrl);
                  document.body.removeChild(a);
                }, 100);
              })
              .catch(err => {
                console.error("Error downloading:", err);
                // Show error notification
                showNotification("Error downloading. Opening in new tab.", true);
                // Fallback to opening in new tab
                window.open(targetUrl, '_blank');
              });
          } else {
            console.error("No matching video URL found for:", currentVideoId);
            showNotification("No matching URL found. Try playing the video again.", true);
          }
        });
        
        // Add the button to the sidebar
        newItem.appendChild(downloadButton);
        parentItem.parentNode.insertBefore(newItem, parentItem.nextSibling);
      }
    });
  }
  
  // Run initially
  addDownloadButton();
  
  // Set up a mutation observer to detect when new videos are loaded
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        addDownloadButton();
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Show initial notification
  showNotification("RedGifs Downloader activated. Play video, then click Download.");
  
  // Log activation message
  console.log("%c RedGifs Downloader activated", "color: #E5194D; font-weight: bold; font-size: 16px;");
  console.log("1. Play videos to detect their URLs");
  console.log("2. Click the download button to download the current video");
  console.log("3. Videos will download with creator_filename format");
})();
