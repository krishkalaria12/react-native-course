import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { ID, Models } from "react-native-appwrite";
import { storage, databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwriteConfig";
import { ImageGravity } from "react-native-appwrite";

// Define the interface for the upload store
interface IUploadStore {
    loading: boolean;
    error: string | null;
    hydrated: boolean;
    posts: Models.Document[] | null;

    uploadFile: (
        file: any,
        type: "image" | "video"
    ) => Promise<string | undefined>;
    createVideoPost: (form: formData) => Promise<void>;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
    setHydrated(): void;
    getFilePreview: (fileId: string, type: "image" | "video") => Promise<string>;
}

interface formData {
    thumbnail: any;
    video: any;
    prompt: string;
    userId: string;
    title: string;
}

export const useUploadStore = create<IUploadStore>()(
  persist(
    immer((set, get) => ({
      loading: false,
      error: null,
      posts: null,
      hydrated: false,

      setHydrated() {
        set({ hydrated: true });
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ loading }),

      // Function to upload files to Appwrite storage
      async uploadFile(file, type) {
        if (!file) return;

        const asset = {
          name: file?.fileName,
          type: file?.mimeType,
          size: file?.fileSize,
          uri: file?.uri,
        }

        set({ loading: true });

        try {
          const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            asset
          );

          const fileUrl = await get().getFilePreview(uploadedFile.$id, type);
          return fileUrl;
        } catch (error: any) {
          get().setError(error.message);
          throw new Error(error.message);
        } finally {
          set({ loading: false });
        }
      },

      // Function to get file preview or file view based on type
      async getFilePreview(fileId: string, type: "image" | "video") {
        let fileUrl: string;

        try {
          if (type === "video") {
            fileUrl = storage.getFileView(appwriteConfig.storageId, fileId).toString();
          } else if (type === "image") {
            fileUrl = storage.getFilePreview(
              appwriteConfig.storageId,
              fileId,
              2000,
              2000,
              ImageGravity.Top,
              100
            ).toString();
          } else {
            throw new Error("Invalid file type");
          }

          if (!fileUrl) throw new Error("Failed to generate file URL");

          return fileUrl;
        } catch (error: any) {
          get().setError(error.message);
          throw new Error(error.message);
        }
      },

      // Function to create a video post
      async createVideoPost(form) {
        try {
          set({ loading: true });
          set({ error: null });

          const [thumbnailUrl, videoUrl] = await Promise.all([
            get().uploadFile(form.thumbnail, "image"),
            get().uploadFile(form.video, "video"),
          ]);

          const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.videosCollectionId,
            ID.unique(),
            {
              title: form.title,
              thumbnail: thumbnailUrl,
              video: videoUrl,
              prompt: form.prompt,
              creator: form.userId,
            }
          );

          set((state) => {
            if (state.posts) {
              state.posts.push(newPost);
            } else {
              state.posts = [newPost];
            }
          });
      
        } catch (error: any) {
          set({ error: error.message });
          throw new Error(error.message);
        } finally {
          set({ loading: false });
        }
      },
    })),
    {
      name: "upload", 
      onRehydrateStorage() {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating upload store", error);
          }
        };
      },
    }
  )
);