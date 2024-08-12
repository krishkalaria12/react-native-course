import { Account, Avatars, Client, Databases } from 'react-native-appwrite';
import { appwriteConfig } from './appwriteConfig';

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint) 
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform)
;

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);