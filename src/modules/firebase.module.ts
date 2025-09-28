// import moment from 'moment';
// import { GenerateErrorResponse, RandomNumberModule } from './common.modules';
// const path = require("path");
// const fs = require("fs-extra");


// export let firebaseFilesUpload = async (req: any, res: any, Files: any[], Path: string, bucket: any, Callback: (fileName: string) => void): Promise<string[]> => {
//     let FileNames: string[] = [];

//     for (let i = 0; i < Files.length; i++) {
//         let FileObject = Files[i];

//         const FilePath = FileObject.path;
//         const Extension = path.extname(FileObject.originalFilename || FilePath);
//         const Filename = `File-${moment().format('YYYYMMDD-HHmmss')}-${RandomNumberModule(100000, 99999999)}${Extension}`;
//         // const updatePath = Folder ? path.join(Path, String(Folder)) : Path;
//         const StoragePath = path.join(Path, Filename).replace(/\\/g, '/');
//         const file = bucket.file(StoragePath);
//         await new Promise<void>((resolve, reject) => {
//             const stream = file.createWriteStream({
//                 metadata: {
//                     contentType: FileObject.type,
//                 },
//             });
//             stream.on('error', (err: any) => {
//                 console.log(err.message);
//                 return GenerateErrorResponse(res, err);
//             });

//             stream.on('finish', () => {
//                 resolve();
//             }); 

//             fs.createReadStream(FilePath).pipe(stream);
//         });
//         await file.makePublic();
//         Callback(Filename);
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/${StoragePath}`;
//         FileNames.push(publicUrl);
//     }

//     return FileNames;
// };

// export const firebaseDeleteFile = async (filePath: string, bucket: any): Promise<any> => {
//     try {
//         const file = bucket.file(filePath);
//         await file.delete();
//         console.log(`File ${filePath} deleted successfully.`);
//         return true;
//     } catch (error) {
//         console.error(`Failed to delete file ${filePath}:`, error);
//         return false;
//     }
// };

// export const uploadQRToFirebase = async (req: any, res: any, Path: any, base64Data: string, Filename: string, bucket: any): Promise<any> => {

//     const buffer = Buffer.from(base64Data, 'base64');
//     const StoragePath = path.join(Path, Filename).replace(/\\/g, '/');
//     const file = bucket.file(StoragePath);
//     try {
//         await new Promise((resolve, reject) => {
//             const stream = file.createWriteStream({
//                 metadata: {
//                     contentType: 'image/png',
//                 },
//             });

//             stream.on('error', (err: any) => reject(err));
//             stream.on('finish', () => resolve(true));

//             stream.end(buffer); // Upload the buffer
//         });
//         await file.makePublic();
//         const publicUrl = `https://storage.googleapis.com/${bucket.name}/visitors/${Filename}`;
//         // return publicUrl; // Return the public URL of the uploaded file
//         return true;
//     } catch (err: any) {
//         return GenerateErrorResponse(res, err.message);
//     }
// };

// export const uploadPDFToFirebase = async (
//     req: any,
//     res: any,
//     Path: string,
//     pdfBuffer: Buffer,
//     Filename: string,
//     bucket: any
// ): Promise<boolean> => {
//     const StoragePath = path.join(Path, Filename).replace(/\\/g, '/'); // Standardize path
//     const file = bucket.file(StoragePath);

//     try {
//         // Create a write stream to upload the PDF buffer to Firebase
//         await new Promise((resolve, reject) => {
//             const stream = file.createWriteStream({
//                 metadata: {
//                     contentType: 'application/pdf', // Specify PDF MIME type
//                 },
//             });

//             stream.on('error', (err: any) => reject(err)); // Handle errors
//             stream.on('finish', () => resolve(true)); // Resolve promise on success

//             stream.end(pdfBuffer); // Upload the buffer
//         });

//         // Make the file public
//         await file.makePublic();

//         // Return the file name
//         return true;
//     } catch (err: any) {
//         throw new Error(`Failed to upload PDF to Firebase: ${err.message}`);
//     }
// };