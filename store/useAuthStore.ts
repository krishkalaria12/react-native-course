// store/authStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models, Query } from "react-native-appwrite";
import { account, avatars, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwriteConfig";

interface IAuthStore {
    user: Models.Document | null;
    loggedIn: boolean;
    hydrated: boolean;
    error: string | null;
    loading: boolean; // New loading state

    setHydrated(): void;
    verifySession(): Promise<void>;
    login(email: string, password: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
    createAccount(email: string, password: string, username: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
    logout(): Promise<void>;
    getAccount(): Promise<Models.User<Models.Preferences> | null>;
    getCurrentUser(): Promise<Models.Document | null>;
}

export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set, get) => ({
            user: null,
            loggedIn: false,
            hydrated: false,
            error: null,
            loading: false, // Initialize loading as false

            setHydrated() {
                set({ hydrated: true });
            },

            async getAccount() {
                try {
                    const currentAccount = await account.get();
                    return currentAccount;
                } catch (error) {
                    console.error("Error getting account", error);
                    return null;
                }
            },

            async getCurrentUser() {
                try {
                    const currentAccount = await get().getAccount();
                    if (!currentAccount) return null;

                    const currentUser = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.userCollectionId,
                        [Query.equal("accountId", currentAccount.$id)]
                    );

                    if (!currentUser.documents.length) return null;

                    return currentUser.documents[0];
                } catch (error) {
                    console.error("Error getting current user", error);
                    return null;
                }
            },

            async verifySession() {
                set({ loading: true });
                try {
                    const user = await get().getCurrentUser();
                    if (user) {
                        set({ user, loggedIn: true });
                        return;
                    }
                } catch (error) {
                    console.error("Verification of session failed", error);
                } finally {
                    set({ loading: false });
                }
            },

            async login(email: string, password: string) {
                set({ loading: true });
                try {
                    await account.createEmailPasswordSession(email, password);

                    const currentUser = await get().getCurrentUser();
                    if (!currentUser) throw new Error("Failed to retrieve user after login");

                    set({ user: currentUser, loggedIn: true, error: null });
                    return { success: true };
                } catch (error) {
                    console.error("Login failed", error);
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error : null
                    };
                } finally {
                    set({ loading: false });
                }
            },

            async createAccount(email: string, password: string, username: string) {
                set({ loading: true });
                try {
                    const newAccount = await account.create(
                        ID.unique(), 
                        String(email), 
                        String(password), 
                        String(username),
                    );

                    const avatarUrl = avatars.getInitials(username);
                    
                    const newUser = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.userCollectionId,
                        ID.unique(),
                        {
                            accountId: newAccount.$id,
                            email,
                            username,
                            avatar: avatarUrl
                        }
                    );

                    const loginResult = await get().login(email, password);
                    
                    if (!loginResult.success) {
                        return { error: loginResult.error, success: false };
                    }

                    return { success: true };
                } catch (error) {
                    console.error("Create account failed", error);
                    return {
                        success: false,
                        error: error instanceof AppwriteException ? error : null
                    };
                } finally {
                    set({ loading: false });
                }
            },

            async logout() {
                set({ loading: true });
                try {
                    await account.deleteSessions();
                    set({ user: null, loggedIn: false, error: null });
                } catch (error) {
                    console.error("Logout Failed", error);
                } finally {
                    set({ loading: false });
                }
            },

        })),
        {
            name: "auth",
            onRehydrateStorage() {
                return (state, error) => {
                    if (!error) state?.setHydrated();
                };
            }
        }
    )
);
