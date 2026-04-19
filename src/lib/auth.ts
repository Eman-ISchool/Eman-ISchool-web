import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase";
import { encrypt } from "./encryption";
import bcrypt from 'bcryptjs';
import { getPhoneCandidates, isEmailIdentifier } from './auth-credentials';
import { normalizeReferenceSessionIdentity } from './reference-session-normalization';
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
                identifier: { label: "Identifier", type: "text" },
                email: { label: "Email", type: "email" },
                phone: { label: "Phone", type: "text" },
                countryCode: { label: "Country Code", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const identifier =
                    (credentials?.identifier as string | undefined)?.trim() ||
                    (credentials?.email as string | undefined)?.trim() ||
                    (credentials?.phone as string | undefined)?.trim();
                const countryCode = credentials?.countryCode as string | undefined;
                const loginByEmail = isEmailIdentifier(identifier);

                if (!identifier || !credentials?.password) {
                    throw new Error("Email or phone and password required");
                }

                if (!isSupabaseAdminConfigured || !supabaseAdmin) {
                    console.error('Supabase not configured for credentials auth');
                    throw new Error("Authentication service unavailable");
                }
                try {
                    let user: any = null;

                    if (loginByEmail) {
                        const { data, error } = await supabaseAdmin
                            .from('users')
                            .select('*')
                            .eq('email', identifier.toLowerCase())
                            .maybeSingle();
                        if (error) {
                            console.error("[AUTH] Email lookup error:", error.message);
                        }
                        user = data;
                    } else {
                        // Phone login: use array query instead of maybeSingle
                        // to avoid errors when multiple phone format variants match
                        const phoneCandidates = getPhoneCandidates(
                            credentials.phone as string | undefined || identifier,
                            countryCode,
                        );
                        const { data: matches, error } = await supabaseAdmin
                            .from('users')
                            .select('*')
                            .in('phone', phoneCandidates)
                            .limit(5);

                        if (error) {
                            console.error("[AUTH] Phone lookup error:", error.message);
                        }

                        if (matches && matches.length > 0) {
                            // Prefer exact match with full international format
                            const fullPhone = countryCode
                                ? `+${countryCode.replace(/\D/g, '')}${(credentials.phone as string || identifier).replace(/\D/g, '')}`
                                : null;
                            user = (fullPhone && matches.find((m: any) => m.phone === fullPhone))
                                || matches[0];
                        }

                        console.log("[AUTH] Phone lookup:", {
                            candidates: phoneCandidates,
                            matchCount: matches?.length || 0,
                            foundUser: user?.email || null,
                            storedPhone: user?.phone || null,
                        });
                    }

                    if (!user) {
                        console.error("[AUTH] User not found for identifier:", identifier);
                        throw new Error("Invalid email/phone or password");
                    }

                    // Check if user account is active
                    if (user.is_active === false) {
                        console.error('[AUTH] Account deactivated for:', user.email);
                        throw new Error("Account is deactivated");
                    }

                    // Verify password — reject if no password_hash is set (e.g. Google-only accounts)
                    if (!user.password_hash) {
                        console.error('[AUTH] No password_hash for:', user.email);
                        throw new Error("No password set for this account. Try Google sign-in.");
                    }

                    const passwordInput = credentials.password as string;
                    const isValidPassword = await bcrypt.compare(
                        passwordInput,
                        user.password_hash
                    );
                    if (!isValidPassword) {
                        // Debug: verify bcrypt itself works by re-hashing and comparing
                        const testHash = await bcrypt.hash(passwordInput, 10);
                        const testCompare = await bcrypt.compare(passwordInput, testHash);
                        console.error('[AUTH] Invalid password for:', user.email, {
                            inputLength: passwordInput.length,
                            inputChars: Array.from(passwordInput).map(c => c.charCodeAt(0)),
                            hashPrefix: user.password_hash.substring(0, 7),
                            hashLength: user.password_hash.length,
                            bcryptSelfTest: testCompare, // should always be true
                        });
                        throw new Error("Invalid email or password");
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                    };
                } catch (error: any) {
                    console.error("[AUTH] Credentials auth error:", error?.message || error);
                    // Re-throw with the original message so it's visible in logs
                    throw error instanceof Error ? error : new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Always land authenticated users at /<locale>/dashboard.
            // url may be a full URL or a relative path; parse defensively.
            let path = url;
            try {
                path = new URL(url, baseUrl).pathname;
            } catch {
                path = url;
            }
            const localeMatch = path.match(/^\/(ar|en)(\/|$)/);
            const locale = localeMatch?.[1] ?? 'ar';
            return `${baseUrl}/${locale}/dashboard`;
        },
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

            const normalizedToken = normalizeReferenceSessionIdentity({
                email: token.email,
                name: token.name,
                role: token.role,
            });

            token.name = normalizedToken.name ?? token.name;
            token.role = normalizedToken.role ?? token.role;
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (session.user) {
                const normalizedSessionUser = normalizeReferenceSessionIdentity({
                    email: session.user.email,
                    name: session.user.name,
                    role: token.role as string | undefined,
                });

                session.accessToken = token.accessToken;

                session.user.id = token.userId as string;

                session.user.googleId = token.googleId as string;

                session.user.email = normalizedSessionUser.email ?? session.user.email;
                session.user.name = normalizedSessionUser.name ?? session.user.name;
                session.user.role = normalizedSessionUser.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/en/login',
        error: '/en/login',
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

    const normalizedSessionUser = normalizeReferenceSessionIdentity({
        email: session.user.email,
        name: session.user.name || '',
        role: session.user.role || '',
    });

    // FAST PATH OPTIMIZATION: Return from session JWT if data is already available
    if (session.user.id && session.user.role) {
        return {
            id: session.user.id as string,
            email: normalizedSessionUser.email || session.user.email,
            name: normalizedSessionUser.name || session.user.name || '',
            role: ((normalizedSessionUser.role as string) || '').toLowerCase(),
            googleId: (session.user as any).googleId || '',
        };
    }

    // If Supabase is not configured, return basic user from session
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return {
            id: session.user.id || '',
            email: normalizedSessionUser.email || session.user.email,
            name: normalizedSessionUser.name || session.user.name || '',
            role: (normalizedSessionUser.role || session.user.role || 'student').toLowerCase(),
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
                    email: normalizedSessionUser.email || session.user.email,
                    name: normalizedSessionUser.name || session.user.name || '',
                    role: (normalizedSessionUser.role || (session.user as any).role || 'student').toLowerCase(),
                    googleId: (session.user as any).googleId || '',
                };
            }
            return null;
        }
        return {
            id: (user as any).id,
            email: (user as any).email,
            name: (user as any).name,
            role: ((user as any).role || 'student').toLowerCase(),
            googleId: (user as any).google_id || '',
        };
    } catch (error) {
        console.error("Error getting current user:", error);
        // Fallback: return user info from session if available (e.g. when DB is unreachable)
        if (session.user.email) {
            return {
                id: (session.user as any).id || '',
                email: normalizedSessionUser.email || session.user.email,
                name: normalizedSessionUser.name || session.user.name || '',
                role: normalizedSessionUser.role || (session.user as any).role || 'student',
                googleId: (session.user as any).googleId || '',
            };
        }
        return null;
    }
}
// Helper to check if user has required role (case-insensitive)
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
    if (!userRole) return false;
    const normalized = userRole.toLowerCase();
    return requiredRoles.some(r => r.toLowerCase() === normalized);
}
// Helper to check if user is admin (case-insensitive)
export function isAdmin(userRole: string | undefined): boolean {
    return !!userRole && userRole.toLowerCase() === 'admin';
}
// Helper to check if user is supervisor (case-insensitive)
export function isSupervisor(userRole: string | undefined): boolean {
    return !!userRole && userRole.toLowerCase() === 'supervisor';
}
// Helper to check if user is supervisor or admin (case-insensitive)
export function isSupervisorOrAdmin(userRole: string | undefined): boolean {
    if (!userRole) return false;
    const r = userRole.toLowerCase();
    return r === 'supervisor' || r === 'admin';
}
// Helper to check if user is teacher or admin (case-insensitive)
export function isTeacherOrAdmin(userRole: string | undefined): boolean {
    if (!userRole) return false;
    const r = userRole.toLowerCase();
    return r === 'teacher' || r === 'admin';
}
