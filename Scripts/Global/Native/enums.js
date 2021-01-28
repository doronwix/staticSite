var eLoginMethods = {
    Password: 1,
    Fingerprint: 2
};

// is Device Support Fingerprint general API and Android specific
var deviceSupportErrorEnum = {
    SUPPORTED: "10",
    NOT_SUPPORTS_FINGERPRINT: "1",
    DEVICE_HAS_NO_ENROLLED_FINGERPRINT: "2",
    OTHER_REASON: "3",
    MINIMUM_SDK_VERSION_23_REQUIRED: "4",
    BIOMETRY_IS_LOCKED_OUT: "5", // iOS too many failed attempts 
    IOS_FACE_INSTEADOF_FINGERPTINT: "6"
};

var tokenErrorEnum = {
    WRONG_ACCOUNT_NUMBER: "1"
}
// is Device Support Fingerprint iOS specific API
var iOSDeviceSupportErrorEnum = {
    ErrorTouchIDNotEnrolled: -7,
    BiometryIsLockedOut: -8
};

function translateIOSErrorToGeneralMessage(err) {

    switch (err.code) {
        case iOSDeviceSupportErrorEnum.ErrorTouchIDNotEnrolled:
            return deviceSupportErrorEnum.DEVICE_HAS_NO_ENROLLED_FINGERPRINT;
        case iOSDeviceSupportErrorEnum.BiometryIsLockedOut:
            return deviceSupportErrorEnum.BIOMETRY_IS_LOCKED_OUT;
        default:
            return deviceSupportErrorEnum.NOT_SUPPORTS_FINGERPRINT;
    }
}