import { ID, Query } from "react-native-appwrite";
import { account, avatars, databases } from "./appwrite";
import { appwriteConfig } from "./appwriteConfig";

interface AccountCreation {
    email: string;
    password: string;
    username: string;
}

interface AccountLogin {
    email: string;
    password: string;
}

export const createUser = async ({email, password, username}: AccountCreation) => {
    try {
        const newAccount = await account.create(
            ID.unique(), 
            String(email), 
            String(password), 
            String(username),
        );
        
        if (!newAccount) throw new Error("Account not created");

        const avatarUrl = avatars.getInitials(username);

        await signIn({email, password});

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
        )

        return newUser;

    } catch (error: any) {
        console.log("Error creating user", error);
        throw new Error(error);
    }
}

export const signIn = async ({email, password}: AccountLogin) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        
        return session;
    } catch (error: any) {
        console.log("Error logging in", error);
        throw new Error(error);
    }
}

export const getAccount = async () => {
    try {
        const currentAccount = await account.get();
    
        return currentAccount;
    } catch (error: any) {
        throw new Error("Error getting account", error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;
    
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );
    
        if (!currentUser) throw Error;
    
        return currentUser.documents[0];
    } catch (error: any) {
        console.log("Error getting current user", error);
        return null;
    }
}