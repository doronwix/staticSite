var PaymentRequestBuilderForSC=function(e,n){var o=e,a=n;return{buildMoneyBookersRequest:function(){var t={};return o.split("&")[0].split("-").forEach(function(e){var n=e.split("=");n&&2===n.length&&a.forEach(function(e){n[0]===e.value&&(t[e.name]=n[1])})}),t},buildRequest:function(){var t={};return o.split("&").forEach(function(e){var n=e.split("=");n&&2===n.length&&a.forEach(function(e){n[0]===e.value&&(t[e.name]=n[1])})}),t}}},MoneyBookersSCReturnProcessor=function(){return{process:function(){window.environmentData.RootPath="../../";var e=new PaymentRequestBuilderForSC(decodeURIComponent(window.location.search.substring(1)),[{name:"amount",value:"a"},{name:"depositCurrency",value:"cId"},{name:"depositCurrencyName",value:"cN"}]).buildMoneyBookersRequest(),n=new TDALDeposit,t=new PaymentResultProcessor(window.InitConfiguration.PaymentInNewWindowConfiguration,$.noop,e);n.getPaymentStatus(t.OnDepositPaymentStatusTimeout).then(t.ProcessPaymentFinalResponse).fail(emptyFn).done()}}};
//# sourceMappingURL=desktopmbwrapper.js.map