import React, { useRef } from "react";
import { Box, Button, Text, useToast, Image, VStack } from "@chakra-ui/react";

interface ImageUploadProps {
  onImageLoaded: (url: string) => void;
  currentImageUrl?: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_SIZE_MB = 10;

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageLoaded,
  currentImageUrl,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported file type", status: "error" });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: "File too large (max 10MB)", status: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageLoaded(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Box
      border="2px dashed"
      borderColor="primary.light"
      borderRadius="lg"
      p={4}
      textAlign="center"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      mb={4}
      bg="surface.light"
    >
      <VStack spacing={2}>
        <Text fontWeight="bold">Upload an Engineering Drawing</Text>
        <Text fontSize="sm">Supported formats: JPG, PNG, GIF</Text>
        <Button
          onClick={() => inputRef.current?.click()}
          colorScheme="teal"
          size="sm"
        >
          Select File
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={handleChange}
          title="Upload engineering drawing image file"
          placeholder="Select an image file"
        />
        {currentImageUrl && (
          <Image
            src={currentImageUrl}
            alt="Preview"
            maxH="200px"
            mx="auto"
            mt={2}
            borderRadius="md"
          />
        )}
      </VStack>
    </Box>
  );
};

export default ImageUpload;
