"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { ImageDisplay } from "./image-display";
import { InlineImage } from "./inline-image";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const ImageExamples = () => {
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // Mock upload function for examples - converts file to data URL
  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageInsert = (key: string) => (url: string, alt?: string, caption?: string) => {
    setUploadedImages(prev => ({ ...prev, [key]: url }));
  };

  const handleImageSelect = (key: string) => (imageUrl: string) => {
    setUploadedImages(prev => ({ ...prev, [key]: imageUrl }));
  };

  const handleImageRemove = (key: string) => () => {
    setUploadedImages(prev => {
      const newImages = { ...prev };
      delete newImages[key];
      return newImages;
    });
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Image Upload Examples</h1>
      
      {/* Default Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Default Image Upload</CardTitle>
          <CardDescription>Full-featured image upload with drag & drop</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageInsert={handleImageInsert("default")}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Compact Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Compact Image Upload</CardTitle>
          <CardDescription>Smaller, more compact version</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageInsert={handleImageInsert("compact")}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Minimal Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Minimal Image Upload</CardTitle>
          <CardDescription>Just a button for minimal UI</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageInsert={handleImageInsert("minimal")}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      {/* Inline Images */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Images</CardTitle>
          <CardDescription>Images that can be embedded anywhere in content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Here's some text with an inline image:</p>
          
          <InlineImage
            src={uploadedImages.inline1}
            onImageSelect={handleImageSelect("inline1")}
            onImageRemove={handleImageRemove("inline1")}
            placeholder="Add an image here"
            size="medium"
          />
          
          <p>And here's another one:</p>
          
          <InlineImage
            src={uploadedImages.inline2}
            onImageSelect={handleImageSelect("inline2")}
            onImageRemove={handleImageRemove("inline2")}
            placeholder="Another image"
            size="small"
          />
          
          <p>You can add images anywhere in your content!</p>
        </CardContent>
      </Card>

      {/* Image Display Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Image Display Examples</CardTitle>
          <CardDescription>Different ways to display uploaded images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadedImages.default && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Default Display</h3>
              <ImageDisplay
                src={uploadedImages.default}
                alt="Uploaded image"
                className="max-w-md"
                caption="This is a caption for the image"
              />
            </div>
          )}
          
          {uploadedImages.compact && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Small Display</h3>
              <ImageDisplay
                src={uploadedImages.compact}
                alt="Compact image"
                className="max-w-xs"
                width={200}
                height={150}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear All */}
      <div className="flex justify-center">
        <Button
          onClick={() => setUploadedImages({})}
          variant="outline"
        >
          Clear All Images
        </Button>
      </div>
    </div>
  );
};
