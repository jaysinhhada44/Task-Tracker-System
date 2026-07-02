exports.onSuccess = (message, result, res) => {
	res.status(200).json({
		Message: message,
		Data: result,
		Status: 200,
		IsSuccess: true
	});
};
exports.onError = (error, res) => {
	res.status(500).json({
		Message: error.message,
		Data: 0,
		Status: 500,
		IsSuccess: false
	});
};
exports.unauthorisedRequest = (message, res) => {
	res.status(401).json({
		Message: "Unauthorized Request!",
		Data: 0,
		Status: 401,
		IsSuccess: false
	});
};
exports.forbiddenRequest = (message, res) => {
	res.status(403).json({
		Message: "Access to the requested resource is forbidden! Contact Administrator.",
		Data: 0,
		Status: 403,
		IsSuccess: false
	});
};
exports.badrequest = (error, res) => {
	res.status(400).json({
		Message: error.message || 'Bad Request',
		Data: 0,
		Status: 400,
		IsSuccess: false
	});
};
exports.joiBadRequest = (err, res) => {
	res.status(400).json({
		Message: err.message,
		Data: 0,
		Status: 400,
		IsSuccess: false
	});
};

exports.responseValidation = (responseStatusCode, responseStatusMsg, responseErrors) => {
	const responseValidationJson = {};
	responseValidationJson.status_code = responseStatusCode;
	responseValidationJson.status_message = responseStatusMsg;
	// errors
	if (responseErrors === undefined) {
		responseValidationJson.response_error = [];
	} else {
		responseValidationJson.response_error = responseErrors;
	}
	return responseValidationJson;
}
