!function(l){l.extend(l.fn,{validate:function(t){if(this.length){var i=l.data(this[0],"validator");if(i)return i;if(this.attr("novalidate","novalidate"),i=new l.validator(t,this[0]),l.data(this[0],"validator",i),i.settings.onsubmit){var e=this.find("input, button");e.filter(".cancel").click(function(){i.cancelSubmit=!0}),i.settings.submitHandler&&e.filter(":submit").click(function(){i.submitButton=this}),this.submit(function(t){function e(){if(i.settings.submitHandler){if(i.submitButton)var t=l("<input type='hidden'/>").attr("name",i.submitButton.name).val(i.submitButton.value).appendTo(i.currentForm);return i.settings.submitHandler.call(i,i.currentForm),i.submitButton&&t.remove(),!1}return!0}return i.settings.debug&&t.preventDefault(),i.cancelSubmit?(i.cancelSubmit=!1,e()):i.form()?i.pendingRequest?!(i.formSubmitted=!0):e():(i.focusInvalid(),!1)})}return i}t&&t.debug&&window.console&&console.warn("nothing selected, can't validate, returning nothing")},valid:function(){if(l(this[0]).is("form"))return this.validate().form();var t=!0,e=l(this[0].form).validate();return this.each(function(){t&=e.element(this)}),t},removeAttrs:function(t){var i={},n=this;return l.each(t.split(/\s/),function(t,e){i[e]=n.attr(e),n.removeAttr(e)}),i},rules:function(t,e){var i=this[0];if(t){var n=l.data(i.form,"validator").settings,a=n.rules,s=l.validator.staticRules(i);switch(t){case"add":l.extend(s,l.validator.normalizeRule(e)),a[i.name]=s,e.messages&&(n.messages[i.name]=l.extend(n.messages[i.name],e.messages));break;case"remove":if(!e)return delete a[i.name],s;var r={};return l.each(e.split(/\s/),function(t,e){r[e]=s[e],delete s[e]}),r}}var o=l.validator.normalizeRules(l.extend({},l.validator.metadataRules(i),l.validator.classRules(i),l.validator.attributeRules(i),l.validator.staticRules(i)),i);if(o.required){var u=o.required;delete o.required,o=l.extend({required:u},o)}return o}}),l.extend(l.expr[":"],{blank:function(t){return!l.trim(""+t.value)},filled:function(t){return!!l.trim(""+t.value)},unchecked:function(t){return!t.checked}}),l.validator=function(t,e){this.settings=l.extend(!0,{},l.validator.defaults,t),this.currentForm=e,this.init()},l.validator.format=function(i,t){return 1==arguments.length?function(){var t=l.makeArray(arguments);return t.unshift(i),l.validator.format.apply(this,t)}:(2<arguments.length&&t.constructor!=Array&&(t=l.makeArray(arguments).slice(1)),t.constructor!=Array&&(t=[t]),l.each(t,function(t,e){i=i.replace(new RegExp("\\{"+t+"\\}","g"),e)}),i)},l.extend(l.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:!0,errorContainer:l([]),errorLabelContainer:l([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(t,e){this.lastActive=t,this.settings.focusCleanup&&!this.blockFocusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,t,this.settings.errorClass,this.settings.validClass),this.addWrapper(this.errorsFor(t)).hide())},onfocusout:function(t,e){this.checkable(t)||!(t.name in this.submitted)&&this.optional(t)||this.element(t)},onkeyup:function(t,e){(t.name in this.submitted||t==this.lastElement)&&this.element(t)},onclick:function(t,e){t.name in this.submitted?this.element(t):t.parentNode.name in this.submitted&&this.element(t.parentNode)},highlight:function(t,e,i){"radio"===t.type?this.findByName(t.name).addClass(e).removeClass(i):l(t).addClass(e).removeClass(i)},unhighlight:function(t,e,i){"radio"===t.type?this.findByName(t.name).removeClass(e).addClass(i):l(t).removeClass(e).addClass(i)}},setDefaults:function(t){l.extend(l.validator.defaults,t)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",accept:"Please enter a value with a valid extension.",maxlength:l.validator.format("Please enter no more than {0} characters."),minlength:l.validator.format("Please enter at least {0} characters."),rangelength:l.validator.format("Please enter a value between {0} and {1} characters long."),range:l.validator.format("Please enter a value between {0} and {1}."),max:l.validator.format("Please enter a value less than or equal to {0}."),min:l.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:!1,prototype:{init:function(){this.labelContainer=l(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||l(this.currentForm),this.containers=l(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var n=this.groups={};l.each(this.settings.groups,function(i,t){l.each(t.split(/\s/),function(t,e){n[e]=i})});var i=this.settings.rules;function t(t){var e=l.data(this[0].form,"validator"),i="on"+t.type.replace(/^validate/,"");e.settings[i]&&e.settings[i].call(e,this[0],t)}l.each(i,function(t,e){i[t]=l.validator.normalizeRule(e)}),l(this.currentForm).validateDelegate("[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ","focusin focusout keyup",t).validateDelegate("[type='radio'], [type='checkbox'], select, option","click",t),this.settings.invalidHandler&&l(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)},form:function(){return this.checkForm(),l.extend(this.submitted,this.errorMap),this.invalid=l.extend({},this.errorMap),this.valid()||l(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var t=0,e=this.currentElements=this.elements();e[t];t++)this.check(e[t]);return this.valid()},element:function(t){t=this.validationTargetFor(this.clean(t)),this.lastElement=t,this.prepareElement(t),this.currentElements=l(t);var e=this.check(t);return e?delete this.invalid[t.name]:this.invalid[t.name]=!0,this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),e},showErrors:function(e){if(e){for(var t in l.extend(this.errorMap,e),this.errorList=[],e)this.errorList.push({message:e[t],element:this.findByName(t)[0]});this.successList=l.grep(this.successList,function(t){return!(t.name in e)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){l.fn.resetForm&&l(this.currentForm).resetForm(),this.submitted={},this.lastElement=null,this.prepareForm(),this.hideErrors(),this.elements().removeClass(this.settings.errorClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(t){var e=0;for(var i in t)e++;return e},hideErrors:function(){this.addWrapper(this.toHide).hide()},valid:function(){return 0==this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{l(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(t){}},findLastActive:function(){var e=this.lastActive;return e&&1==l.grep(this.errorList,function(t){return t.element.name==e.name}).length&&e},elements:function(){var t=this,e={};return l(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){return!this.name&&t.settings.debug&&window.console&&console.error("%o has no name assigned",this),!(this.name in e||!t.objectLength(l(this).rules()))&&(e[this.name]=!0)})},clean:function(t){return l(t)[0]},errors:function(){return l(this.settings.errorElement+"."+this.settings.errorClass,this.errorContext)},reset:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=l([]),this.toHide=l([]),this.currentElements=l([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(t){this.reset(),this.toHide=this.errorsFor(t)},check:function(e){e=this.validationTargetFor(this.clean(e));var t=l(e).rules(),i=!1;for(var n in t){var a={method:n,parameters:t[n]};try{var s=l.validator.methods[n].call(this,e.value.replace(/\r/g,""),e,a.parameters);if("dependency-mismatch"==s){i=!0;continue}if(i=!1,"pending"==s)return void(this.toHide=this.toHide.not(this.errorsFor(e)));if(!s)return this.formatAndAdd(e,a),!1}catch(t){throw this.settings.debug&&window.console&&console.log("exception occured when checking element "+e.id+", check the '"+a.method+"' method",t),t}}if(!i)return this.objectLength(t)&&this.successList.push(e),!0},customMetaMessage:function(t,e){if(l.metadata){var i=this.settings.meta?l(t).metadata()[this.settings.meta]:l(t).metadata();return i&&i.messages&&i.messages[e]}},customMessage:function(t,e){var i=this.settings.messages[t];return i&&(i.constructor==String?i:i[e])},findDefined:function(){for(var t=0;t<arguments.length;t++)if(void 0!==arguments[t])return arguments[t]},defaultMessage:function(t,e){return this.findDefined(this.customMessage(t.name,e),this.customMetaMessage(t,e),!this.settings.ignoreTitle&&t.title||void 0,l.validator.messages[e],"<strong>Warning: No message defined for "+t.name+"</strong>")},formatAndAdd:function(t,e){var i=this.defaultMessage(t,e.method),n=/\$?\{(\d+)\}/g;"function"==typeof i?i=i.call(this,e.parameters,t):n.test(i)&&(i=jQuery.format(i.replace(n,"{$1}"),e.parameters)),this.errorList.push({message:i,element:t}),this.errorMap[t.name]=i,this.submitted[t.name]=i},addWrapper:function(t){return this.settings.wrapper&&(t=t.add(t.parent(this.settings.wrapper))),t},defaultShowErrors:function(){for(var t=0;this.errorList[t];t++){var e=this.errorList[t];this.settings.highlight&&this.settings.highlight.call(this,e.element,this.settings.errorClass,this.settings.validClass),this.showLabel(e.element,e.message)}if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(t=0;this.successList[t];t++)this.showLabel(this.successList[t]);if(this.settings.unhighlight){t=0;for(var i=this.validElements();i[t];t++)this.settings.unhighlight.call(this,i[t],this.settings.errorClass,this.settings.validClass)}this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return l(this.errorList).map(function(){return this.element})},showLabel:function(t,e){var i=this.errorsFor(t);i.length?(i.removeClass(this.settings.validClass).addClass(this.settings.errorClass),i.attr("generated")&&i.html(e)):(i=l("<"+this.settings.errorElement+"/>").attr({for:this.idOrName(t),generated:!0}).addClass(this.settings.errorClass).html(e||""),this.settings.wrapper&&(i=i.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.append(i).length||(this.settings.errorPlacement?this.settings.errorPlacement(i,l(t)):i.insertAfter(t))),!e&&this.settings.success&&(i.text(""),"string"==typeof this.settings.success?i.addClass(this.settings.success):this.settings.success(i)),this.toShow=this.toShow.add(i)},errorsFor:function(t){var e=this.idOrName(t);return this.errors().filter(function(){return l(this).attr("for")==e})},idOrName:function(t){return this.groups[t.name]||(this.checkable(t)?t.name:t.id||t.name)},validationTargetFor:function(t){return this.checkable(t)&&(t=this.findByName(t.name).not(this.settings.ignore)[0]),t},checkable:function(t){return/radio|checkbox/i.test(t.type)},findByName:function(i){var n=this.currentForm;return l(document.getElementsByName(i)).map(function(t,e){return e.form==n&&e.name==i&&e||null})},getLength:function(t,e){switch(e.nodeName.toLowerCase()){case"select":return l("option:selected",e).length;case"input":if(this.checkable(e))return this.findByName(e.name).filter(":checked").length}return t.length},depend:function(t,e){return!this.dependTypes[typeof t]||this.dependTypes[typeof t](t,e)},dependTypes:{boolean:function(t,e){return t},string:function(t,e){return!!l(t,e.form).length},function:function(t,e){return t(e)}},optional:function(t){return!l.validator.methods.required.call(this,l.trim(t.value),t)&&"dependency-mismatch"},startRequest:function(t){this.pending[t.name]||(this.pendingRequest++,this.pending[t.name]=!0)},stopRequest:function(t,e){this.pendingRequest--,this.pendingRequest<0&&(this.pendingRequest=0),delete this.pending[t.name],e&&0==this.pendingRequest&&this.formSubmitted&&this.form()?(l(this.currentForm).submit(),this.formSubmitted=!1):!e&&0==this.pendingRequest&&this.formSubmitted&&(l(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(t){return l.data(t,"previousValue")||l.data(t,"previousValue",{old:null,valid:!0,message:this.defaultMessage(t,"remote")})}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},dateDE:{dateDE:!0},number:{number:!0},numberDE:{numberDE:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(t,e){t.constructor==String?this.classRuleSettings[t]=e:l.extend(this.classRuleSettings,t)},classRules:function(t){var e={},i=l(t).attr("class");return i&&l.each(i.split(" "),function(){this in l.validator.classRuleSettings&&l.extend(e,l.validator.classRuleSettings[this])}),e},attributeRules:function(t){var e={},i=l(t);for(var n in l.validator.methods){var a;(a="required"===n&&"function"==typeof l.fn.prop?i.prop(n):i.attr(n))?e[n]=a:i[0].getAttribute("type")===n&&(e[n]=!0)}return e.maxlength&&/-1|2147483647|524288/.test(e.maxlength)&&delete e.maxlength,e},metadataRules:function(t){if(!l.metadata)return{};var e=l.data(t.form,"validator").settings.meta;return e?l(t).metadata()[e]:l(t).metadata()},staticRules:function(t){var e={},i=l.data(t.form,"validator");return i.settings.rules&&(e=l.validator.normalizeRule(i.settings.rules[t.name])||{}),e},normalizeRules:function(n,a){return l.each(n,function(t,e){if(!1!==e){if(e.param||e.depends){var i=!0;switch(typeof e.depends){case"string":i=!!l(e.depends,a.form).length;break;case"function":i=e.depends.call(a,a)}i?n[t]=void 0===e.param||e.param:delete n[t]}}else delete n[t]}),l.each(n,function(t,e){n[t]=l.isFunction(e)?e(a):e}),l.each(["minlength","maxlength","min","max"],function(){n[this]&&(n[this]=Number(n[this]))}),l.each(["rangelength","range"],function(){n[this]&&(n[this]=[Number(n[this][0]),Number(n[this][1])])}),l.validator.autoCreateRanges&&(n.min&&n.max&&(n.range=[n.min,n.max],delete n.min,delete n.max),n.minlength&&n.maxlength&&(n.rangelength=[n.minlength,n.maxlength],delete n.minlength,delete n.maxlength)),n.messages&&delete n.messages,n},normalizeRule:function(t){if("string"==typeof t){var e={};l.each(t.split(/\s/),function(){e[this]=!0}),t=e}return t},addMethod:function(t,e,i){l.validator.methods[t]=e,l.validator.messages[t]=null!=i?i:l.validator.messages[t],e.length<3&&l.validator.addClassRules(t,l.validator.normalizeRule(t))},methods:{required:function(t,e,i){if(!this.depend(i,e))return"dependency-mismatch";switch(e.nodeName.toLowerCase()){case"select":var n=l(e).val();return n&&0<n.length;case"input":if(this.checkable(e))return 0<this.getLength(t,e);default:return 0<l.trim(t).length}},remote:function(s,r,t){if(this.optional(r))return"dependency-mismatch";var o=this.previousValue(r);if(this.settings.messages[r.name]||(this.settings.messages[r.name]={}),o.originalMessage=this.settings.messages[r.name].remote,this.settings.messages[r.name].remote=o.message,t="string"==typeof t&&{url:t}||t,this.pending[r.name])return"pending";if(o.old===s)return o.valid;o.old=s;var u=this;this.startRequest(r);var e={};return e[r.name]=s,l.ajax(l.extend(!0,{url:t,mode:"abort",port:"validate"+r.name,dataType:"json",data:e,success:function(t){u.settings.messages[r.name].remote=o.originalMessage;var e=!0===t;if(e){var i=u.formSubmitted;u.prepareElement(r),u.formSubmitted=i,u.successList.push(r),u.showErrors()}else{var n={},a=t||u.defaultMessage(r,"remote");n[r.name]=o.message=l.isFunction(a)?a(s):a,u.showErrors(n)}o.valid=e,u.stopRequest(r,e)}},t)),"pending"},minlength:function(t,e,i){return this.optional(e)||this.getLength(l.trim(t),e)>=i},maxlength:function(t,e,i){return this.optional(e)||this.getLength(l.trim(t),e)<=i},rangelength:function(t,e,i){var n=this.getLength(l.trim(t),e);return this.optional(e)||n>=i[0]&&n<=i[1]},min:function(t,e,i){return this.optional(e)||i<=t},max:function(t,e,i){return this.optional(e)||t<=i},range:function(t,e,i){return this.optional(e)||t>=i[0]&&t<=i[1]},email:function(t,e){return this.optional(e)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(t)},url:function(t,e){return this.optional(e)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(t)},date:function(t,e){return this.optional(e)||!/Invalid|NaN/.test(new Date(t))},dateISO:function(t,e){return this.optional(e)||/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(t)},number:function(t,e){return this.optional(e)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(t)},digits:function(t,e){return this.optional(e)||/^\d+$/.test(t)},creditcard:function(t,e){if(this.optional(e))return"dependency-mismatch";if(/[^0-9 -]+/.test(t))return!1;for(var i=0,n=0,a=!1,s=(t=t.replace(/\D/g,"")).length-1;0<=s;s--){var r=t.charAt(s);n=parseInt(r,10);a&&9<(n*=2)&&(n-=9),i+=n,a=!a}return i%10==0},accept:function(t,e,i){return i="string"==typeof i?i.replace(/,/g,"|"):"png|jpe?g|gif",this.optional(e)||t.match(new RegExp(".("+i+")$","i"))},equalTo:function(t,e,i){return t==l(i).unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){l(e).valid()}).val()}}}),l.format=l.validator.format}(jQuery),function(n){var a={};if(n.ajaxPrefilter)n.ajaxPrefilter(function(t,e,i){var n=t.port;"abort"==t.mode&&(a[n]&&a[n].abort(),a[n]=i)});else{var s=n.ajax;n.ajax=function(t){var e=("mode"in t?t:n.ajaxSettings).mode,i=("port"in t?t:n.ajaxSettings).port;return"abort"==e?(a[i]&&a[i].abort(),a[i]=s.apply(this,arguments)):s.apply(this,arguments)}}}(jQuery),function(a){jQuery.event.special.focusin||jQuery.event.special.focusout||!document.addEventListener||a.each({focus:"focusin",blur:"focusout"},function(t,e){function i(t){return(t=a.event.fix(t)).type=e,a.event.handle.call(this,t)}a.event.special[e]={setup:function(){this.addEventListener(t,i,!0)},teardown:function(){this.removeEventListener(t,i,!0)},handler:function(t){return(t=a.event.fix(t)).type=e,a.event.handle.apply(this,arguments)}}}),a.extend(a.fn,{validateDelegate:function(i,t,n){return this.bind(t,function(t){var e=a(t.target);if(e.is(i))return n.apply(e,arguments)})}})}(jQuery),function(u){var t,e=u.validator,n="unobtrusiveValidation";function r(t,e,i){t.rules[e]=i,t.message&&(t.messages[e]=t.message)}function o(t){return t.substr(0,t.lastIndexOf(".")+1)}function l(t,e){return 0===t.indexOf("*.")&&(t=t.replace("*.",e)),t}function a(t,e){var i=u(this).find("[data-valmsg-for='"+e[0].name+"']"),n=!1!==u.parseJSON(i.attr("data-valmsg-replace"));i.removeClass("field-validation-valid").addClass("field-validation-error"),t.data("unobtrusiveContainer",i),n?(i.empty(),t.removeClass("input-validation-error").appendTo(i)):t.hide()}function s(t,e){var i=u(this).find("[data-valmsg-summary=true]"),n=i.find("ul");n&&n.length&&e.errorList.length&&(n.empty(),i.addClass("validation-summary-errors").removeClass("validation-summary-valid"),u.each(e.errorList,function(){u("<li />").html(this.message).appendTo(n)}))}function d(t){var e=t.data("unobtrusiveContainer"),i=u.parseJSON(e.attr("data-valmsg-replace"));e&&(e.addClass("field-validation-valid").removeClass("field-validation-error"),t.removeData("unobtrusiveContainer"),i&&e.empty())}function i(t){var e=u(t),i=e.data(n);return i||(i={options:{errorClass:"input-validation-error",errorElement:"span",errorPlacement:u.proxy(a,t),invalidHandler:u.proxy(s,t),messages:{},rules:{},success:u.proxy(d,t)},attachValidation:function(){e.validate(this.options)},validate:function(){return e.validate(),e.valid()}},e.data(n,i)),i}e.unobtrusive={adapters:[],parseElement:function(n,t){var e,a,s,r=u(n),o=r.parents("form")[0];o&&((e=i(o)).options.rules[n.name]=a={},e.options.messages[n.name]=s={},u.each(this.adapters,function(){var t="data-val-"+this.name,e=r.attr(t),i={};void 0!==e&&(t+="-",u.each(this.params,function(){i[this]=r.attr(t+this)}),this.adapt({element:n,form:o,message:e,params:i,rules:a,messages:s}))}),jQuery.extend(a,{__dummy__:!0}),t||e.attachValidation())},parse:function(t){u(t).find(":input[data-val=true]").each(function(){e.unobtrusive.parseElement(this,!0)}),u("form").each(function(){var t=i(this);t&&t.attachValidation()})}},(t=e.unobtrusive.adapters).add=function(t,e,i){return i||(i=e,e=[]),this.push({name:t,params:e,adapt:i}),this},t.addBool=function(e,i){return this.add(e,function(t){r(t,i||e,!0)})},t.addMinMax=function(t,n,a,s,e,i){return this.add(t,[e||"min",i||"max"],function(t){var e=t.params.min,i=t.params.max;e&&i?r(t,s,[e,i]):e?r(t,n,e):i&&r(t,a,i)})},t.addSingleVal=function(e,i,n){return this.add(e,[i||"val"],function(t){r(t,n||e,t.params[i])})},e.addMethod("__dummy__",function(t,e,i){return!0}),e.addMethod("regex",function(t,e,i){var n;return!!this.optional(e)||(n=new RegExp(i).exec(t))&&0===n.index&&n[0].length===t.length}),t.addSingleVal("accept","exts").addSingleVal("regex","pattern"),t.addBool("creditcard").addBool("date").addBool("digits").addBool("email").addBool("number").addBool("url"),t.addMinMax("length","minlength","maxlength","rangelength").addMinMax("range","min","max","range"),t.add("equalto",["other"],function(t){var e=o(t.element.name),i=l(t.params.other,e);r(t,"equalTo",u(t.form).find(":input[name="+i+"]")[0])}),t.add("required",function(t){"INPUT"===t.element.tagName.toUpperCase()&&"CHECKBOX"===t.element.type.toUpperCase()||r(t,"required",!0)}),t.add("remote",["url","type","additionalfields"],function(n){var a={url:n.params.url,type:n.params.type||"GET",data:{}},s=o(n.element.name);u.each((n.params.additionalfields||n.element.name).replace(/^\s+|\s+$/g,"").split(/\s*,\s*/g),function(t,e){var i=l(e,s);a.data[i]=function(){return u(n.form).find(":input[name='"+i+"']").val()}}),r(n,"remote",a)}),u(function(){e.unobtrusive.parse(document)})}(jQuery);
//# sourceMappingURL=jquery.validator.js.map