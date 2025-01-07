const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Process attendance images (class photos or attendance sheet)
const processAttendanceImage = async (images) => {
  try {
    if (Array.isArray(images)) {
      // Handle multiple class photos
      return await processClassPhotos(images);
    } else {
      // Handle single attendance sheet
      return await processAttendanceSheet(images);
    }
  } catch (error) {
    console.error('Error processing images:', error);
    throw new Error('Failed to process attendance images');
  }
};

// Process multiple class photos
const processClassPhotos = async (images) => {
  try {
    // Create processed directory if it doesn't exist
    const processedDir = path.join('uploads', 'processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Process each image
    const processedImages = await Promise.all(images.map(async (image) => {
      const processedPath = path.join(processedDir, `processed-${path.basename(image.path)}`);
      
      // Enhance image quality for better face detection
      await sharp(image.path)
        .resize(1024, null, { // Resize width to 1024px, maintain aspect ratio
          withoutEnlargement: true
        })
        .sharpen()
        .normalize() // Normalize image contrast
        .toFile(processedPath);

      return processedPath;
    }));

    // TODO: Implement face detection and recognition
    // For now, return a message that this feature is under development
    return {
      message: "Yet Under Development. Mr. Uddit will update you once we have tested upon real data of student images.",
      processedImages
    };
  } catch (error) {
    console.error('Error processing class photos:', error);
    throw error;
  }
};

// Process attendance sheet image
const processAttendanceSheet = async (image) => {
  try {
    // Create processed directory if it doesn't exist
    const processedDir = path.join('uploads', 'processed');
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    const processedPath = path.join(processedDir, `processed-${path.basename(image.path)}`);

    // Enhance image quality for better text recognition
    await sharp(image.path)
      .resize(2048, null, { // Resize width to 2048px, maintain aspect ratio
        withoutEnlargement: true
      })
      .sharpen()
      .normalize() // Normalize image contrast
      .toFile(processedPath);

    // TODO: Implement OCR for attendance sheet processing
    // For now, return a message that this feature is under development
    return {
      message: "Yet Under Development. Mr. Uddit will update you once we have tested upon real data of attendance sheets.",
      processedPath
    };
  } catch (error) {
    console.error('Error processing attendance sheet:', error);
    throw error;
  }
};

module.exports = {
  processAttendanceImage
};