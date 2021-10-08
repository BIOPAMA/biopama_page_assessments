(function( $ ){
	// template object
	avatarTemplate = {}
	avatarTemplate.template = { name: '', version: ''}
  	avatarTemplate.url = {}
  	avatarTemplate.menu = {}
  	avatarTemplate.image = {}
  	avatarTemplate.layout = {}
  	avatarTemplate.settingPanel = {}
  	
  	avatarTemplate.url.getVar = function (url) 
  	{
  		var vars = {},
	    	parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { vars[key] = value; });
	    return vars;
	}
  	avatarTemplate.image.initEffects = function () {
  		avatarImage.effects.overlay();
  	}
  	avatarTemplate.layout.init = function () {
  		avatarLayout.functions.sameHeightCols($('#avatar-body-middle > div:not(".clearbreak")'));
  	}
	avatarTemplate.settingPanel.init = function () {
		avatarSettingPanel.init();
  		avatarSettingPanel.background.change('#avatar-settings .bg-image .item'); 
  	}
})( jQuery );
(function( $ ){
	avatarImage = {}
	avatarImage.effects = {}
	avatarImage.effects.overlay = function () 
	{
		$("div[class*='img-']").each(function()
		{
			var wrap = $(this),
			wh = wrap.height();
			ww = wrap.width();	
			wrap.find('img').each(function(){
				var img = $(this);
				ih = img.height();
				iw = img.width();
				img.css({top: (wh - ih)/2 + 'px', left : (ww - iw)/2 + 'px'});
			});
		});
	}
})( jQuery );
(function( $ ){
	avatarLayout = {}
	avatarLayout.functions = {}
	avatarLayout.functions.sameHeightCols = function (els) 
	{
		function calSize() 
		{
			if($(window).width() > 767) 
			{ 
				if(els.length > 0) 
				{
					var $height = 0;
					
					els.each(function()
					{
						$h = $(this).height();				
						if ($h > $height) {
							$height = $h;
						}
					});	
					
					els.each(function(){
						$(this).css('min-height', $height);
					});
				}
			} else {
				els.each(function(){
						$(this).css('min-height', '');
				});
			}
		}
		$(window).load(function () {
			calSize();
		});
		
		$(window).resize(function(){
			calSize();
		});
	}
})( jQuery );
(function( $ ){
	avatarSettingPanel = {}
	avatarSettingPanel.background = {}
	avatarSettingPanel.header = {}
	avatarSettingPanel.body = {}
	avatarSettingPanel.link = {}
	avatarSettingPanel.showcase = {}
	
	avatarSettingPanel.init = function () 
	{
		var panelSetting = $('#avatar-settings');
		$('#avatar-settings #close').click(function()
		{
			if (panelSetting.css('margin-top') == '0px') {
				panelSetting.animate({ 'margin-top': '-57px'}, 300);	
			} else {
				panelSetting.animate({ 'margin-top': '0'}, 300);
			}
		});
	}
	
	avatarSettingPanel.reset = function () 
	{
		var allCookies = document.cookie.split(';');
		
		for (var i=0;i<allCookies.length;i++) 
		{
			var cookiePair = allCookies[i].split('=');
			if (cookiePair[0].indexOf(avatarTemplate.template.name) != -1) {
				document.cookie = cookiePair[0] + '=;path=/';
				window.location.reload();
			}
		}
	}
	
	avatarSettingPanel.background.change = function (selector) 
	{
		$(selector).each(function ()
		{
			var self = $(this);
			self.click (function()
			{
				var bg = self.css('background-image');
				
				if (/opera/i.test(navigator.userAgent)){
					bg =  encodeURIComponent(bg);
				}
				
				document.cookie = avatarTemplate.template.name + '-background-image' + '=' + bg + ';path=/';
				$('body').css('background-image', self.css('background-image'));	
			});	
		});	
	}
	
	avatarSettingPanel.header.color = function (selector) 
	{
		$(':header').each (function () {
			$(this).css('color', selector.value);	
		});
		document.cookie = avatarTemplate.template.name + '-header-color' + '=' + selector.value + ';path=/';
	}
	
	avatarSettingPanel.body.color = function (selector) 
	{
		$('body').css('color', selector.value);	
		document.cookie = avatarTemplate.template.name + '-body-color' + '=' + selector.value + ';path=/';
	}
	
	avatarSettingPanel.showcase.change = function (selector) 
  	{
  		var self = avatarTemplate;
		document.cookie = avatarTemplate.template.name + '-showcase' + '=' + selector + ';path=/';
		window.location.reload();
   	}
})( jQuery );
(function( $ ){
	$(document).ready(function() {
	    $(".lazy").lazyload({
	    	effect: "fadeIn",
	    	skip_invisible : false,
	    	failure_limit : 20
	    });
	});
})( jQuery );