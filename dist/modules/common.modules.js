"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthOrder = exports.DateBirthFormat = exports.DateFormat = exports.WordWrap = exports.isValidNumber = exports.hasNoDuplicate = exports.CheckEmpty = exports.CapitalizeFirstLetter = exports.GenerateSuccessResponseWithData = exports.GenerateSuccessResponse = exports.GenerateErrorResponse = exports.GenerateForbiddenErrorResponse = exports.GenerateBadGatewayResponse = exports.GenerateUnauthorizedResponse = exports.GenerateBadRequestResponse = exports.RandomNumberModule = exports.ConvertDateTimeFormat = exports.RandomNumber = exports.DeleteFolder = exports.DeleteFile = exports.fileImageUrl = exports.extractPublicId = exports.CloudinaryDeleteFile = exports.CloudinaryFilesUpload = exports.PaginationModule = exports.DBDateFormatModule = exports.sendOtpWithTwilioSendGrid = void 0;
const http_status_codes_1 = require("http-status-codes");
// import User from '../database/models/User';
// import transporter from '../lib/sendEmail';
const cloudnary_1 = __importDefault(require("../lib/cloudnary"));
const https_1 = __importDefault(require("https"));
const crypto = require('crypto');
const sharp_1 = __importDefault(require("sharp"));
const path = require("path");
const streamifier_1 = __importDefault(require("streamifier"));
const moment = require('moment');
const fs = require("fs-extra");
const axios = require('axios');
require('dotenv').config({ path: './.env' });
// export const sendNotificationEmail = async (to: string, subject: string, html: string): Promise<void> => {
//     const mailOptions = {
//         from: `"Task Earn Money" <${process.env.NODEMAILER_EMAIL_USERNAME}>`,
//         to,
//         subject,
//         html,
//     };
//     return new Promise((resolve, reject) => {
//         transporter.sendMail(mailOptions, (error: any, info: any) => {
//             if (error) {
//                 console.error('Notification email send error:', error);
//                 return reject(error);
//             }
//             console.log('Notification email sent:', info.messageId);
//             resolve(undefined);
//         });
//     });
// };
// export const sendOtpWithTwilioSendGrid = async (email: string, link: string): Promise<any> => {
//     let data = JSON.stringify({
//         "personalizations": [
//             {
//                 "to": [
//                     {
//                         "email": email
//                     }
//                 ],
//                 "dynamic_template_data": {
//                     "action_url": link
//                 }
//             }
//         ],
//         "from": {
//             "email": "subhanmuneer112233@gmail.com"
//         },
//         "template_id": 'd-00a3419bf71648e9b6c56ec02ccca49d',
//     });
//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: 'https://api.sendgrid.com/v3/mail/send',
//         headers: {
//             'Authorization':
//                 'Bearer ' + process.env.SENDGRID_MAIL_API_KEY,
//             'Content-Type': 'application/json'
//         },
//         data: data
//     };
//     try {
//         const response = await axios.request(config);
//         console.log(`OTP sent successfully to ${email} . Please verify it to complete the login process.`);
//         return {
//             status: true,
//             message: `OTP sent successfully to ${email} . Please verify it to complete the login process.`,
//         };
//     } catch (error: any) {
//         console.log(error);
//         return {
//             status: false,
//             message: `Error while sending OTP to ${email}`,
//         };
//     }
// }
const sendOtpWithTwilioSendGrid = (email, link) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        personalizations: [
            {
                to: [{ email }],
                dynamic_template_data: { action_url: link },
            },
        ],
        from: { email: process.env.SENDER_EMAIL },
        template_id: process.env.SENDGRID_TEMPLATE_ID,
    };
    const agent = new https_1.default.Agent({
        keepAlive: true,
        minVersion: "TLSv1.2",
    });
    try {
        const response = yield axios.post("https://api.sendgrid.com/v3/mail/send", data, {
            headers: {
                Authorization: `Bearer ${process.env.SENDGRID_MAIL_API_KEY}`,
                "Content-Type": "application/json",
            },
            httpsAgent: agent,
            timeout: 10000, // 10s just in case
        });
        console.log(`OTP sent successfully to ${email}`);
        return { status: true, message: `OTP sent successfully to ${email}` };
    }
    catch (error) {
        console.error("SendGrid error:", error.message || error);
        return { status: false, message: `Error while sending OTP to ${email}` };
    }
});
exports.sendOtpWithTwilioSendGrid = sendOtpWithTwilioSendGrid;
let DBDateFormatModule = () => {
    const dateObject = new Date();
    const date = dateObject.getDate() < 10 ? "0" + dateObject.getDate() : dateObject.getDate();
    const month = (dateObject.getMonth() + 1) < 10 ? "0" + (dateObject.getMonth() + 1) : (dateObject.getMonth() + 1);
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours() < 10 ? "0" + dateObject.getHours() : dateObject.getHours();
    const minutes = dateObject.getMinutes() < 10 ? "0" + dateObject.getMinutes() : dateObject.getMinutes();
    const seconds = dateObject.getSeconds() < 10 ? "0" + dateObject.getSeconds() : dateObject.getSeconds();
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};
exports.DBDateFormatModule = DBDateFormatModule;
let PaginationModule = (req, RequestUrl, Page, NoOfRecords, TotalRecords) => {
    let TotalPages = Math.ceil(TotalRecords / NoOfRecords);
    if (TotalPages === 0) {
        TotalPages = 1;
    }
    let From = 0;
    let To = 0;
    let Links = [];
    let FirstPageUrl = "";
    let PreviousPageUrl = "";
    let NextPageUrl = "";
    let LastPageUrl = "";
    let LastPage = TotalPages;
    Links.push({
        url: null,
        label: "&laquo; Previous",
        active: false
    });
    for (let i = 1; i <= TotalPages; i++) {
        (TotalPages === i) ? LastPageUrl = RequestUrl + "?page=" + i : LastPageUrl = null;
        if (i === Page) {
            Links.push({
                url: RequestUrl + "?page=" + i,
                label: i.toString(),
                active: true
            });
        }
        else {
            Links.push({
                url: RequestUrl + "?page=" + i,
                label: i.toString(),
                active: false
            });
        }
    }
    FirstPageUrl = RequestUrl + "?page=1";
    (Page - 1 === 0) ? PreviousPageUrl = null : PreviousPageUrl = RequestUrl + "?page=" + (Page - 1);
    (Page === TotalPages) ? NextPageUrl = null : NextPageUrl = RequestUrl + "?page=" + (Page + 1);
    Links.push({
        url: NextPageUrl,
        label: "Next &raquo;",
        active: false
    });
    From = ((Page - 1) * NoOfRecords) + 1;
    if (NoOfRecords < TotalRecords) {
        To = NoOfRecords * Page;
        if (To > TotalRecords) {
            To = TotalRecords;
        }
    }
    else {
        To = TotalRecords;
    }
    if (TotalRecords === 0) {
        From = null;
        To = null;
        PreviousPageUrl = null;
        NextPageUrl = null;
        LastPageUrl = FirstPageUrl;
        LastPage = 1;
    }
    return {
        status: null,
        current_page: Page,
        data: null,
        first_page_url: FirstPageUrl,
        from: From,
        last_page: LastPage,
        last_page_url: LastPageUrl,
        links: Links,
        next_page_url: NextPageUrl,
        path: RequestUrl,
        per_page: NoOfRecords,
        prev_page_url: PreviousPageUrl,
        to: To,
        total: TotalRecords
    };
};
exports.PaginationModule = PaginationModule;
// ----------- Cloudnary Files Upload 
// export const CloudinaryFilesUpload = async (req: any, Files: any, Path: string): Promise<string[]> => {
//     let FileURLs: string[] = [];
//     for (let i = 0; i < Files.length; i++) {
//         const FileObject = Files[i];
//         const OldPath = FileObject.path;
//         const MAX_SIZE = 5 * 1024 * 1024; // 5MB
//         if (FileObject.size > MAX_SIZE) {
//             throw new Error(`File too large: ${FileObject.originalname}. Max 5MB allowed.`);
//         }
//         try {
//             // Upload file to Cloudinary
//             const result = await cloudinary.uploader.upload(OldPath, {
//                 folder: Path,
//                 resource_type: "auto",
//             });
//             FileURLs.push(result.secure_url);
//             // remove temp file after upload
//             fs.unlinkSync(OldPath);
//         } catch (err: any) {
//             console.log("Cloudinary Upload Error:", err);
//             throw new Error("File upload to Cloudinary failed");
//         }
//     }
//     console.log("✅ Files uploaded successfully:", FileURLs);
//     return FileURLs;
// };
const CloudinaryFilesUpload = (req, Files, Path) => __awaiter(void 0, void 0, void 0, function* () {
    let FileURLs = [];
    for (let i = 0; i < Files.length; i++) {
        const FileObject = Files[i];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (FileObject.size > MAX_SIZE) {
            throw new Error(`File too large: ${FileObject.originalname}. Max 5MB allowed.`);
        }
        try {
            // Read file buffer
            const buffer = fs.readFileSync(FileObject.path);
            // Optimize using Sharp (keep format)
            let img = (0, sharp_1.default)(buffer).resize({ width: 1080, withoutEnlargement: true });
            const metadata = yield img.metadata();
            if (metadata.format === "jpeg" || metadata.format === "jpg") {
                img = img.jpeg({ quality: 70 });
            }
            else if (metadata.format === "png") {
                img = img.png({ compressionLevel: 8 });
            }
            else if (metadata.format === "webp") {
                img = img.webp({ quality: 70 });
            }
            const optimizedBuffer = yield img.toBuffer();
            // Upload buffer to Cloudinary using stream
            const result = yield new Promise((resolve, reject) => {
                const uploadStream = cloudnary_1.default.uploader.upload_stream({
                    folder: Path,
                    resource_type: "auto",
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                streamifier_1.default.createReadStream(optimizedBuffer).pipe(uploadStream);
            });
            FileURLs.push(result.secure_url);
            // Cleanup: remove only original multer file
            try {
                fs.unlinkSync(FileObject.path);
            }
            catch (_a) { }
        }
        catch (err) {
            console.log("Cloudinary Upload Error:", err);
            throw new Error("File upload to Cloudinary failed");
        }
    }
    console.log("✅ Files uploaded successfully:", FileURLs);
    return FileURLs;
});
exports.CloudinaryFilesUpload = CloudinaryFilesUpload;
const CloudinaryDeleteFile = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudnary_1.default.uploader.destroy(publicId);
        return { status: true, message: "File Deleted Successfully" };
    }
    catch (err) {
        return { status: false, message: err.message };
    }
});
exports.CloudinaryDeleteFile = CloudinaryDeleteFile;
const extractPublicId = (url) => {
    const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : "";
};
exports.extractPublicId = extractPublicId;
// ----------- System Files Upload 
// export const FilesUpload = async (req: any, Files: any, Path: string): Promise<string[]> => {
//     const StoragePath = path.resolve('./') + '/public/files/' + Path;
//     await fs.ensureDir(StoragePath);
//     let FileNames: string[] = [];
//     for (let i = 0; i < Files.length; i++) {
//         const FileObject = Files[i];
//         const OldPath = FileObject.path;
//         const Extension = path.extname(OldPath);
//         const Filename = `File-${moment().format('YMMDD-HHmmss')}-${RandomNumber(100000, 99999999)}${Extension}`;
//         const NewPath = StoragePath + Filename;
//         await fs.copy(OldPath, NewPath);
//         FileNames.push(Filename);
//     }
//     console.log("✅ Files uploaded successfully:", FileNames);
//     return FileNames;
// };
const fileImageUrl = (path, fileName) => {
    return process.env.IMAGE_BASE_URL + path + fileName;
};
exports.fileImageUrl = fileImageUrl;
const DeleteFile = (req, res, Files, Path) => __awaiter(void 0, void 0, void 0, function* () {
    const StoragePath = path.resolve("./") + '/public/files/' + Path;
    const filePath = path.join(StoragePath, Files);
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log("File already deleted or not found");
            return { status: true, message: "File already deleted or not found" };
        }
        // If file exists, delete it
        yield fs.promises.unlink(filePath);
        return { status: true, message: "File Deleted Successfully" };
    }
    catch (err) {
        return (0, exports.GenerateErrorResponse)(res, err.message);
    }
});
exports.DeleteFile = DeleteFile;
const DeleteFolder = (req, res, Path) => __awaiter(void 0, void 0, void 0, function* () {
    const StoragePath = path.resolve("./") + '/public/files/' + Path;
    try {
        yield fs.remove(StoragePath);
        return { status: true, message: 'Folder Deleted Success' };
    }
    catch (err) {
        return (0, exports.GenerateErrorResponse)(res, err.message);
    }
});
exports.DeleteFolder = DeleteFolder;
let RandomNumber = (Min, Max) => {
    return Math.round(Math.random() * (Max - Min) + Min);
};
exports.RandomNumber = RandomNumber;
let ConvertDateTimeFormat = (date) => {
    return moment(date, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY hh:mm:ssa');
};
exports.ConvertDateTimeFormat = ConvertDateTimeFormat;
let RandomNumberModule = (Min, Max) => {
    return Math.round(Math.random() * (Max - Min) + Min);
};
exports.RandomNumberModule = RandomNumberModule;
let GenerateBadRequestResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
        status: false,
        message: data
    });
};
exports.GenerateBadRequestResponse = GenerateBadRequestResponse;
let GenerateUnauthorizedResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: data
    });
};
exports.GenerateUnauthorizedResponse = GenerateUnauthorizedResponse;
let GenerateBadGatewayResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.BAD_GATEWAY).json({
        status: false,
        message: data
    });
};
exports.GenerateBadGatewayResponse = GenerateBadGatewayResponse;
let GenerateForbiddenErrorResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
        status: false,
        message: data
    });
};
exports.GenerateForbiddenErrorResponse = GenerateForbiddenErrorResponse;
let GenerateErrorResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: data
    });
};
exports.GenerateErrorResponse = GenerateErrorResponse;
let GenerateSuccessResponse = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.OK).json({
        status: true,
        message: data
    });
};
exports.GenerateSuccessResponse = GenerateSuccessResponse;
let GenerateSuccessResponseWithData = (response, data) => {
    return response.status(http_status_codes_1.StatusCodes.OK).json({
        status: true,
        data: data
    });
};
exports.GenerateSuccessResponseWithData = GenerateSuccessResponseWithData;
let CapitalizeFirstLetter = (sentence) => {
    if (!sentence)
        return sentence;
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};
exports.CapitalizeFirstLetter = CapitalizeFirstLetter;
let CheckEmpty = (word) => {
    return !!word;
};
exports.CheckEmpty = CheckEmpty;
const hasNoDuplicate = (input) => {
    return new Set(input).size === input.length;
};
exports.hasNoDuplicate = hasNoDuplicate;
const isValidNumber = (value) => {
    return !isNaN(value);
};
exports.isValidNumber = isValidNumber;
let WordWrap = (text, wordsPerLine) => {
    if (!text)
        return '';
    const words = text.split(' ');
    let result = '';
    for (let i = 0; i < words.length; i++) {
        result += words[i] + ' ';
        if ((i + 1) % wordsPerLine === 0) {
            result += '<br>';
        }
    }
    return result;
};
exports.WordWrap = WordWrap;
// Date Format
let DateFormat = (date) => {
    const dateObject = moment(date);
    const formattedDate = dateObject.format('DD-MM-YYYY hh:mm A');
    return formattedDate;
};
exports.DateFormat = DateFormat;
let DateBirthFormat = (date) => {
    const dateObject = moment(date);
    const formattedDate = dateObject.format('DD-MM-YYYY');
    return formattedDate;
};
exports.DateBirthFormat = DateBirthFormat;
exports.monthOrder = {
    "Jan": 0,
    "Feb": 1,
    "Mar": 2,
    "Apr": 3,
    "May": 4,
    "Jun": 5
};
// export const Roles = {
//     ADMIN: 1,
//     CUSTOMER: 2,
// };
