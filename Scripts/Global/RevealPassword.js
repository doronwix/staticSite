function RevealPassword() {
	var passwordInput,
		passwordText,
		icon,
		form,
		classNames = {
			passwordTypeText: 'password-type-text',
			passwordInput: 'password-input',
			icoWbReveal: 'ico-wb-reveal',
			icoWbRevealOff: 'ico-wb-reveal-off',
			icoPassBlue: 'ico-pass-blue'
		},
		keyCodes = {
			enter: 13,
			ctrlEnter: 10
		};

	function init(elements) {
		passwordInput = elements.passwordInput;
		icon = elements.icon;
		form = elements.form;

		setRevealPassword();
	}

	function setRevealPassword() {
		icon.on('click.RevealPassword', togglePasswordField);
		passwordInput.on('keyup.RevealPassword', togglePasswordIcon);
		$(window).on('orientationchange.RevealPassword', onOrientationChange);

		setTimeout(togglePasswordIcon, 100);
	}

	function showPasswordTextInput() {
		passwordText = passwordInput
			.attr("type", "text");

		passwordText.on('keyup.RevealPassword', onPasswordTextKeyUp);
	}

	function onOrientationChange() {
		if (isNullOrUndefined(passwordText)) {
			return;
		}

		passwordInput.val(passwordText.val());
		hidePasswordTextInput();
		icon
		.removeClass(classNames.icoWbRevealOff)
		.addClass(classNames.icoWbReveal);
	}

	function hidePasswordTextInput() {
		if (isNullOrUndefined(passwordText)) {
			return;
		}

		passwordText.off('.RevealPassword');
		passwordText = passwordInput
			.attr("type", "password");
	}

	function onPasswordTextKeyUp(e) {
		if (passwordText.val() !== '') {
			submitOnEnter(e);

			return;
		}

		reinitiliasePasswordField();
	}

	function submitOnEnter(e) {
		if (e.which == keyCodes.ctrlEnter || e.which == keyCodes.enter) {
			e.preventDefault();

			passwordInput.val(passwordText.val());
			hidePasswordTextInput();

			form.submit();
		}
	}

	function reinitiliasePasswordField() {
		hidePasswordTextInput();
		passwordInput
			.val('')
			.prev()
			.removeClass(classNames.icoPassBlue)
			.removeClass(classNames.icoWbRevealOff)
			.addClass(classNames.icoWbReveal);
	}

	function revealPassword() {
		showPasswordTextInput();
		icon
		.removeClass(classNames.icoWbReveal)
		.addClass(classNames.icoWbRevealOff);

		if (passwordTextHasValue()) {
			passwordText.val(passwordInput.val());
		}
	}

	function hidePassword() {
		if (passwordTextHasValue()) {
			passwordInput.val(passwordText.val());
		}

		hidePasswordTextInput();
		icon.removeClass(classNames.icoWbRevealOff).addClass(classNames.icoWbReveal);
	}

	function togglePasswordField() {
		if (passwordInput.val() === '') {
			return;
		}

		if (icon.hasClass(classNames.icoWbReveal)) {
			revealPassword();
		} else {
			hidePassword();
		}
	}

	function togglePasswordIcon() {
		var passwordInputBoxStyle = passwordInput.css("box-shadow");

		if (passwordInput.val() !== '' ||
			(Browser.isChrome() && passwordInputBoxStyle.indexOf('inset') >= 0)) {
			passwordInput.prev().addClass(classNames.icoPassBlue);
		} else {
			passwordInput
				.prev()
				.removeClass(classNames.icoPassBlue)
				.removeClass(classNames.icoWbRevealOff)
				.addClass(classNames.icoWbReveal);
		}
	}

	function passwordTextHasValue() {
		return !isNullOrUndefined(passwordText) &&
			passwordText.length > 0 &&
			passwordText.val() !== '';
	}

	function dispose() {
		icon.off('click.RevealPassword');
		passwordInput.off('keyup.RevealPassword');
		$(window).off('orientationchange.RevealPassword');
	}

	function isNullOrUndefined(value) {
		return value === null || typeof value === 'undefined';
	}

	return {
		Init: init,
		HidePasswordText: hidePassword,
		Dispose: dispose
	}
}