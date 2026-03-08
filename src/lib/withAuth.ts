import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { generateRequestId } from '@/lib/request-id';
import { reportError } from '@/lib/crash-reporter';

type Role = 'admin' | 'supervisor' | 'teacher' | 'student' | 'parent';

interface AuthContext {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        googleId: string;
    };
    requestId: string;
}

type APIHandler = (
    req: Request,
    context: AuthContext,
    params?: any
) => Promise<NextResponse> | NextResponse;

interface WithAuthOptions {
    allowedRoles?: Role[];
}

/**
 * Higher-order function to wrap API routes with authentication and role-based authorization.
 * 
 * @param handler The API route handler
 * @param options Configuration options including allowed roles
 * @returns A wrapped Next.js API route handler
 */
export function withAuth(handler: APIHandler, options?: WithAuthOptions) {
    return async (req: Request, params?: any) => {
        const requestId = generateRequestId();

        try {
            const session = await getServerSession(authOptions);

            if (!session?.user) {
                return NextResponse.json(
                    { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                    { status: 401 }
                );
            }

            const currentUser = await getCurrentUser(session);

            if (!currentUser) {
                return NextResponse.json(
                    { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                    { status: 401 }
                );
            }

            // Check roles if specified
            if (options?.allowedRoles && options.allowedRoles.length > 0) {
                if (!options.allowedRoles.includes(currentUser.role as Role)) {
                    return NextResponse.json(
                        { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                        { status: 403 }
                    );
                }
            }

            const authContext: AuthContext = {
                user: currentUser,
                requestId
            };

            return await handler(req, authContext, params);
        } catch (error) {
            reportError(error, {
                route: req.url,
                method: req.method,
                requestId
            });
            return NextResponse.json(
                { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
                { status: 500 }
            );
        }
    };
}
