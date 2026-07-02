const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY
})

const saveToCloud = async (image, projectFolder, parentFolder, userFolderId) => {
    const b64 = Buffer.from(image.buffer).toString('base64');
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.uploader.upload(dataURI, { folder:`${projectFolder}/${parentFolder}/${userFolderId}`, resource_type: "image" });
    return res.secure_url;
}

const pdfUpload = async(file, projectFolder, parentFolder, userFolderId) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = `data:${file.mimetype};base64,${b64}`;
    const res = await cloudinary.uploader.upload(dataURI, { folder: folderName, resource_type: "auto" });
    return res.secure_url;
}
module.exports = { saveToCloud, pdfUpload}