import { StatusCodes } from 'http-status-codes';
// import User from '../database/models/User';
// import transporter from '../lib/sendEmail';
import cloudinary from '../lib/cloudnary';
import https from "https";
const crypto = require('crypto');
import sharp from "sharp";
const path = require("path");
import streamifier from "streamifier";
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

export const sendOtpWithTwilioSendGrid = async (
    email: string,
    link: string
): Promise<any> => {
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

    const agent = new https.Agent({
        keepAlive: true,
        minVersion: "TLSv1.2",
    });

    try {
        const response = await axios.post(
            "https://api.sendgrid.com/v3/mail/send",
            data,
            {
                headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_MAIL_API_KEY}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: agent,
                timeout: 10000, // 10s just in case
            }
        );

        console.log(`OTP sent successfully to ${email}`);
        return { status: true, message: `OTP sent successfully to ${email}` };
    } catch (error: any) {
        console.error("SendGrid error:", error.message || error);
        return { status: false, message: `Error while sending OTP to ${email}` };
    }
};

export let DBDateFormatModule = (): string => {
    const dateObject = new Date();
    const date = dateObject.getDate() < 10 ? "0" + dateObject.getDate() : dateObject.getDate();
    const month = (dateObject.getMonth() + 1) < 10 ? "0" + (dateObject.getMonth() + 1) : (dateObject.getMonth() + 1);
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours() < 10 ? "0" + dateObject.getHours() : dateObject.getHours();
    const minutes = dateObject.getMinutes() < 10 ? "0" + dateObject.getMinutes() : dateObject.getMinutes();
    const seconds = dateObject.getSeconds() < 10 ? "0" + dateObject.getSeconds() : dateObject.getSeconds();
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};

export let PaginationModule = (req: any, RequestUrl: string, Page: number, NoOfRecords: number, TotalRecords: number): any => {
    let TotalPages = Math.ceil(TotalRecords / NoOfRecords);
    if (TotalPages === 0) {
        TotalPages = 1;
    }
    let From: any = 0;
    let To: any = 0;
    let Links = [];
    let FirstPageUrl: any = "";
    let PreviousPageUrl: any = "";
    let NextPageUrl: any = "";
    let LastPageUrl: any = "";
    let LastPage: any = TotalPages;
    Links.push({
        url: null,
        label: "&laquo; Previous",
        active: false
    });
    for (let i: number = 1; i <= TotalPages; i++) {
        (TotalPages === i) ? LastPageUrl = RequestUrl + "?page=" + i : LastPageUrl = null;
        if (i === Page) {
            Links.push({
                url: RequestUrl + "?page=" + i,
                label: i.toString(),
                active: true
            });
        } else {
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
    } else {
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

export const CloudinaryFilesUpload = async (
  req: any,
  Files: any,
  Path: string
): Promise<string[]> => {
  let FileURLs: string[] = [];

  for (let i = 0; i < Files.length; i++) {
    const FileObject = Files[i];

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (FileObject.size > MAX_SIZE) {
      throw new Error(
        `File too large: ${FileObject.originalname}. Max 5MB allowed.`
      );
    }

    try {
      // Read file buffer
      const buffer = fs.readFileSync(FileObject.path);

      // Optimize using Sharp (keep format)
      let img = sharp(buffer).resize({ width: 1080, withoutEnlargement: true });
      const metadata = await img.metadata();

      if (metadata.format === "jpeg" || metadata.format === "jpg") {
        img = img.jpeg({ quality: 70 });
      } else if (metadata.format === "png") {
        img = img.png({ compressionLevel: 8 });
      } else if (metadata.format === "webp") {
        img = img.webp({ quality: 70 });
      }

      const optimizedBuffer = await img.toBuffer();

      // Upload buffer to Cloudinary using stream
      const result: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: Path,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
      });

      FileURLs.push(result.secure_url);

      // Cleanup: remove only original multer file
      try { fs.unlinkSync(FileObject.path); } catch {}
    } catch (err: any) {
      console.log("Cloudinary Upload Error:", err);
      throw new Error("File upload to Cloudinary failed");
    }
  }

  console.log("✅ Files uploaded successfully:", FileURLs);
  return FileURLs;
};


export const CloudinaryDeleteFile = async (publicId: string): Promise<any> => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return { status: true, message: "File Deleted Successfully" };
    } catch (err: any) {
        return { status: false, message: err.message };
    }
};

export const extractPublicId = (url: string): string => {
    const match = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : "";
}

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

export const fileImageUrl = (path: any, fileName: any): any => {
    return process.env.IMAGE_BASE_URL + path + fileName;
};

export const DeleteFile = async (req: any, res: any, Files: any, Path: any): Promise<any> => {
    const StoragePath = path.resolve("./") + '/public/files/' + Path;
    const filePath = path.join(StoragePath, Files);

    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log("File already deleted or not found");
            return { status: true, message: "File already deleted or not found" };
        }

        // If file exists, delete it
        await fs.promises.unlink(filePath);
        return { status: true, message: "File Deleted Successfully" };
    } catch (err: any) {
        return GenerateErrorResponse(res, err.message);
    }
};

export const DeleteFolder = async (req: any, res: any, Path: string): Promise<any> => {
    const StoragePath = path.resolve("./") + '/public/files/' + Path;
    try {
        await fs.remove(StoragePath);
        return { status: true, message: 'Folder Deleted Success' };
    } catch (err: any) {
        return GenerateErrorResponse(res, err.message);
    }
};

export let RandomNumber = (Min: number, Max: number): number => {
    return Math.round(Math.random() * (Max - Min) + Min);
};

export let ConvertDateTimeFormat = (date: string): string => {
    return moment(date, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY hh:mm:ssa');
};

export let RandomNumberModule = (Min: number, Max: number): number => {
    return Math.round(Math.random() * (Max - Min) + Min);
};

export let GenerateBadRequestResponse = (response: any, data: string): any => {
    return response.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: data
    });
};

export let GenerateUnauthorizedResponse = (response: any, data: string): any => {
    return response.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: data
    });
};

export let GenerateBadGatewayResponse = (response: any, data: string): any => {
    return response.status(StatusCodes.BAD_GATEWAY).json({
        status: false,
        message: data
    });
};

export let GenerateForbiddenErrorResponse = (response: any, data: string): any => {
    return response.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: data
    });
};

export let GenerateErrorResponse = (response: any, data: any): any => {
    return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: data
    });
};

export let GenerateSuccessResponse = (response: any, data: any): any => {
    return response.status(StatusCodes.OK).json({
        status: true,
        message: data
    });
};

export let GenerateSuccessResponseWithData = (response: any, data: any): any => {
    return response.status(StatusCodes.OK).json({
        status: true,
        data: data
    });
};

export let CapitalizeFirstLetter = (sentence: string) => {
    if (!sentence) return sentence;
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

export let CheckEmpty = (word: any) => {
    return !!word;
};

export const hasNoDuplicate = (input: string[]) => {
    return new Set(input).size === input.length;
};

export const isValidNumber = (value: any) => {
    return !isNaN(value);
}

export let WordWrap = (text: any, wordsPerLine: number) => {
    if (!text) return '';
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

// Date Format
export let DateFormat = (date: any) => {
    const dateObject = moment(date);
    const formattedDate = dateObject.format('DD-MM-YYYY hh:mm A');
    return formattedDate;
}

export let DateBirthFormat = (date: any) => {
    const dateObject = moment(date);
    const formattedDate = dateObject.format('DD-MM-YYYY');
    return formattedDate;
}

export let monthOrder: { [key: string]: number } = {
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



