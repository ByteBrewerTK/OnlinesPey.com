/**
 * Helper library to launch Eko's AePS gateway from a webpage
 *
 * Written in ES5 to get a smaller build
 *
 * @example
 *
 * <script type="javascript" src="../dist/aeps-gateway-lib.js" />
 *
 * EkoAEPSGateway.config({...});
 * EkoAEPSGateway.setCallbackURL({...});
 * EkoAEPSGateway.open();
 *
 *
 * @author Kumar Abhishek _https://github.com/manustays)
 */
var EkoAEPSGateway = (function (window, document) {

	/**
	 * AePS Gateway URL list for multiple environments
	 * @readonly
	 * @private
	 * @ignore
	 */
	var _GATEWAY_URL_LIST = {
		local: 'http://localhost:3004',
		uat: 'https://stagegateway.eko.in',
		production: 'https://gateway.eko.in'
	};

	/**
	 * Helper variable to produce a smaller build
	 * @readonly
	 * @private
	 * @ignore
	 */
	var _DEFAULT_ENV = 'production';

	/**
	 * AePS Gateway URL path
	 * @readonly
	 * @private
	 * @ignore
	 */
	var _GATEWAY_URL_PATH = '/v2/aeps';


	/**
	 * Internal configuration store.
	 * @private
	 * @ignore
	 */
	var _config = {
		// developer_key: '',
		// secret_key: '',
		// secret_key_timestamp: '',
		// initiator_id: '',
		// user_code: '',
		// initiator_logo_url: '',
		// partner_name: '',
		// language: 'en',
		environment: _DEFAULT_ENV
	};


	/**
	 * Internal store for user's callback function for transaction confirmation.
	 * @private
	 * @ignore
	 */
	var _callbackUserFunc = null;


	/**
	 * Internal store for user's callback function for transaction final response.
	 * @private
	 * @ignore
	 */
	var _responseCallbackUserFunc = null;

	/**
	 * Internal store for handle to the popup window.
	 * @private
	 * @ignore
	 */
	var _popupWindow = null;


	/**
	 * @private
	 * @ignore
	 * Internal callback function for communicating with the popup window
	 * @param {*} e Window message event
	 */
	var _gatewayMessageListener = function (e) {
		var resp = null;
		if (e &&
			e.origin === _GATEWAY_URL_LIST[_config.environment || _DEFAULT_ENV] &&
			e.data) {

			resp = e.data.eko_gateway_response;
			if (resp) {
				if (_callbackUserFunc && resp.action === 'debit-hook') {
					_callbackUserFunc(resp);
				} else if (_responseCallbackUserFunc && resp.action === 'response') {
					_responseCallbackUserFunc(resp);
				}
			}
		}
	};


	/**
	 * @private
	 * @ignore
	 * Internal helper function to check for valid object and return serialized form
	 * @param {Object} obj Main object
	 * @param {string} prop Property to serialize
	 * @returns {String} Serialized 'prop'
	 */
	var _getValidObjectString = function (obj, prop) {
		return JSON.stringify(obj && obj[prop] && typeof obj[prop] === 'object' ? obj[prop] : {});
	};

	/**
	 * @private
	 * @ignore
	 */
	var doc_create = document.createElement.bind(document);

	/**
	 * @private
	 * @ignore
	 */
	var TAG = 'EkoAePS';


	return function () {

		console.debug('[EkoAEPSGateway] constructor called');


		window.addEventListener('message', _gatewayMessageListener.bind(this));


		/**
		 * Configure API credentials and other options.
		 * API details at: https://developers.eko.in/docs/aeps-gateway
		 *
		 * @param {Object} options - An object with all options to set.
		 * @param {string} options.partner_name - Your company name to display in the AePS popup.
		 * @param {string} options.initiator_logo_url - Your company logo to display in the AePS popup
		 * @param {string} options.initiator_id - Your registered initiator-id.
		 * @param {string} options.developer_key - Your Eko API developer-key.
		 * @param {string} options.secret_key - Secret-key for security generated at your server.
		 * 		(see: https://developers.eko.in/docs/authentication)
		 * @param {string} options.secret_key_timestamp - Timestamp used to generate secret-key.
		 * @param {string} options.user_code - Unique code of your user/merchant availing AePS.
		 * 		This needs to be generated while onboarding users.
		 * 		(See: https://developers.eko.in/reference#activate-service)
		 * @param {string} options.environment - Envoirnment = "uat" or "production" _(default)_
		 * @param {string} [options.language="en"] - AePS popup interface language:
		 * 	- en: English (default)
		 * 	- hi: Hindi
		 * 	- mr: Marathi
		 * 	- gu: Gujarati
		 * 	- kn: Kannada
		 * 	- ta: Tamil
		 *
		 * @example
		 * EkoAEPSGateway.config({
		 * 		"partner_name": "Payments INC",
		 * 		"initiator_logo_url": "https://files.eko.co.in/docs/logos/payment/dummy-partner-logo.png",
		 * 		"initiator_id": "9962981729",
		 * 		"developer_key": "becbbce45f79c6f5109f848acd540567",
		 * 		"secret_key": "dCUujUywtuu86CyoHkZZzBjLUAVC365e6PLaa4UYwqM=",
		 * 		"secret_key_timestamp": "1532582133692",
		 * 		"user_code": "20810200",
		 * 		"environment": "production"
		 * 	});
		 */
		this.config = function (options) {
			if (options) {
				_config = Object.assign(_config, options);
			}
		};


		/**
		 * Setup your server's callback URL for confirming transactions and for getting final response.
		 *  - It is essential for security.
		 *  - You can also handle the callback yourself in Javascript by
		 *    using _setConfirmationCallbackFunction()_ (_not recommended_)
		 *
		 * @param {string} url - Your server URL to call for getting final transaction confirmation.
		 * @param {Object} [options] - Optional callback setting two properties: "parameters" and "headers" that we should set before calling your callback-URL.
		 * @param {Object} options.parameters - Additional parameters (as name-value pairs) that should be sent with the callback request.
		 * @param {Object} options.headers - Additional HTTP request headers (as name-value pairs) that should be sent with the callback request.
		 *
		 * @example
		 * // Simple callback with no extra parameters or headers:
		 * EkoAEPSGateway.setCallbackURL("https://myserver.com/ekoaeps/confirm");
		 *
		 * @example
		 * // Callback with extra body parameter "session_key":
		 * EkoAEPSGateway.setCallbackURL("https://myserver.com/ekoaeps/confirm",
		 * 		{
		 * 			parameters: { "session_key": "gsRS56sj4$6sdn67sHGs8j" }
		 * 		}
		 * 	);
		 *
		 * @example
		 * EkoAEPSGateway.setCallbackURL("https://myserver.com/ekoaeps/confirm",
		 * 		{
		 * 			headers: { "authorization": "Bearer gsRS56sj4$6sdn67sHGs8j" }
		 * 		}
		 * 	);
		 */
		this.setCallbackURL = function (url, options) {

			if (url) {
				/* eslint camelcase: "off" */
				_config.callback_url = url;
				_config.callback_url_custom_params = _getValidObjectString(options, 'parameters');
				_config.callback_url_custom_headers = _getValidObjectString(options, 'headers');
			}
		};


		/**
		 * @callback confirmationCallback
		 * @param {Object} requestData
		 * @returns {Object}
		 * @todo Document callback request and returned response
		 */

		/**
		 * Setup your Javascript callback function for confirming transactions.
		 *  - It is an _alternative_ to setCallbackURL()
		 * @see setCallbackURL - It is _**recommended to use setCallbackURL()**_ instead
		 * @param {confirmationCallback} callbackFunc The callback function to handle confirmation of the final AePS Transaction
		 * @returns {Boolean} - Returns true on success else false
		 */
		this.setConfirmationCallbackFunction = function (callbackFunc) {

			if (callbackFunc) {

				if (_config.callback_url) {
					console.error(TAG, 'Callback URL already set');
				} else {
					_callbackUserFunc = callbackFunc;
					return true;
				}
			}

			return false;
		};


		/**
		 * Setup your Javascript callback function for getting final response of transactions.
		 *  - It is an _alternative_ to setCallbackURL()
		 * @see setCallbackURL - It is _**recommended to use setCallbackURL()**_ instead
		 * @param {confirmationCallback} callbackFunc The callback function to handle confirmation of the final AePS Transaction
		 * @returns {Boolean} - Returns true on success else false
		 */
		this.setResponseCallbackFunction = function (callbackFunc) {

			if (callbackFunc) {
				_responseCallbackUserFunc = callbackFunc;
				return true;
			}
			return false;
		};


		/**
		 * If using the confirmation callback function (with _setConfirmationCallbackFunction()_),
		 * use this function to send the transaction confirmation back to AePS Gateway.
		 *
		 * @param {Object} data Confirmation details
		 * @param {string} data.secret_key - Secret-key for security generated at your server.
		 * 		(see https://developers.eko.in/docs/authentication)
		 * @param {string} data.secret_key_timestamp - Timestamp used to generate the secret-key
		 * @param {string} data.request_hash - (See https://developers.eko.in/docs/authentication)
		 * @param {string} [data.client_ref_id] Optional unique ID for this transaction.
		 */
		this.confirmTransaction = function (data) {

			var response_data = data || {};
			response_data.action = 'go';
			response_data.allow = true;
			if (_popupWindow) {
				_popupWindow.postMessage({ eko_gateway_request: response_data }, '*');
			}
		};


		/**
		 * If using the confirmation callback function (with _setConfirmationCallbackFunction()_),
		 * 	use this function to send the transaction confirmation back to AePS Gateway.
		 *
		 * @param {string} message Reason for rejection to show on the AePS popup window.
		 */
		this.rejectTransaction = function (message) {

			var data = {
				action: 'go',
				allow: false,
				message: message || ''
			};

			if (_popupWindow) {
				_popupWindow.postMessage(data, '*');
			}
		};


		/**
		 * Open the AePS Gateway popup window
		 */
		this.open = function () {

			var url = (_GATEWAY_URL_LIST[_config.environment] || _GATEWAY_URL_LIST[_DEFAULT_ENV]) + _GATEWAY_URL_PATH;
			var form = doc_create('form');
			var form_set_attr = form.setAttribute.bind(form);
			var prop = null, input = null;

			console.debug('[EkoAEPSGateway] opening popup ', doc_create, typeof doc_create);

			form_set_attr('method', 'post');
			form_set_attr('action', url);
			form_set_attr('target', TAG);
			_popupWindow = window.open('', TAG);
			// if (!_popupWindow.pm) {
			// 	_popupWindow.pm = _popupWindow.postMessage.bind(window);	// For smaller build
			// }

			/* eslint guard-for-in: "off" */
			for (prop in _config) {
				input = doc_create('input');
				input.type = 'hidden';
				input.name = prop;
				input.value = _config[prop];
				form.appendChild(input);
			}

			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		};


	};

})(window, document);
