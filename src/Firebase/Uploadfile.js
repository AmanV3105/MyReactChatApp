import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './Firebase';

const UploadFile = async (file) => {
    if (!file) {
        throw new Error("No file provided for upload");
    }

    // Generate a unique file name using timestamp
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const storageRef = ref(storage, `images/${fileName}`);
    
    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
                if (snapshot.state === 'paused') {
                    console.log('Upload is paused');
                } else if (snapshot.state === 'running') {
                    console.log('Upload is running');
                }
            },
            (error) => {
                // Handle upload errors
                console.error("Upload failed:", error.message);
                reject(new Error("Failed to upload file. Please try again."));
            },
            async () => {
                // Upload completed successfully
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File uploaded successfully. Download URL:", downloadURL);
                    resolve(downloadURL);
                } catch (error) {
                    console.error("Failed to retrieve download URL:", error.message);
                    reject(new Error("Failed to retrieve file URL after upload."));
                }
            }
        );
    });
};

export default UploadFile;