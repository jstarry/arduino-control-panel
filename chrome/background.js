chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
    frame: 'none',
		bounds: {
			width: 360,
			height: 576,
			left: 100,
			top: 100
		}
	});
});

chrome.runtime.onSuspend.addListener(function() { 
	// Do some simple clean-up tasks.
});

chrome.runtime.onInstalled.addListener(function() { 
		// chrome.storage.local.set(object items, function callback);
});
