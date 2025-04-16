# RedSave Bookmarklet

RedSave is a simple bookmarklet that adds a download button to RedGifs videos, allowing you to easily save your favorite content with one click.


![image](https://github.com/user-attachments/assets/b27ca84d-4c82-404d-ad10-e74effa199c2)



## How to Install the Bookmarklet

1. **Create a new bookmark in your browser**:
   - Right-click on your bookmarks bar and select "Add page" or "Add bookmark"
   - Or click the star icon in your address bar (in most browsers)

2. **Give your bookmark a name**:
   - Enter "RedSave" or any name you prefer

3. **Paste the bookmarklet code into the URL/Address field**:
   - Copy the entire code block below
   - Paste it into the URL or Address field of your new bookmark
   ```
   javascript:(function(){let detectedM4sUrls=[];function showNotification(message,isError=false){const notification=document.createElement('div');notification.style.position='fixed';notification.style.bottom='20px';notification.style.right='20px';notification.style.backgroundColor=isError?'#FF4136':'#E5194D';notification.style.color='white';notification.style.padding='10px 15px';notification.style.borderRadius='4px';notification.style.boxShadow='0 2px 5px rgba(0,0,0,0.2)';notification.style.zIndex='9999';notification.style.maxWidth='300px';notification.style.fontSize='14px';notification.style.opacity='0';notification.style.transition='opacity 0.3s ease';notification.textContent=message;document.body.appendChild(notification);setTimeout(()=>{notification.style.opacity='1';},10);setTimeout(()=>{notification.style.opacity='0';setTimeout(()=>{if(document.body.contains(notification)){document.body.removeChild(notification);}},300);},3000);}const originalOpen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url){if(typeof url==='string'&&url.includes('.m4s')){const videoId=getFilenameFromUrl(url);console.log("Detected m4s request:",url,"for ID:",getCurrentVideoId());const currentId=getCurrentVideoId()?.toLowerCase()||'';detectedM4sUrls.push({url:url,timestamp:Date.now(),videoId:videoId,pageVideoId:currentId});}return originalOpen.apply(this,arguments);};const originalFetch=window.fetch;window.fetch=function(url,options){if(typeof url==='string'&&url.includes('.m4s')){const videoId=getFilenameFromUrl(url);console.log("Detected m4s fetch:",url,"for ID:",getCurrentVideoId());const currentId=getCurrentVideoId()?.toLowerCase()||'';detectedM4sUrls.push({url:url,timestamp:Date.now(),videoId:videoId,pageVideoId:currentId});}return originalFetch.apply(this,[url,options]);};function getCreatorName(){const creatorElement=document.querySelector('.UserInfo-UserLink span');return creatorElement?creatorElement.textContent.trim():'unknown';}function getFilenameFromUrl(url){const urlParts=url.split('/');const lastPart=urlParts[urlParts.length-1];return lastPart.split('.')[0];}function getCurrentVideoId(){if(window.location.pathname.includes('/watch/')){return window.location.pathname.split('/watch/')[1];}else if(document.querySelector('.GifPreview')){return document.querySelector('.GifPreview').id.replace('gif_','');}return null;}function addDownloadButton(){const moreButtons=document.querySelectorAll('.MoreRoundButton');moreButtons.forEach(moreButton=>{const parentItem=moreButton.closest('.SideBar-Item');if(parentItem&&!parentItem.nextElementSibling?.classList.contains('download-button-item')){const newItem=document.createElement('li');newItem.className='SideBar-Item download-button-item';const downloadButton=document.createElement('button');downloadButton.className='rg-button download-button';downloadButton.setAttribute('aria-label','download video');downloadButton.style.backgroundColor='#E5194D';downloadButton.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M23 22C23 22.5523 22.5523 23 22 23H2C1.44772 23 1 22.5523 1 22C1 21.4477 1.44772 21 2 21H22C22.5523 21 23 21.4477 23 22Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.3099 18.6881C12.5581 19.3396 11.4419 19.3396 10.6901 18.6881L5.87088 14.5114C4.47179 13.2988 5.32933 11 7.18074 11L9.00001 11V3C9.00001 1.89543 9.89544 1 11 1L13 1C14.1046 1 15 1.89543 15 3L15 11H16.8193C18.6707 11 19.5282 13.2988 18.1291 14.5114L13.3099 18.6881ZM11.3451 16.6091C11.7209 16.9348 12.2791 16.9348 12.6549 16.6091L16.8193 13H14.5C13.6716 13 13 12.3284 13 11.5V3L11 3V11.5C11 12.3284 10.3284 13 9.50001 13L7.18074 13L11.3451 16.6091Z" fill="white"/></svg>`;downloadButton.addEventListener('click',function(e){e.preventDefault();const currentVideoId=getCurrentVideoId()?.toLowerCase();if(!currentVideoId){showNotification("Cannot determine which video to download",true);return;}const matchingUrls=detectedM4sUrls.filter(item=>item.pageVideoId===currentVideoId||item.videoId.toLowerCase().includes(currentVideoId));console.log("Current video ID:",currentVideoId);console.log("Found matching URLs:",matchingUrls.length);if(matchingUrls.length>0){matchingUrls.sort((a,b)=>b.timestamp-a.timestamp);const targetUrl=matchingUrls[0].url;const targetFilename=matchingUrls[0].videoId;const creator=getCreatorName();const downloadFilename=`${creator}_${targetFilename}`;console.log("Selected URL:",targetUrl);console.log("Download filename:",downloadFilename);showNotification(`Downloading: ${creator}_${targetFilename}.m4s`);fetch(targetUrl).then(response=>{if(!response.ok){throw new Error(`HTTP error! Status: ${response.status}`);}return response.blob();}).then(blob=>{const blobUrl=window.URL.createObjectURL(blob);const a=document.createElement('a');a.href=blobUrl;a.download=downloadFilename+'.m4s';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{window.URL.revokeObjectURL(blobUrl);document.body.removeChild(a);},100);}).catch(err=>{console.error("Error downloading:",err);showNotification("Error downloading. Opening in new tab.",true);window.open(targetUrl,'_blank');});}else{console.error("No matching video URL found for:",currentVideoId);showNotification("No matching URL found. Try playing the video again.",true);}});newItem.appendChild(downloadButton);parentItem.parentNode.insertBefore(newItem,parentItem.nextSibling);}});}addDownloadButton();const observer=new MutationObserver(function(mutations){mutations.forEach(function(mutation){if(mutation.addedNodes.length){addDownloadButton();}});});observer.observe(document.body,{childList:true,subtree:true});showNotification("RedSave activated. Play video, then click Download.");console.log("%c RedSave activated","color: #E5194D; font-weight: bold; font-size: 16px;");console.log("1. Play videos to detect their URLs");console.log("2. Click the download button to download the current video");console.log("3. Videos will download with creator_filename format");})();
   ```

4. **Save the bookmark**

## How to Use RedSave

1. **Navigate to RedGifs** in your browser

2. **Click the RedSave bookmark** in your bookmarks bar
   - You should see a notification: "RedSave activated. Play video, then click Download."

3. **Play any video** on the site that you want to download
   - The video needs to play for at least a moment so the script can detect the video URL

4. **Click the download button** that appears next to the "more" button
   - The download button has a download icon and is the same red color as the RedGifs logo

5. **Your video will download** with the filename format: `CreatorName_VideoID.m4s`

## Troubleshooting

- **Bookmark doesn't work**: Make sure you copied the entire code snippet without any missing characters
- **No download button appears**: Refresh the page and click the bookmark again
- **"No matching URL found"**: Play the video for a few seconds and try downloading again
- **Download fails**: Try playing the video again from the beginning before clicking download

## Notes

- This bookmarklet needs to be activated each time you visit RedGifs
- The `.m4s` files are standard MP4 fragments that should play in most media players
- The script does not collect or send any data outside your browser

---

**Note**: This script is not affiliated with RedGifs. Use responsibly and respect content creators' rights.
