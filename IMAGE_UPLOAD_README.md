# Image Upload System

This document explains the versatile image upload system implemented in the Notion clone application.

## Components Overview

### 1. ImageUpload Component
A versatile image upload component that can be used anywhere in the application.

**Features:**
- Drag & drop support
- File validation (type, size)
- Multiple variants (default, compact, minimal)
- Preview functionality
- Error handling

**Usage:**
```tsx
import { ImageUpload } from "@/components/image-upload";

<ImageUpload
  onImageSelect={(imageUrl) => console.log(imageUrl)}
  onImageRemove={() => console.log("removed")}
  currentImage={currentImageUrl}
  placeholder="Upload an image"
  variant="default" // "default" | "compact" | "minimal"
  maxSize={5} // MB
  acceptedFormats={["image/jpeg", "image/png", "image/gif", "image/webp"]}
/>
```

### 2. ImageDisplay Component
A component for displaying images with various features.

**Features:**
- Fullscreen modal
- Download functionality
- Remove functionality
- Loading states
- Error handling
- Caption support

**Usage:**
```tsx
import { ImageDisplay } from "@/components/image-display";

<ImageDisplay
  src={imageUrl}
  alt="Image description"
  showFullscreen={true}
  showDownload={true}
  editable={true}
  onRemove={() => console.log("removed")}
  caption="Image caption"
/>
```

### 3. InlineImage Component
A component for embedding images inline with content.

**Features:**
- Inline editing
- Multiple sizes
- Seamless integration with text content

**Usage:**
```tsx
import { InlineImage } from "@/components/inline-image";

<InlineImage
  src={imageUrl}
  onImageSelect={(imageUrl) => setImage(imageUrl)}
  onImageRemove={() => setImage("")}
  size="medium" // "small" | "medium" | "large" | "full"
  placeholder="Add an image"
/>
```

### 4. RichTextEditor Component
A rich text editor that supports inline images.

**Features:**
- Block-based content
- Inline image support
- Real-time editing
- Content serialization

**Usage:**
```tsx
import { RichTextEditor } from "@/components/rich-text-editor";

<RichTextEditor
  content={documentContent}
  onChange={(content) => updateContent(content)}
  placeholder="Start writing..."
  editable={true}
/>
```

## Hooks

### useImageUpload Hook
A custom hook for managing image uploads with document integration.

**Usage:**
```tsx
import { useImageUpload } from "@/hooks/use-image-upload";

const { uploadImage, removeImage, isUploading, error } = useImageUpload({
  documentId: "document-id",
  imageField: "coverImage", // or "content"
  onSuccess: (imageUrl) => console.log("Uploaded:", imageUrl),
  onError: (error) => console.error("Error:", error),
});
```

## Integration Examples

### 1. Cover Image Modal
The cover image modal uses the ImageUpload component to allow users to set document cover images.

### 2. Document Content
The document page uses the RichTextEditor which supports inline images throughout the content.

### 3. Standalone Image Upload
You can use the ImageUpload component anywhere in your application for any image upload needs.

## Storage Options

Currently, the system stores images as base64 data URLs. For production use, consider:

1. **AWS S3**: Upload images to S3 and store URLs
2. **Cloudinary**: Use Cloudinary for image management and optimization
3. **Vercel Blob**: Use Vercel's blob storage for easy deployment
4. **Supabase Storage**: Use Supabase for database and storage

## API Endpoint

There's a placeholder API endpoint at `/api/upload-image` that can be extended to handle cloud storage uploads.

## File Structure

```
src/
├── components/
│   ├── image-upload.tsx      # Main upload component
│   ├── image-display.tsx    # Image display component
│   ├── inline-image.tsx     # Inline image component
│   ├── rich-text-editor.tsx # Rich text editor with images
│   ├── cover-image-modal.tsx # Cover image modal
│   └── image-examples.tsx    # Usage examples
├── hooks/
│   └── use-image-upload.tsx # Image upload hook
└── app/api/
    └── upload-image/
        └── route.ts          # Upload API endpoint
```

## Customization

### Styling
All components use Tailwind CSS classes and can be customized with the `className` prop.

### Validation
File validation can be customized through props:
- `maxSize`: Maximum file size in MB
- `acceptedFormats`: Array of accepted MIME types

### Storage
The storage mechanism can be easily swapped by modifying the `useImageUpload` hook or the API endpoint.

## Best Practices

1. **Always validate files** on both client and server side
2. **Implement proper error handling** for upload failures
3. **Use appropriate image sizes** to avoid performance issues
4. **Consider image optimization** for better performance
5. **Implement proper loading states** for better UX

## Future Enhancements

1. **Image optimization**: Automatic resizing and compression
2. **Multiple file uploads**: Support for uploading multiple images at once
3. **Image editing**: Basic editing capabilities like crop, rotate
4. **Cloud storage integration**: Direct upload to cloud services
5. **Image galleries**: Collections of images with management features
