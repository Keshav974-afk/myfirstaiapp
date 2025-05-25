// Update the handleUpload function in app/(tabs)/index.tsx
const handleUpload = async (file: any) => {
  if (!file) return;

  let prompt = '';
  if (file.type === 'image') {
    prompt = `[Analyzing image...]\n\nI'm sharing an image with you. Here's the base64-encoded image data:\n\ndata:image/jpeg;base64,${file.base64}\n\nPlease analyze this image and describe what you see in detail.`;
  } else {
    prompt = `[Analyzing document: ${file.name}]\n\nHere's the base64-encoded content of the document:\n\ndata:application/octet-stream;base64,${file.base64}\n\nPlease help me understand or analyze this document.`;
  }

  await sendMessage(prompt);
};