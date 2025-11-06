import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/database";
import fs from "fs";
import path from "path";

export const documentRouter = createTRPCRouter({
    // Get all documents for a user (optionally filtered by parent)
    getMany: protectedProcedure
        .query(async ({ ctx }) => {
            const documents = await prisma.document.findMany({
                where: {
                    userId: ctx.auth.userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return documents;
        }),
    // Get a single document by ID
    getById: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Document ID is required" }),
        }))
        .query(async ({ input, ctx }) => {
            const document = await prisma.document.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
            });
            return document;
        }),

    // Create a new document
    create: protectedProcedure
        .input(z.object({
            title: z.string().min(1, { message: "Title is required" }),
            parentDocument: z.string().optional(),
            content: z.string().optional(),
            coverImage: z.string().optional(),
            icon: z.string().optional(),
            isPublished: z.boolean().optional().default(false),
            isArchived: z.boolean().optional().default(false),
        }))
        .mutation(async ({ input, ctx }) => {
            const document = await prisma.document.create({
                data: {
                    title: input.title,
                    userId: ctx.auth.userId,
                    parentDocument: input.parentDocument || null,
                    isPublished: input.isPublished || false,
                    isArchived: input.isArchived || false,
                    content: input.content,
                    coverImage: input.coverImage,
                    icon: input.icon,
                },
            });
            return document;
        }),

    // Update an existing document
    update: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Document ID is required" }),
            title: z.string().optional(),
            content: z.string().optional(),
            coverImage: z.string().optional(),
            icon: z.string().optional(),
            isPublished: z.boolean().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, coverImage, ...updateData } = input;
            
            // If coverImage is being updated, handle cleanup
            if (coverImage !== undefined) {
                // Get current document to check for old cover image
                const currentDocument = await prisma.document.findUnique({
                    where: { id, userId: ctx.auth.userId },
                    select: { coverImage: true }
                });

                if (currentDocument?.coverImage && currentDocument.coverImage !== coverImage) {
                    // If removing cover image (empty string) or changing it, delete old file
                    if (coverImage === "" || currentDocument.coverImage !== coverImage) {
                        try {
                            // Extract filename from URL and delete the file
                            const oldUrl = currentDocument.coverImage;
                            if (oldUrl.includes('/uploads/')) {
                                const filename = oldUrl.split('/uploads/')[1];
                                const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                                
                                if (fs.existsSync(filePath)) {
                                    fs.unlinkSync(filePath);
                                }
                            }
                        } catch (error) {
                            console.error('Error deleting old cover image file:', error);
                        }
                    }
                }
            }
            
            const document = await prisma.document.update({
                where: {
                    id,
                    userId: ctx.auth.userId,
                },
                data: { ...updateData, coverImage },
            });
            return document;
        }),

    // Archive/unarchive a document
    archive: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Document ID is required" }),
            isArchived: z.boolean(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Archive/unarchive the selected document
            const document = await prisma.document.update({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
                data: {
                    isArchived: input.isArchived,
                },
            });

            // Recursively archive/unarchive all descendant documents
            async function updateChildren(docId: string) {
                // Find direct children
                const children = await prisma.document.findMany({
                    where: {
                        parentDocument: docId,
                        userId: ctx.auth.userId,
                    },
                    select: { id: true }
                });

                // Bulk update for immediate children
                if (children.length > 0) {
                    await prisma.document.updateMany({
                        where: {
                            parentDocument: docId,
                            userId: ctx.auth.userId,
                        },
                        data: {
                            isArchived: input.isArchived,
                        },
                    });

                    // Recursively update the children of each child
                    for (const child of children) {
                        await updateChildren(child.id);
                    }
                }
            }

            await updateChildren(input.id);

            return document;
        }),

    // Delete a document
    delete: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Document ID is required" }),
        }))
        .mutation(async ({ input, ctx }) => {
            // Get document and all its images for cleanup
            const document = await prisma.document.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
                select: { 
                    coverImage: true,
                    images: {
                        select: { url: true }
                    }
                }
            });

            if (!document) {
                throw new Error("Document not found or access denied");
            }

            // Delete the document (this will cascade delete images due to onDelete: Cascade)
            await prisma.document.delete({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
            });

            // Clean up cover image file
            if (document.coverImage) {
                try {
                    if (document.coverImage.includes('/uploads/')) {
                        const filename = document.coverImage.split('/uploads/')[1];
                        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                        
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting cover image file:', error);
                }
            }

            // Clean up all inline image files
            for (const image of document.images) {
                try {
                    if (image.url.includes('/uploads/')) {
                        const filename = image.url.split('/uploads/')[1];
                        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                        
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting image file:', error);
                }
            }

            return { success: true };
        }),

    // Get document children
    getChildren: protectedProcedure
        .input(z.object({
            parentId: z.string().min(1, { message: "Parent document ID is required" }),
        }))
        .query(async ({ input, ctx }) => {
            const isRoot = input.parentId === "root";
            const children = await prisma.document.findMany({
                where: {
                    userId: ctx.auth.userId,
                    isArchived: false,
                    ...(isRoot
                        ? { parentDocument: null }
                        : { parentDocument: input.parentId })
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return children;
        }),

    // Move document to different parent
    move: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Document ID is required" }),
            newParentId: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const document = await prisma.document.update({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
                data: {
                    parentDocument: input.newParentId || null,
                },
            });
            return document;
        }),

    // Search documents
    search: protectedProcedure
        .input(z.object({
            query: z.string().min(1, { message: "Search query is required" }),
            isArchived: z.boolean().optional().default(false),
        }))
        .query(async ({ input, ctx }) => {
            const documents = await prisma.document.findMany({
                where: {
                    userId: ctx.auth.userId,
                    isArchived: input.isArchived,
                    OR: [
                        {
                            title: {
                                contains: input.query,
                                mode: 'insensitive',
                            },
                        },
                        {
                            content: {
                                contains: input.query,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
            return documents;
        }),

        // Fetch all archived documents
        archived: protectedProcedure
            .query(async ({ ctx }) => {
                const documents = await prisma.document.findMany({
                    where: {
                        userId: ctx.auth.userId,
                        isArchived: true,
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                });
                return documents;
            }),

    // Search documents
    searchDocuments: protectedProcedure
        .input(z.object({
            query: z.string().min(1, { message: "Search query is required" }),
        }))
        .query(async ({ input, ctx }) => {
            const documents = await prisma.document.findMany({
                where: {
                    userId: ctx.auth.userId,
                    isArchived: false,
                    OR: [
                        {
                            title: {
                                contains: input.query,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
            return documents;
        }),

    // Get document images
    getImages: protectedProcedure
        .input(z.object({
            documentId: z.string().min(1, { message: "Document ID is required" }),
        }))
        .query(async ({ input, ctx }) => {
            const images = await prisma.documentImage.findMany({
                where: {
                    documentId: input.documentId,
                    document: {
                        userId: ctx.auth.userId,
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            return images;
        }),

    // Add image to document
    addImage: protectedProcedure
        .input(z.object({
            documentId: z.string().min(1, { message: "Document ID is required" }),
            url: z.string().url({ message: "Valid URL is required" }),
            alt: z.string().optional(),
            caption: z.string().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Verify document ownership
            const document = await prisma.document.findFirst({
                where: {
                    id: input.documentId,
                    userId: ctx.auth.userId,
                },
            });

            if (!document) {
                throw new Error("Document not found or access denied");
            }

            const image = await prisma.documentImage.create({
                data: {
                    documentId: input.documentId,
                    url: input.url,
                    alt: input.alt,
                    caption: input.caption,
                    width: input.width,
                    height: input.height,
                },
            });

            return image;
        }),

    // Update image
    updateImage: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Image ID is required" }),
            alt: z.string().optional(),
            caption: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...updateData } = input;

            const image = await prisma.documentImage.update({
                where: {
                    id,
                    document: {
                        userId: ctx.auth.userId,
                    },
                },
                data: updateData,
            });

            return image;
        }),

    // Delete image
    deleteImage: protectedProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Image ID is required" }),
        }))
        .mutation(async ({ input, ctx }) => {
            // Get the image first to get the URL for file cleanup
            const image = await prisma.documentImage.findUnique({
                where: {
                    id: input.id,
                    document: {
                        userId: ctx.auth.userId,
                    },
                },
                select: { url: true }
            });

            if (!image) {
                throw new Error("Image not found or access denied");
            }

            // Delete the database record
            await prisma.documentImage.delete({
                where: {
                    id: input.id,
                    document: {
                        userId: ctx.auth.userId,
                    },
                },
            });

            // Clean up the file
            try {
                if (image.url.includes('/uploads/')) {
                    const filename = image.url.split('/uploads/')[1];
                    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                    
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
            }

            return { success: true };
        }),
});