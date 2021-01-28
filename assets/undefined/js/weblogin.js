function Login(){var o,s={CtrlEnter:10,Enter:13},a=StorageFactory(StorageFactory.eStorageType.session),r=apiIM(window.jQuery);function i(){}return{Init:function(){function e(e){var t,n=urlDecode(e),o={};for(t in n)Object.prototype.hasOwnProperty.call(n,t)&&("evt"===t?o.evt=n[t]:"dcid"===t&&(o.dcid=n[t]));return isNullOrUndefined(o.evt)&&isNullOrUndefined(o.dcid)?null:o}var t,n;o=new RevealPassword,window.externalEventsCallbacks.fire("login-view",(n=urlDecode(window.location.search),isNullOrUndefined(n.returnUrl)?e(window.location.search):e(n.returnUrl))),window.adjustUiPerDevice&&(adjustUiPerDevice(document.getElementById("txtUName")),adjustUiPerDevice(document.getElementById("txtPass"))),CookieHandler.CookiesEnabled()||popupManager.showCookiesDisabledPopUp(),t=$(".validation-summary-errors li"),n=t.text(),t.html(n),$(document).click(function(){window.externalEventsCallbacks.fire("login-interaction")}),$("#LoginForm").on("keyup.validateField","input",function(e){e.which===s.CtrlEnter||e.which===s.Enter?$("#LoginForm").submit():($("#LoginForm").validate().element(e.target||e.srcElement),e=$("#LoginForm").validate(),$(".userNameLine").removeClass("error"),$.each(e.errorList,function(e,t){$(t.element).parent().addClass("error")}))}),$("#imgRefresh").click(function(){$.ajax({async:!1,url:Model.jsVirtualPath+"/CaptchaImage/Generate/",type:"POST",success:function(e){$("#captcha").replaceWith(e)}})}),$("#btnOkLogin").click(function(e){e.preventDefault(),o.HidePasswordText(),$("#LoginForm").submit()}),$("#autologin").change(function(){a.setItem("isAutologin",$("#autologin").is(":checked"))}),$("#LoginForm").submit(function(){return!$("#btnOkLogin").is(".disabled")&&($("#LoginForm").valid()&&$("#btnOkLogin").addClass("disabled"),a.setItem("loginSubmitClicked",!0),window.externalEventsCallbacks.fire("login-submit",{isAutologin:a.getItem("isAutologin"),type:"password"}),$("#txtUName").val($.trim($("#txtUName").val())),void function(){{var e;StorageFactory.isSupported(StorageFactory.eStorageType.local)&&(e=StorageFactory(StorageFactory.eStorageType.local),$("#saveusername").is(":checked")?e.setItem("un",$("#txtUName").val()):e.removeItem("un"))}}())}),o.Init({passwordInput:$(".password-input"),icon:$("#passwordIcon"),form:$("#LoginForm")}),function(){{var e;!StorageFactory.isSupported(StorageFactory.eStorageType.local)||(e=StorageFactory(StorageFactory.eStorageType.local).getItem("un"))&&$("#txtUName").val(e)}}(),r.InitAllFallback(Model.InteractiveMessagesTokenUrl,Model.InteractiveMessagesUrl,Model.InteractiveMessagesLanguage,Model.RequestInterval,i,0,"false",""),a.setItem("isCustomerFirstCall",IMRequestIntervalModes.Login),a.setItem("isAutologin",!1)}}}function RevealPassword(){var t,n,o,s,a={passwordTypeText:"password-type-text",passwordInput:"password-input",icoWbReveal:"ico-wb-reveal",icoWbRevealOff:"ico-wb-reveal-off",icoPassBlue:"ico-pass-blue"},r={enter:13,ctrlEnter:10};function i(){C(n)||(t.val(n.val()),l(),o.removeClass(a.icoWbRevealOff).addClass(a.icoWbReveal))}function l(){C(n)||(n.off(".RevealPassword"),n.remove(),n=null)}function c(e){""===n.val()?(l(),t.val("").prev().removeClass(a.icoPassBlue).removeClass(a.icoWbRevealOff).addClass(a.icoWbReveal)):(e=e).which!=r.ctrlEnter&&e.which!=r.enter||(e.preventDefault(),t.val(n.val()),l(),s.submit())}function e(){var e;e={width:t.width(),height:t.height(),top:t.offset().top,left:t.offset().left},(n=t.clone().attr("type","text").removeAttr("id").addClass(a.passwordTypeText).removeClass(a.passwordInput).insertAfter(s).offset({top:e.top,left:e.left}).innerWidth(t.innerWidth()).innerHeight(t.innerHeight())).on("keyup.RevealPassword",c),o.removeClass(a.icoWbReveal).addClass(a.icoWbRevealOff),I()&&n.val(t.val())}function u(){I()&&t.val(n.val()),l(),o.removeClass(a.icoWbRevealOff).addClass(a.icoWbReveal)}function p(){""!==t.val()&&(o.hasClass(a.icoWbReveal)?e:u)()}function v(){var e=t.css("box-shadow");""!==t.val()||Browser.isChrome()&&0<=e.indexOf("inset")?t.prev().addClass(a.icoPassBlue):t.prev().removeClass(a.icoPassBlue).removeClass(a.icoWbRevealOff).addClass(a.icoWbReveal)}function I(){return!C(n)&&0<n.length&&""!==n.val()}function C(e){return null==e}return{Init:function(e){t=e.passwordInput,o=e.icon,s=e.form,o.on("click.RevealPassword",p),t.on("keyup.RevealPassword",v),$(window).on("orientationchange.RevealPassword",i),setTimeout(v,100)},HidePasswordText:u,Dispose:function(){o.off("click.RevealPassword"),t.off("keyup.RevealPassword"),$(window).off("orientationchange.RevealPassword")}}}$(document).ready(function(){(new Login).Init()});var _JSON2=JSON;function apiIM(u){var o={};function p(e,t,n,o,s){e.onErrorIM_Event(a),e.PopupCssClass.OverlayClass="bg_shadow",e.PopupCssClass.PopupClass="popupContainer",e.PopupCssClass.CloseClass="closePopUP","false"==o&&(e.onReportIMAction_Event(),e.onReportIMStatus_Event()),t.init(e),t.onCompleteShowIM_Subscribe(),t.onPopupClose_Subscribe(),"false"==o&&(t.onIMUIAction_Subscribe(t.IMUIActionType.Deposit,n.deposit),t.onIMUIAction_Subscribe(t.IMUIActionType.Accept,n.accept),t.onIMUIAction_Subscribe(t.IMUIActionType.WalkThroughDeal,n.walkthrough),t.onIMUIAction_Subscribe(t.IMUIActionType.PrivacyPolicy,n.privacypolicy),t.onIMUIAction_Subscribe(t.IMUIActionType.imClosedDeals,n.imClosedDeals),t.onIMUIAction_Subscribe(t.IMUIActionType.imOpenDeals,n.imOpenDeals),t.onIMUIAction_Subscribe(t.IMUIActionType.imNewDeal,n.imNewDeal)),t.onSmartBanner_Subscribe(s)}u.publish=function(e,t){o[e]&&u.each(o[e],function(){try{this.apply(u,t||[])}catch(e){}})},u.subscribe=function(e,t){return o[e]||(o[e]=[]),o[e].push(t),[e,t]},u.unsubscribe=function(t){var n=t[0];o[n]&&u.each(o[n],function(e){this==t[1]&&o[n].splice(e,1)})};var a=function(e,t){};return u.fn.center=function(){return this.css("position","absolute"),this.css("top",(u(window).height()-this.height())/2+u(window).scrollTop()+"px"),this.css("left",(u(window).width()-this.width())/2+u(window).scrollLeft()+"px"),this},u.fn.outerHTML=function(e){return e?this.before(e).remove():u("<p>").append(this.eq(0).clone()).html()},{InitAll:function(t,n,o,s,a,r,i,l){u(document).ready(function(){var e=new IMdataService;p(e,new IMlayoutService,a,i,l),e.init(t,n,o,s,r,i)})},InitIMInitialDataManager:function(e,t,n){var o=new IMdataService,s=!1;null!=e&&(s=/^[a-z0-9]+$/i.test(e)),1==s&&o.TrackinigDetailsGet(n,t,e)},InitAllFallback:function(n,o,s,a,r,i,l,c){u(document).ready(function(){var t=new IMdataService,e=new IMlayoutService;p(t,e,r,l,c);t.getTokenIM(n,function(e){t.init(e,o,s,a,i,l)})})}}}function removeByValue(e,t,n){if(null!=e)for(var o=0;o<e.length;o++)e[o][t]==n&&e.splice(o,1);return e}window.IMContainer={currentActiveProposition:null};var IMdataService=function(){var Token=null,TokenUrl=null,ServiceBase=null,RetryInterval=1e3,LanguageId=null,Req=null,self=this,Current=0,ItemsCount=0,MaxRetries=60,CurrentRetry=0,RequestInterval=15e3,RequestIntervalMode=1,Interval=0,IsAnnoncement=!1,CurrentRowVersion=null,currentActiveProposition=null,CustomerTrackingDetailsRetries=5,PopupCssClass={PopupClass:"popupContainer",CloseClass:"closePopUP",OverlayClass:"bg_shadow",EnvelopePopupClass:".new-msg-action",EnvelopePopupClassMobile:".envelope a",SmartBannerWideClass:"smartBannerWide",SmartBannerSmallClass:"smartBannerSmall",smartBannerWideViewOfferClass:"details",smartBannerSmallViewOfferClass:"smartBannerSmall"},Events={onCompleteGetActiveIM:"onCompleteGetActiveIM",onCompleteShowIM:"onCompleteShowIM",onErrorIM:"onErrorIM",onPopupClose_Event:"onPopupClose",onReportIMAction:"onReportIMAction",onReportIMStatus:"onReportIMStatus",onSmartBanner:"onSmartBanner",stopGetActiveIMCalls:"onStopGetActiveIMCalls",restartGetActiveIMCalls:"onRestartGetActiveIMCalls"},init=function(t,n,o,s,a,r){ServiceBase=n,LanguageId=o,RequestInterval=s,RequestIntervalMode=a,IsAnnoncement=r,IMclearInterval(Interval);var e=!1;null!=(Token=t)&&(e=/^[a-z0-9]+$/i.test(Token)),1==e&&getActiveIM(Token,n,r),"function"==typeof define&&define.amd&&require(["StateObject!SystemNotificationEvents"],function(e){e.set(Events.stopGetActiveIMCalls,null),e.set(Events.restartGetActiveIMCalls,null),e.subscribe(Events.stopGetActiveIMCalls,function(){IMclearInterval(Interval)}),e.subscribe(Events.restartGetActiveIMCalls,function(){init(t,n,o,s,a,r)})})},proceedNextMessage=function(){Current+1<ItemsCount?(++Current,handleActiveIM()):(RequestIntervalMode=1,0!=Interval&&clearInterval(Interval),Interval=setInterval(function(){getActiveIM(Token,ServiceBase,IsAnnoncement)},RequestInterval))},IMclearInterval=function(e){clearInterval(e)},getTokenIM=function(e,t){$.ajax({url:e,type:"POST",async:!0,success:t})},getDataCORS=function(e,t,n,o){var s=getInternetExplorerVersion(),a=e+"/"+t,r="CustomerTrackingDetailsGet"==t?CustomerTrackingDetailsRetries:null;-1==s||10<=s?getDataIE10(a,n,o,r):8<=s?getDataIE8(a=e+"/xdr/"+t+"XDR",n,o,r):window.external&&getDataIE8(a,n,o,r)};function getDataIE10(n,o,s,a){$.ajax({async:!0,type:"POST",url:n,data:o,contentType:"application/json; charset=utf-8",dataType:"json",processData:!0,crossDomain:!0,success:function(e){var t;null!=s&&(a&&"[]"===e.Response&&0<a?(a=a--,t=getDataIE10.bind(this,n,o,s,a),setTimeout(t,RetryInterval)):s(e))},error:function(e){}})}function getDataIE8(n,o,s,a){var r;!window.XDomainRequest||(r=new XDomainRequest)&&(r.onerror=function(){},r.ontimeout=function(){},r.onprogress=function(){},r.onload=function(){var e,t=r.responseText;null==t||""==t||(e=JSON.parse(t),a&&"[]"===e.Response&&0<a&&(a=a--,t=getDataIE8.bind(this,n,o,s,a),setTimeout(t,RetryInterval)),s(e))},r.timeout=1e4,r.open("POST",n),r.send(JSON.stringify(o)))}var getActiveIM=function(e,t,n){e={RequestToken:e,Mode:RequestIntervalMode,CurrentRowVersion:CurrentRowVersion},e=_JSON2.stringify(e);getDataCORS(t,"GetActiveIM",e,function(){("true"==n?onGetActiveIMAnnoncementComplete:onGetActiveIMComplete).apply(self,arguments)})},onGetActiveIMComplete=function(e){null!=(Req=removeByValue(e,"MessageType","14"))&&""!=Req?(ItemsCount=Req.length,(Current=0)!=Interval&&(clearInterval(Interval),Interval=0),handleActiveIM()):0==Interval&&proceedNextMessage()},onGetActiveIMAnnoncementComplete=function(e){Req=removeByValue(e,"MessageType","17"),Req=removeByValue(Req,"MessageType","19"),Req=removeByValue(Req,"MessageType","21"),Req=removeByValue(Req,"MessageType","31"),Req=removeByValue(Req,"MessageType","32"),null!=(Req=removeByValue(Req,"MessageType","17"))&&""!=Req&&(ItemsCount=Req.length,1==Req[Current=0].ErrorCode&&(0<ItemsCount&&("FullSite"===systemInfo.clientApplicationParams[eClientParams.Device]?require(["StateObject!IM"],function(e){e.update("message","new"),$(document).delegate(PopupCssClass.EnvelopePopupClass,"click",function(){showIM(Req[Current]),e.update("message","no-new")})}):($(PopupCssClass.EnvelopePopupClassMobile).addClass("new"),$(document).delegate(PopupCssClass.EnvelopePopupClassMobile,"click",function(){showIM(Req[Current]),$(PopupCssClass.EnvelopePopupClassMobile).removeClass("new"),$(PopupCssClass.EnvelopePopupClassMobile).addClass("no-new")}))),RequestIntervalMode=1))},handleActiveIM=function(){1==Req[Current].ErrorCode?(17==Req[Current].MessageType&&0==Req[Current].State&&null!=Req[Current].CurrentRowVersion&&(CurrentRowVersion=Req[Current].CurrentRowVersion,currentActiveProposition=Req[Current],IMContainer.currentActiveProposition=Req[Current]),0!=Req[Current].State||31==Req[Current].MessageType||32==Req[Current].MessageType?showIM(Req[Current]):proceedNextMessage(),RequestIntervalMode=1):CurrentRetry+1<MaxRetries&&(setTimeout(function(){getActiveIM(Token,ServiceBase,IsAnnoncement)},RetryInterval),++CurrentRetry)},showIM=function(e){var t;null!=e&&(t={RequestToken:Token,CustomerMessageID:e.CustomerMessageID,LanguageID:LanguageId,IMMetaData:e},t=_JSON2.stringify(t),Req[Current]=e,getDataCORS(ServiceBase,"ShowIM",t,onShowIMComplete))},onShowIMComplete=function(e){null!=e&&""!=e&&Req[Current]&&$.publish(Events.onCompleteShowIM,[e,Req[Current].CustomerMessageID,e.Content,PopupCssClass,Current,ItemsCount,{req:Req}])},ReportIMAction=function(e){null!=Req&&(e={RequestToken:Token,CustomerMessageID:e[0],ActionTypeID:e[1]},e=_JSON2.stringify(e),getDataCORS(ServiceBase,"ReportIMAction",e,function(){onReportIMActionComplete.apply(self,arguments)}))},onReportIMActionComplete=function(e){},onReportIMAction_Event=function(){$.subscribe(Events.onReportIMAction,function(){ReportIMAction(arguments)})},ReportIMStatus=function(e){null!=Req&&(e={RequestToken:Token,CustomerMessageID:e[0],StatusID:e[1]},e=_JSON2.stringify(e),getDataCORS(ServiceBase,"ReportIMStatus",e,function(){onReportIMStatusComplete.apply(self,arguments)}))},onReportIMStatusComplete=function(e){},onReportIMStatus_Event=function(){$.subscribe(Events.onReportIMStatus,function(){ReportIMStatus(arguments)})},onErrorIM_Event=function(e){e&&"function"==typeof e&&$.subscribe(Events.onErrorIM,e)},onCompleteGetActiveIM_Event=function(e){},onCompleteShowIM_Event=function(e){e&&"function"==typeof e&&$.subscribe(Events.onCompleteShowIM,e)},TrackinigDetailsGet=function(callback){var myObject={RequestToken:arguments[2]},json=_JSON2.stringify(myObject),method="CustomerTrackingDetailsGet";getDataCORS(arguments[1],method,json,function(){eval(callback).apply(self,arguments)})},getInternetExplorerVersion=function(){var e,t=-1;return"Microsoft Internet Explorer"==navigator.appName&&(e=navigator.userAgent,null!=new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})").exec(e)&&(t=parseFloat(RegExp.$1))),t};return{init:init,onErrorIM_Event:onErrorIM_Event,onCompleteGetActiveIM_Event:onCompleteGetActiveIM_Event,onCompleteShowIM_Event:onCompleteShowIM_Event,PopupCssClass:PopupCssClass,Current:Current,ItemsCount:ItemsCount,Event_onCompleteShowIM:Events.onCompleteShowIM,Events_onPopupClose_Event:Events.onPopupClose_Event,showIM:showIM,Events_onReportIMAction_Event:Events.onReportIMAction,Events_onReportIMStatus_Event:Events.onReportIMStatus,onReportIMAction_Event:onReportIMAction_Event,onReportIMStatus_Event:onReportIMStatus_Event,proceedNextMessage:proceedNextMessage,IMclearInterval:IMclearInterval,Interval:Interval,getTokenIM:getTokenIM,TrackinigDetailsGet:TrackinigDetailsGet,Events_onSmartBanner_Event:Events.onSmartBanner,IsAnnoncement:IsAnnoncement,CurrentActiveProposition:function(){return IMContainer.currentActiveProposition}}},IMlayoutService=function(){var r,o=0,n={Deposit:"deposit",Notice:"notice",Accept:"accept",WalkThroughDeal:"walkthroughdeal",PrivacyPolicy:"privacypolicy",imClosedDeals:"imClosedDeals",imOpenDeals:"imOpenDeals",imNewDeal:"imNewDeal"},s={Pending:"pending",Displayed:"displayed",Dismissed:"dismissed",Expired:"expired"},a=function(e){var t;switch(e.toLowerCase()){case n.Deposit:t=2;break;case n.Notice:t=3;break;case n.Accept:t=5;break;case n.WalkThroughDeal:t=6;break;case n.PrivacyPolicy:t=7;break;case n.imClosedDeals:t=8;break;case n.imOpenDeals:t=9;break;case n.imNewDeal:t=10;break;default:t=2}null!=o&&0!=o&&$.publish(r.Events_onReportIMAction_Event,[o,t]),$.publish(e,[e])},i=function(e){var t;switch(e.toLowerCase()){case s.Pending:t=0;break;case s.Displayed:t=1;break;case s.Dismissed:t=2;break;case s.Expired:t=3;break;default:t=1}null!=o&&0!=o&&$.publish(r.Events_onReportIMStatus_Event,[o,t]),$.publish(e,[e])},e=function(e){var t,n;o=0,null!=e&&""!=e&&(t=e[4],n=e[5],c(e[2],e[3],e[6].req[t]),o=e[6].req[t].CustomerMessageID,t<n&&++t)},l=function(e){$.publish(r.Events_onPopupClose_Event,e,!0),$("."+r.PopupCssClass.PopupClass).hide(),$("#"+r.PopupCssClass.OverlayClass).hide(),require(["StateObject!IM"],function(e){e.update("IMPopUpVisible",!1)}),r.proceedNextMessage()},c=function(e,t,n){var o,s,a=$("."+t.PopupClass);null!=e&&""!=e?(null!=(o=$(e).filter("link").outerHTML())&&""!=o&&(s=$('link[href*="'+o+' "]').attr("id","im_css"),0==$("#im_css").length||$("#im_css").remove(),$("head").append(s)),31==n.MessageType||32==n.MessageType?(o="",31==n.MessageType?o=t.SmartBannerWideClass:32==n.MessageType&&(o=t.SmartBannerSmallClass),0==r.IsAnnoncement&&(s=new Date(parseInt(n.ExpirationDate.replace("/Date(",""))),$.publish(r.Events_onSmartBanner_Event,[s,n.State,o,n.ContentKey,e,function(){r.showIM(r.CurrentActiveProposition())}])),r.proceedNextMessage()):(a.hide(),$("#"+t.OverlayClass).hide(),a.html(e),require(["StateObject!IM"],function(e){e.update("IMPopUpVisible",{MessageType:n.MessageType})}),setTimeout(function(){a.show(),$("#"+t.OverlayClass).fadeIn(500)},500)),r.IMclearInterval(r.Interval)):r.proceedNextMessage()};return{init:function(e){r=e},showWin:c,onCompleteShowIM_Subscribe:function(){$.subscribe(r.Event_onCompleteShowIM,function(){e(arguments)})},onPopupClose_Subscribe:function(e){e&&"function"==typeof e&&$.subscribe(r.Events_onPopupClose_Event,e),$(document).delegate("."+r.PopupCssClass.CloseClass,"click",function(e){e.stopPropagation(),e.preventDefault(),l()}),$(document).delegate("#"+r.PopupCssClass.CloseClass,"click",function(e){e.stopPropagation(),e.preventDefault(),l()})},onIMUIAction_Subscribe:function(e,t){t&&"function"==typeof t&&($(document).delegate("#"+r.PopupCssClass.PopupClass+" ."+e,"click",function(){a(e),l()}),$.subscribe(e,t))},onIMUIStatus_Subscribe:function(e,t){$(document).delegate("#"+r.PopupCssClass.PopupClass+" ."+e,"click",function(){i(e),$(".notice-box").hide()}),$.subscribe(e,t)},IMUIActionType:n,IMUIStatusType:s,onSmartBanner_Subscribe:function(e){e&&"function"==typeof e&&$.subscribe(r.Events_onSmartBanner_Event,e)}}};
//# sourceMappingURL=weblogin.js.map