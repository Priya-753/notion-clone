import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/database";

export const documentRouter = createTRPCRouter({
    // Get all documents for a user (optionally filtered by parent)
    getMany: protectedProcedure
        .query(async ({ input, ctx }) => {
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
            const { id, ...updateData } = input;
            
            const document = await prisma.document.update({
                where: {
                    id,
                    userId: ctx.auth.userId,
                },
                data: updateData,
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
            await prisma.document.delete({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId,
                },
            });
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
});