import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase";
import { encrypt, decrypt, isEncrypted } from "./encryption";
import { storeGoogleTokens } from "./google-token";
import bcrypt from 'bcryptjs';
// Extend NextAuth types to include custom properties
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            role: string;
            googleId: string;
        } & DefaultSession["user"];
    }
    interface User {
        role: string;
        googleId?: string;
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: string;
        googleId?: string;
        accessToken?: string;
        refreshToken?: string;
    }
}
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar.events",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                // TEST_BYPASS: Allow hardcoded test users for E2E testing
                if (process.env.TEST_BYPASS === 'true') {
                    const testUsers: Record<string, any> = {
                        'teacher@eduverse.com': { id: '00000000-0000-0000-0000-000000000001', email: 'teacher@eduverse.com', name: 'Test Teacher', role: 'teacher', image: null },
                        'student@eduverse.com': { id: '00000000-0000-0000-0000-000000000002', email: 'student@eduverse.com', name: 'Test Student', role: 'student', image: null },
                        'admin@eduverse.com': { id: '00000000-0000-0000-0000-000000000003', email: 'admin@eduverse.com', name: 'Test Admin', role: 'admin', image: null },
                    };
                    const testUser = testUsers[credentials.email as string];
                    if (testUser && credentials.password === 'password123') {
                        console.log("TEST_BYPASS: Returning test user:", testUser.email, testUser.role);
                        return testUser;
                    }
                    console.log("TEST_BYPASS: No matching test user for", credentials.email);
                }

                if (!isSupabaseAdminConfigured || !supabaseAdmin) {
                    console.error('Supabase not configured for credentials auth');
                    throw new Error("Authentication service unavailable");
                }
                try {
                    // Find user by email
                    console.log("Fetching user from Supabase...");
                    const { data: user, error } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email as string)
                        .single();
                    if (error || !user) {
                        console.error("User not found or error:", error);
                        throw new Error("Invalid email or password");
                    }
                    console.log("User found:", user.email, "Has hash:", !!user.password_hash);
                    // Verify password
                    const isValidPassword = await bcrypt.compare(
                        credentials.password as string,
                        user.password_hash || ''
                    );
                    console.log("Password valid:", isValidPassword);
                    if (!isValidPassword) {
                        throw new Error("Invalid email or password");
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Credentials auth error:", error);
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;
            // Skip Supabase sync if not configured
            if (!isSupabaseAdminConfigured || !supabaseAdmin) {
                console.warn('Supabase not configured, skipping user sync');
                return true;
            }
            try {
                // Check if user exists in Supabase
                const { data: existingUser, error: fetchError } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', user.email)
                    .single();
                if (fetchError && fetchError.code !== 'PGRST116') {
                    // PGRST116 = no rows returned (user doesn't exist)
                    console.error("Error fetching user:", fetchError);
                }
                if (!existingUser) {
                    // Create new user
                    const { error: insertError } = await supabaseAdmin
                        .from('users')
                        .insert({
                            email: user.email,
                            name: user.name || 'Unknown',
                            image: user.image,
                            role: 'student', // Default role for Google sign-ups
                            google_id: account?.providerAccountId,
                            last_login: new Date().toISOString(),
                        });
                    if (insertError) {
                        console.error("Error creating user:", insertError);
                    }
                } else {
                    // Update existing user's last login and store Google tokens
                    // We need a specific type for the update object since Database type is strict
                    const updateData: any = {
                        last_login: new Date().toISOString(),
                        image: user.image, // Update image from Google
                        name: user.name || existingUser.name,
                        google_id: account?.providerAccountId || existingUser.google_id,
                    };
                    // Store Google tokens if this is a Google sign-in
                    if (account?.provider === 'google' && account.access_token) {
                        updateData.google_access_token = encrypt(account.access_token);
                        if (account.refresh_token) {
                            updateData.google_refresh_token = encrypt(account.refresh_token);
                        }
                        if (account.expires_at) {
                            updateData.google_token_expires_at = new Date(account.expires_at * 1000).toISOString();
                        }
                    }
                    const { error: updateError } = await supabaseAdmin
                        .from('users')
                        .update(updateData)
                        .eq('email', user.email);
                    if (updateError) {
                        console.error("Error updating user:", updateError);
                    }
                }
                return true;
            } catch (error) {
                console.error("Error syncing user to Supabase:", error);
                return true; // Allow sign in even if sync fails
            }
        },
        async jwt({ token, account, user }) {
            // Persist properties from user object on first sign in
            if (user) {
                token.userId = user.id;
                token.role = user.role;
            }
            // Persist the OAuth access_token and user data to the token
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.googleId = account.providerAccountId;
            }
            // Fetch user role from Supabase if still missing but we have an email
            if (!token.role && token.email && isSupabaseAdminConfigured && supabaseAdmin) {
                try {
                    const { data: dbUser } = await supabaseAdmin
                        .from('users')
                        .select('id, role')
                        .eq('email', token.email)
                        .single();
                    if (dbUser) {
                        token.userId = (dbUser as any).id;
                        token.role = (dbUser as any).role;
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (session.user) {

                session.accessToken = token.accessToken;

                session.user.id = token.userId as string;

                session.user.googleId = token.googleId as string;

                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
// Helper to get current user from session
export async function getCurrentUser(session: any): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    googleId: string;
} | null> {
    if (!session?.user?.email) return null;

    // FAST PATH OPTIMIZATION: Return from session JWT if data is already available
    if (session.user.id && session.user.role) {
        return {
            id: session.user.id as string,
            email: session.user.email,
            name: session.user.name || '',
            role: session.user.role as string,
            googleId: (session.user as any).googleId || '',
        };
    }

    // If Supabase is not configured, return basic user from session
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return {
            id: session.user.id || '',
            email: session.user.email,
            name: session.user.name || '',
            role: session.user.role || 'student',
            googleId: session.user.googleId || '',
        };
    }
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role, google_id')
            .eq('email', session.user.email)
            .single();
        if (error || !user) {
            // Fallback: return user info from session when DB is unreachable or user not found
            if (error && session.user.email) {
                return {
                    id: (session.user as any).id || '',
                    email: session.user.email,
                    name: session.user.name || '',
                    role: (session.user as any).role || 'student',
                    googleId: (session.user as any).googleId || '',
                };
            }
            return null;
        }
        return {
            id: (user as any).id,
            email: (user as any).email,
            name: (user as any).name,
            role: (user as any).role,
            googleId: (user as any).google_id || '',
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        // Fallback: return user info from session if available (e.g. when DB is unreachable)
        if (session.user.email) {
            return {
                id: (session.user as any).id || '',
                email: session.user.email,
                name: session.user.name || '',
                role: (session.user as any).role || 'student',
                googleId: (session.user as any).googleId || '',
            };
        }
        return null;
    }
}
// Helper to check if user has required role
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
}
// Helper to check if user is admin
export function isAdmin(userRole: string | undefined): boolean {
    return userRole === 'admin';
}
// Helper to check if user is supervisor
export function isSupervisor(userRole: string | undefined): boolean {
    return userRole === 'supervisor';
}
// Helper to check if user is supervisor or admin
export function isSupervisorOrAdmin(userRole: string | undefined): boolean {
    return userRole === 'supervisor' || userRole === 'admin';
}
// Helper to check if user is teacher or admin
export function isTeacherOrAdmin(userRole: string | undefined): boolean {
    return userRole === 'teacher' || userRole === 'admin';
}

