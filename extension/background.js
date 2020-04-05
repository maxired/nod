chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);
  chrome.runtime.reload();
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.reload) {
    chrome.runtime.requestUpdateCheck(function(status) {
      if (status == "update_available") {
        console.log("update pending...");
        sendResponse({ updateAvailable: true, throttled: false });
      } else if (status == "no_update") {
        console.log("no update found");
        sendResponse({ updateAvailable: false, throttled: false });
      } else if (status == "throttled") {
        console.log("Oops, I'm asking too frequently - I need to back off.");
        sendResponse({ updateAvailable: false, throttled: true });
      }
    });
  }
  // if (request.type === "notification") {
  //   chrome.permissions.request(
  //     {
  //       permissions: ["notifications"],
  //       origins: ["*://meet.google.com/**-**-**"]
  //     },
  //     function(granted) {
  //       if (granted) {
  //         console.log("Permissions Granted");
  //       } else {
  //         console.log("Permissions Denied");
  //       }
  //     }
  //   );
  // }
});
