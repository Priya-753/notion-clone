import { createTRPCRouter } from '../init';
import { documentRouter } from '@/modules/document-procedure';

export const appRouter = createTRPCRouter({
  document: documentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;