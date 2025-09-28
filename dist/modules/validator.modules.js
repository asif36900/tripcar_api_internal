"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckRequiredValidation = void 0;
let CheckRequiredValidation = (data) => {
    return new Promise(((resolve, reject) => {
        let message = '';
        data.forEach((item, index) => {
            message = '';
            switch (item.type) {
                case 'Empty':
                    if (!item.value) {
                        message = item.field + ' is required';
                    }
                    break;
                case 'Length':
                    if (item.value.length < 6 || item.value.length > 255) {
                        message = item.field + ' must be at-least 6 characters and maximum of 255 characters long';
                    }
                    break;
                case 'Image Length':
                    if (!Array.isArray(item.value) || item.value.length < 3) {
                        message = `${item.field} must contain at least 3 images`;
                    }
                    break;
                case 'Length maximum 255 characters':
                    if ((item.value) && (item.value.length > 255)) {
                        message = item.field + ' length must be maximum of 255 characters long';
                    }
                    break;
                case 'Pin Length':
                    if (item.value.length < 4 || item.value.length > 4) {
                        message = item.field + ' must be 4 digits.';
                    }
                    break;
                case 'Confirm Password':
                    const passwordIndex = data.findIndex((item1) => item1.field === 'Password');
                    const confirmPasswordIndex = data.findIndex((item1) => item1.field === 'Confirm password');
                    if (passwordIndex !== -1 && confirmPasswordIndex !== -1) {
                        let password = data[passwordIndex].value;
                        let confirmPassword = data[confirmPasswordIndex].value;
                        if (password !== confirmPassword) {
                            message = item.field + 'not matched';
                        }
                    }
                    break;
                case 'Unique password':
                    if (!/[a-z]/.test(item.value)) {
                        message = item.field + ' must contain at least one lowercase letter';
                    }
                    else if (!/[A-Z]/.test(item.value)) {
                        message = item.field + ' must contain at least one uppercase letter';
                    }
                    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(item.value)) {
                        message = item.field + ' must contain at least one symbol';
                    }
                case 'Date Formate':
                    try {
                        validateDOB(item.value);
                    }
                    catch (error) {
                        message = error.message;
                    }
                    break;
            }
            if (message !== '') {
                resolve({
                    status: false,
                    message: message
                });
            }
        });
        resolve({
            status: true
        });
    }));
};
exports.CheckRequiredValidation = CheckRequiredValidation;
const validateDOB = (dob) => {
    const dobRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!dobRegex.test(dob)) {
        throw new Error('Invalid date format. Please use DD-MM-YYYY.');
    }
    const [, day, month, year] = dob.match(dobRegex);
    const parsedYear = parseInt(year);
    const parsedMonth = parseInt(month);
    const parsedDay = parseInt(day);
    const currentYear = new Date().getFullYear();
    const date = new Date(`${parsedYear}-${parsedMonth}-${parsedDay}`);
    if (date.getFullYear() !== parsedYear ||
        date.getMonth() + 1 !== parsedMonth ||
        date.getDate() !== parsedDay) {
        throw new Error('Invalid date. Please ensure the date is correct.');
    }
    return true;
};
exports.default = {
    CheckRequiredValidation: exports.CheckRequiredValidation
};
