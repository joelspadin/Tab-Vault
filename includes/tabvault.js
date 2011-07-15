// --UserScript--
// @include *
// --/UserScript--

var element;

opera.extension.onmessage = function(e) {
	switch (e.data.action) {
		case 'show':
			if (element)
				return;
			
			var maxWidth = window.innerWidth - e.data.right - 50;
			var el = document.createElement('div');
			el.style.position = 'absolute';
			el.style.textAlign = 'center';
			el.style.fontSize = '14px';
			el.style.padding = '20px';
			el.style.margin = 'auto';
			el.style.maxWidth = maxWidth + 'px';
			el.style.borderRadius = '10px';
			el.style.color = '#fff';
			el.style.backgroundColor = 'rgba(0,0,0,0.75)';
			el.style.opacity = '0';
			el.style.zIndex = '9999999';
			if (e.data.anim)
				el.style.OTransition = 'opacity 0.3s';
			
			var title = document.createElement('span');
			title.textContent = e.data.title;
			title.style.display = 'block';
			title.style.fontWeight = 'bold';
			title.style.marginBottom = '8px';
			
			var msg = document.createElement('span');
			msg.textContent = e.data.msg;
			
			el.appendChild(title);
			el.appendChild(msg);
			document.body.appendChild(el);
			
			var elHeight = el.offsetHeight;
			var elWidth = el.offsetWidth;
			var w = Math.min(e.data.right, Math.max(e.data.right / 2, e.data.right * (elWidth + 50) / maxWidth));
			el.style.top = window.scrollY + ((window.innerHeight - elHeight) / 2) + 'px';
			el.style.left = window.scrollX + ((window.innerWidth - elWidth - w) / 2) + 'px';
			
			el.style.opacity = '1';
			
			element = el;
			break;
			
		case 'hide':
			if (!element)
				return;
			
			element.style.opacity = '0';
			var el = element;
			
			setTimeout(function() {
				el.parentNode.removeChild(el);
				element = null;
			}, 300);
			break;
	}
}

window.opera.tabvault = new function TabVault() {
	this.save = function(pass, url, title, icon) {
		opera.extension.postMessage({
			action: 'external_save',
			pass: pass,
			url: url,
			title: title,
			icon: icon,
		});
	}
}
