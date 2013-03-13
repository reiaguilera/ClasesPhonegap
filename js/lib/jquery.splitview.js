(function($,window,undefined){
	$( window.document ).bind('mobileinit', function(){
		if($.support.touch){
			$('html').addClass('touch');
		}
		var $query = $.mobile.media('screen and (min-width: 480px)') && ($.mobile.media('(-webkit-max-device-pixel-ratio: 1.2)') || $.mobile.media('(max--moz-device-pixel-ratio: 1.2)'));
		$.support.splitview = ($query || ($.mobile.browser.ie && $(this).width() >= 480)) && $.mobile.ajaxEnabled;
		if ($.support.splitview) {
			$('html').addClass('splitview');
			$(function() {
				$('div:jqmData(role="panel")').addClass('ui-mobile-viewport ui-panel');
				var firstPageMain=$('div:jqmData(id="main") > div:jqmData(role="page"):first');
				if( !$.mobile.hashListeningEnabled || !$.mobile.path.stripHash( location.hash ) ){
					var $container=$('div:jqmData(id="main")');
					$.mobile.firstPage = firstPageMain;
					$.mobile.pageContainer = $container;
					$(window).trigger('pagecontainercreate');
					$.mobile.changePage(firstPageMain, {transition:'none', changeHash:false, pageContainer:$container});
					$.mobile.activePage=undefined;
				}
				$(window).trigger('orientationchange');
				setTimeout(function(){
					$.mobile.firstPage = firstPageMain;
				}, 100)
			}); //end window.ready()
			var $window = $( window ),
			$html = $( 'html' ),
			$head = $( 'head' ),
			$base = $head.children( "base" ),
			$activeClickedLink = null,
			documentUrl = $.mobile.path.parseUrl( location.href ),
			documentBase = $base.length ? $.mobile.path.parseUrl( $.mobile.path.makeUrlAbsolute( $base.attr( "href" ), documentUrl.href ) ) : documentUrl,
			getScreenHeight = $.mobile.getScreenHeight;
			function removeActiveLinkClass( forceRemoval ) {
				if ( !!$activeClickedLink && ( !$activeClickedLink.closest( "." + $.mobile.activePageClass ).length || forceRemoval ) ) {
					$activeClickedLink.removeClass( $.mobile.activeBtnClass );
				}
				$activeClickedLink = null;
			}
			function findClosestLink(ele){
				while (ele){
					if ( ( typeof ele.nodeName === "string") && ele.nodeName.toLowerCase() == "a"){
						break;
					}
					ele = ele.parentNode;
				}
				return ele;
			}
			function getClosestBaseUrl( ele ){
				var url = $( ele ).closest( ".ui-page" ).jqmData( "url" ),
				base = documentBase.hrefNoHash;
				if ( !url || !$.mobile.path.isPath( url ) ) {
					url = base;
				}
				return $.mobile.path.makeUrlAbsolute( url, base);
			}
			function ResetActivePageHeight(container){
				var aPage;
				if(container !== null && typeof container !== 'undefined') {
					aPage = container.find("." + $.mobile.activePageClass);
				} else {
					aPage = $( "." + $.mobile.activePageClass );
				}
				aPage.each(function(i, page){
					page = $(page)
					var pagePadT = parseFloat( page.css( "padding-top" )),
					pagePadB = parseFloat( page.css( "padding-bottom" )),
					pageBorderT = parseFloat( page.css( "border-top-width" )),
					pageBorderB = parseFloat( page.css( "border-bottom-width" ));
					page.css( "min-height", getScreenHeight() - pagePadT - pagePadB - pageBorderT - pageBorderB );
				})
			}
			$.mobile._registerInternalEvents = function(){
				$( document ).delegate("form", "submit", function(event){
					var $this = $( this );
					if( !$.mobile.ajaxEnabled || $this.is( ":jqmData(ajax='false')" ) ||!$this.jqmHijackable().length ){ 
						return; 
					}
					var type = $this.attr("method"),
					target = $this.attr("target"),
					url = $this.attr( "action" ),
					$currPanel=$this.parents('div:jqmData(role="panel")'),
					$currPanelActivePage=$currPanel.children('div.'+$.mobile.activePageClass);
					if ( !url ) {
						url = getClosestBaseUrl( $this );
						if ( url === documentBase.hrefNoHash ) {
							url = documentUrl.hrefNoSearch;
						}
					}
					url = $.mobile.path.makeUrlAbsolute(  url, getClosestBaseUrl($this) );
					if( ( $.mobile.path.isExternal( url ) && !path.isPermittedCrossDomainRequest( documentUrl, url ) ) || target ) {
						return;
					}
					$.mobile.activePage=$currPanelActivePage;
					$.mobile.changePage(
						url, 
						{
							type:       type && type.length && type.toLowerCase() || "get",
							data:       $this.serialize(),
							transition: $this.jqmData("transition"),
							reverse:  $this.jqmData("direction") === "reverse",
							reloadPage: true,
							pageContainer:$currPanel
						}
					);
					event.preventDefault();
				});
				$( document ).bind( "vclick", function( event ) {
					if ( event.which > 1 || !$.mobile.linkBindingEnabled ) {
						return;
					}
					var link = findClosestLink( event.target );
					if ( !$( link ).jqmHijackable().length ) {
						return;
					}
					if ( link ) {
						if ( $.mobile.path.parseUrl( link.getAttribute( "href" ) || "#" ).hash !== "#" ) {
							removeActiveLinkClass( true );
							$activeClickedLink = $( link ).closest( ".ui-btn" ).not( ".ui-disabled" )
							$activeClickedLink.addClass( $.mobile.activeBtnClass );
							// $( "." + $.mobile.activePageClass + " .ui-btn" ).not( link ).blur();
						}
					}
				});
				$(document).bind( "click", function(event) {
					if ( !$.mobile.linkBindingEnabled ) {
						return;
					}
					var link = findClosestLink(event.target),
					$link = $( link ), 
					httpCleanup;
					if (!link || event.which > 1 || !$link.jqmHijackable().length ){
						return;
					}
					httpCleanup = function() {
						window.setTimeout(function() { removeActiveLinkClass( true ); })
					}
					//if there's a data-rel=back attr, go back in history
					if( $link.is( ":jqmData(rel='back')" ) ) {
						$.mobile.back();
						return false;
					}
					var baseUrl = getClosestBaseUrl( $link ),
					href = $.mobile.path.makeUrlAbsolute( $link.attr( "href" ) || "#", baseUrl ); 
					if( !$.mobile.ajaxEnabled && !$.mobile.path.isEmbeddedPage( href ) ) {
						httpCleanup();
						return;
					}
					if ( href.search( "#" ) !== -1 ) {
						href = href.replace( /[^#]*#/, "" );
						if ( !href ) {
							event.preventDefault();
							return;
						} else if ( $.mobile.path.isPath( href ) ) {
							href = $.mobile.path.makeUrlAbsolute( href, baseUrl );
						} else {
							href = $.mobile.path.makeUrlAbsolute( "#" + href, documentUrl.hrefNoHash );
						}
					}
					var useDefaultUrlHandling = $link.is( "[rel='external']" ) || $link.is( ":jqmData(ajax='false')" ) || $link.is( "[target]" ),
//					isCrossDomainPageLoad = ( $.mobile.allowCrossDomainPages && documentUrl.protocol === "file:" && href.search( /^https?:/ ) != -1 ),
					isExternal = useDefaultUrlHandling || ( $.mobile.path.isExternal( href ) && !$.mobile.path.isPermittedCrossDomainRequest( documentUrl, href ) ),
					isRefresh=$link.jqmData('refresh'),
					$targetPanel=$link.jqmData('panel'),
					$targetContainer=$('div:jqmData(id="'+$targetPanel+'")'),
					$targetPanelActivePage=$targetContainer.children('div.'+$.mobile.activePageClass),
					$currPanel=$link.parents('div:jqmData(role="panel")'),
					//not sure we need this. if you want the container of the element that triggered this event, $currPanel 
					$currContainer=$.mobile.pageContainer, 
					$currPanelActivePage=$currPanel.children('div.'+$.mobile.activePageClass),
					url=$.mobile.path.stripHash($link.attr("href")),
					from = null;
					$('.ui-btn.'+$.mobile.activeBtnClass).removeClass($.mobile.activeBtnClass);
					$activeClickedLink = $link.closest( ".ui-btn" ).addClass($.mobile.activeBtnClass);
					if( isExternal ) {
						httpCleanup();
						return;
					}
					var transitionVal = $link.jqmData( "transition" ), reverseVal = $link.jqmData("direction") === "reverse" || $link.jqmData( "back" ),
					role = $link.attr( "data-" + $.mobile.ns + "rel" ) || undefined,          
					hash = $currPanel.jqmData('hash');
					if ($targetPanelActivePage.attr('data-url') == url || $currPanelActivePage.attr('data-url') == url) {
						if (isRefresh) { //then changePage below because it's a pageRefresh request
							$.mobile.changePage(href, {fromPage:from, transition:'fade', reverse:reverseVal, changeHash:false, pageContainer:$targetContainer, reloadPage:isRefresh, role:role, link:$link});
						}else { //else preventDefault and return
							event.preventDefault();
							return;
						}
					}else if ($targetPanel && $targetPanel!=$link.parents('div:jqmData(role="panel")')) {
						var from=$targetPanelActivePage;
						$.mobile.pageContainer=$targetContainer;
						$.mobile.changePage(href, {fromPage:from, transition:transitionVal, reverse:reverseVal, pageContainer:$targetContainer, role:role, link:$link});
					}else {
						var from=$currPanelActivePage;
						$.mobile.pageContainer=$currPanel;
						var hashChange= (hash == 'false' || hash == 'crumbs')? false : true;
						$.mobile.changePage(href, {fromPage:from, transition:transitionVal, reverse:reverseVal, changeHash:hashChange, pageContainer:$currPanel, role: role, link: $link});
						$.mobile.activePage=$('div:jqmData(id="main") > div.'+$.mobile.activePageClass);
					}
					event.preventDefault();
					event.stopPropagation();
				});
				$( document ).delegate( ".ui-page", "pageshow.prefetch", function(){
					var urls = [],
					$thisPageContainer = $(this).parents('div:jqmData(role="panel")');
					$( this ).find( "a:jqmData(prefetch)" ).each(function(){
						var url = $( this ).attr( "href" ),
						panel = $(this).jqmData('panel'),
						container = panel.length? $('div:jqmData(id="'+panel+'")') : $thisPageContainer;
						if ( url && $.inArray( url, urls ) === -1 ) {
							urls.push( url );
							$.mobile.loadPage( url, {pageContainer: container} );
						}
					});
				});
				$.mobile._handleHashChange = function( hash ) {
					var to = $.mobile.path.stripHash( hash ),
					transition = $.mobile.urlHistory.stack.length === 0 ? "none" : undefined,
					navEvent = new $.Event( "navigate" ),
					$mainPanel=$('div:jqmData(id="main")'),
					$mainPanelFirstPage=$mainPanel.children('div:jqmData(role="page"):first'),
					$mainPanelActivePage=$mainPanel.children('div.ui-page-active'),
					$menuPanel=$('div:jqmData(id="menu")'),
					$menuPanelFirstPage=$menuPanel.children('div:jqmData(role="page"):first'),
					$menuPanelActivePage=$menuPanel.children('div.ui-page-active'),
					dialogHashKey = "&ui-state=dialog",
					changePageOptions = {
						transition: transition,
						changeHash: false,
						fromHashChange: true,
						pageContainer: $mainPanel
					};
					if ( 0 === $.mobile.urlHistory.stack.length ) {
						$.mobile.urlHistory.initialDst = to;
					}
					$.mobile.pageContainer.trigger( navEvent );
					if ( navEvent.isDefaultPrevented() ) {
						return;
					}
					if( !$.mobile.hashListeningEnabled || $.mobile.urlHistory.ignoreNextHashChange ){
						$.mobile.urlHistory.ignoreNextHashChange = false;
						return;
					}
					if( $.mobile.urlHistory.stack.length > 1 && to.indexOf( dialogHashKey ) > -1 && $.mobile.urlHistory.initialDst !== to ) {
						if(!$.mobile.activePage.is( ".ui-dialog" )) {
							$.mobile.urlHistory.directHashChange({
								currentUrl: to,
								isBack: function() { window.history.back(); },
								isForward: function() { window.history.forward(); }
							});
							return;
						} else {
							urlHistory.directHashChange({
								currentUrl: to,
								either: function( isBack ) {
									var active = $.mobile.urlHistory.getActive();
									to = active.pageUrl;
									$.extend( changePageOptions, {
										role: active.role,
										transition:  active.transition,
										reverse: isBack
									});
								}
							});
						}
					}
					if ( to ){
						to = ( typeof to === "string" && !$.mobile.path.isPath( to ) ) ? ( $.mobile.path.makeUrlAbsolute( '#' + to, documentBase ) ) : to;
						//if this is initial deep-linked page setup, then changePage sidemenu as well
						if (!$('div.ui-page-active').length) {
							$menuPanelFirstPage='#'+$menuPanelFirstPage.attr('id');
							$.mobile.changePage($menuPanelFirstPage, {transition:'none', reverse:true, changeHash:false, fromHashChange:false, pageContainer:$menuPanel});
							$.mobile.activePage=undefined;
						}
						$.mobile.activePage=$mainPanelActivePage.length? $mainPanelActivePage : undefined;
						$.mobile.changePage(to, changePageOptions );
					} else {
						//there's no hash, go to the first page in the main panel.
						$.mobile.activePage=$mainPanelActivePage? $mainPanelActivePage : undefined;
						$.mobile.changePage( $mainPanelFirstPage, changePageOptions ); 
					}
				};
				$(window).bind( "hashchange", function( e, triggered ) {
					$.mobile._handleHashChange( location.hash );
				});
				$( document ).bind( "pageshow.resetPageHeight", function(e){
					var container = $(e.target).parents('div:jqmData(role="panel")');
					ResetActivePageHeight(container); 
				});
				$( window ).bind( "throttledresize.resetPageHeight", ResetActivePageHeight() );
			}; //end _registerInternalEvents
			_orientationHandler = function(event){
				var $menu=$('div:jqmData(id="menu")'),
				$main=$('div:jqmData(id="main")'),
				$mainHeader=$main.find('div.'+$.mobile.activePageClass+'> div:jqmData(role="header")'),
				$window=$(window);
				function popoverBtn(header) {
					if(!header.children('.popover-btn').length){
						if(header.children('a.ui-btn-left').length){
							header.children('a.ui-btn-left').replaceWith('<a class="popover-btn">Menu</a>');
							header.children('a.popover-btn').addClass('ui-btn-left').buttonMarkup();
						}else{
							header.prepend('<a class="popover-btn">Menu</a>');
							header.children('a.popover-btn').addClass('ui-btn-left').buttonMarkup()          
						}
					}
				}
				function replaceBackBtn(header) {
					if($.mobile.urlHistory.stack.length > 1 && !header.children('a:jqmData(rel="back")').length && header.jqmData('backbtn')!=false){ 
						header.prepend("<a href='#' class='ui-btn-left' data-"+ $.mobile.ns +"rel='back' data-"+ $.mobile.ns +"icon='arrow-l'>Back</a>" );
						header.children('a:jqmData(rel="back")').buttonMarkup();
					}
				};
				function popover(){
					$menu.addClass('panel-popover').removeClass('ui-panel-left').css({'width':'25%', 'min-width':'250px', 'display':'', 'overflow-x':'visible'});     
					if(!$menu.children('.popover_triangle').length){ 
						$menu.prepend('<div class="popover_triangle"></div>'); 
					}
					$menu.children('.' + $.activePageClass).css('min-height', '100%');
					$main.removeClass('ui-panel-right').css('width', '');
					popoverBtn($mainHeader);
					$main.undelegate('div:jqmData(role="page")', 'pagebeforeshow.splitview');
					$main.delegate('div:jqmData(role="page")','pagebeforeshow.popover', function(){
						var $thisHeader=$(this).children('div:jqmData(role="header")');
						popoverBtn($thisHeader);
					});
				};
				function splitView(){
					$menu.removeClass('panel-popover').addClass('ui-panel-left').css({'width':'25%', 'min-width':'250px', 'display':''});
					$menu.children('.popover_triangle').remove();
					$main.addClass('ui-panel-right').width(function(){
						return $(window).width()-$('div:jqmData(id="menu")').width();  
					});
					$mainHeader.children('.popover-btn').remove();
					// replaceBackBtn($mainHeader);
					$main.undelegate('div:jqmData(role="page")', 'pagebeforeshow.popover');
					$main.delegate('div:jqmData(role="page")', 'pagebeforeshow.splitview', function(){
						var $thisHeader=$(this).children('div:jqmData(role="header")');
						$thisHeader.children('.popover-btn').remove();
						// replaceBackBtn($thisHeader);
					});
				}
				if(event.orientation){
					if(event.orientation == 'portrait'){
						popover();            
					}else if(event.orientation == 'landscape') {
						splitView();
					} 
				}else if($window.width() < 768 && $window.width() > 480){
					popover();
				}else if($window.width() > 768){
					splitView();
				}
			};
			$(window).bind('orientationchange', _orientationHandler);
			$(window).bind('throttledresize', _orientationHandler);
			$('.popover-btn').live('click', function(e){ 
				e.preventDefault(); 
				$('.panel-popover').fadeToggle('fast'); 
				if ($('.popover-btn').hasClass($.mobile.activeBtnClass)) { 
					$('.popover-btn').removeClass($.mobile.activeBtnClass); 
				} else { 
					$('.popover-btn').addClass($.mobile.activeBtnClass); 
				} 
			});
			$('body').live('click', function(event) { 
				if (!$(event.target).closest('.panel-popover').length && !$(event.target).closest('.popover-btn').length) { 
					$(".panel-popover").stop(true, true).hide(); 
					$('.popover-btn').removeClass($.mobile.activeBtnClass); 
				}; 
			});
			$('div:jqmData(role="page")').live('pagebeforeshow.crumbs', function(event, data){
				var $this = $(this);
				if($this.jqmData('hash') == 'crumbs' || $this.parents('div:jqmData(role="panel")').data('hash') == 'crumbs'){
					if($this.jqmData('hash')!=false && $this.find('.ui-crumbs').length < 1){
						var $header=$this.find('div:jqmData(role="header")');
						backBtn = $this.find('a:jqmData(rel="back")');
						if(data.prevPage.jqmData('url') == $this.jqmData('url')){  //if it's a page refresh
							var prevCrumb = data.prevPage.find('.ui-crumbs');
							crumbify(backBtn, prevCrumb.attr('href'), prevCrumb.find('.ui-btn-text').html());
						}else if($.mobile.urlHistory.stack.length > 0) {
							var text = data.prevPage.find('div:jqmData(role="header") .ui-title').html();
							crumbify(backBtn, '#'+data.prevPage.jqmData('url'), text);
						}else if(backBtn.length && $.mobile.urlHistory.stack.length <= 1) {
							backBtn.remove();
						}
					}
				}
				function crumbify(button, href, text){
					if(!button.length) {
						$this.find('div:jqmData(role="header")').prepend('<a class="ui-crumbs ui-btn-left" data-icon="arrow-l"></a>');
						button=$header.children('.ui-crumbs').buttonMarkup();
					}
					button.removeAttr('data-rel').jqmData('direction','reverse').addClass('ui-crumbs').attr('href',href);
					button.find('.ui-btn-text').html(text);
				}
			});
			$('div:jqmData(role="panel")').live('pagechange.context', function(){
				var $this=$(this),
				$currPanelActivePage = $this.children('.' + $.mobile.activePageClass),
				panelContextSelector = $this.jqmData('context'),
				pageContextSelector = $currPanelActivePage.jqmData('context'),
				contextSelector= pageContextSelector ? pageContextSelector : panelContextSelector;
				//if you pass a hash into data-context, you need to specify panel, url and a boolean value for refresh
				if($.type(contextSelector) === 'object') {
					var $targetContainer=$('div:jqmData(id="'+contextSelector.panel+'")'),
					$targetPanelActivePage=$targetContainer.children('div.'+$.mobile.activePageClass),
					isRefresh = contextSelector.refresh === undefined ? false : contextSelector.refresh;
					if(($targetPanelActivePage.jqmData('url') == contextSelector.url && contextSelector.refresh)||(!contextSelector.refresh && $targetPanelActivePage.jqmData('url') != contextSelector.url)){    
						$.mobile.changePage(contextSelector.url, options={transition:'fade', changeHash:false, pageContainer:$targetContainer, reloadPage:isRefresh});
					}
				}else if(contextSelector && $currPanelActivePage.find(contextSelector).length){
					$currPanelActivePage.find(contextSelector).trigger('click');
				}
			});
		}else {
			$(function(){
				$('div:jqmData(role="panel")').each(function(){
					var $this = $(this);
					$this.replaceWith($this.html());
				})
			});
		}
	});
})(jQuery,window);