import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { Models, Query } from "react-native-appwrite";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwriteConfig";

// Define the structure of a post item based on the received data
interface PostItem extends Models.Document {
  $id: string;
  video: string;
  thumbnail: string;
  title: string;
  creator: {
    username: string;
    avatar: string;
  };
}

interface IPostStore {
  posts: PostItem[] | null;
  userPosts: PostItem[] | null;
  latestPosts: PostItem[] | null; // To store latest posts
  searchResults: PostItem[] | null; // To store search results
  loading: boolean;
  error: string | null;

  fetchAllPosts: () => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  fetchLatestPosts: () => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const usePostStore = create<IPostStore>()(
  persist(
    immer((set, get) => ({
      posts: null,
      userPosts: null,
      latestPosts: null,
      searchResults: null,
      loading: false,
      error: null,

      setError(error: string | null) {
        set({ error });
      },

      async fetchAllPosts() {
        set({ loading: true, error: null });
        try {
          const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videosCollectionId
          );

          // Map the response to the PostItem structure
          const mappedPosts = posts.documents.map((post: Models.Document) => ({
            ...post,
            $id: post.$id,
            video: post.video,
            thumbnail: post.thumbnail,
            title: post.title,
            creator: {
              username: post.users.username,
              avatar: post.users.avatar,
            },
          })) as PostItem[];

          set({ posts: mappedPosts });
        } catch (error: any) {
          console.error("Error fetching all posts", error);
          set({ error: "Error fetching all posts" });
        } finally {
          set({ loading: false });
        }
      },

      async fetchUserPosts(userId: string) {
        set({ loading: true, error: null });
        try {
          const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", userId)]
          );

          const mappedUserPosts = posts.documents.map((post: Models.Document) => ({
            ...post,
            $id: post.$id,
            video: post.video,
            thumbnail: post.thumbnail,
            title: post.title,
            creator: {
              username: post.users.username,
              avatar: post.users.avatar,
            },
          })) as PostItem[];

          set({ userPosts: mappedUserPosts });
        } catch (error: any) {
          console.error("Error fetching user posts", error);
          set({ error: "Error fetching user posts" });
        } finally {
          set({ loading: false });
        }
      },

      async fetchLatestPosts() {
        set({ loading: true, error: null });
        try {
          const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videosCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
          );

          const mappedLatestPosts = posts.documents.map((post: Models.Document) => ({
            ...post,
            $id: post.$id,
            video: post.video,
            thumbnail: post.thumbnail,
            title: post.title,
            creator: {
              username: post.users.username,
              avatar: post.users.avatar,
            },
          })) as PostItem[];

          set({ latestPosts: mappedLatestPosts });
        } catch (error: any) {
          console.error("Error fetching latest posts", error);
          set({ error: "Error fetching latest posts" });
        } finally {
          set({ loading: false });
        }
      },

      async searchPosts(query: string) {
        set({ loading: true, error: null });
        try {
          const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videosCollectionId,
            [Query.search("title", query), Query.search("prompt", query)]
          );

          if (!posts) throw new Error("Something went wrong");

          const mappedSearchResults = posts.documents.map((post: Models.Document) => ({
            ...post,
            $id: post.$id,
            video: post.video,
            thumbnail: post.thumbnail,
            title: post.title,
            creator: {
              username: post.users.username,
              avatar: post.users.avatar,
            },
          })) as PostItem[];

          set({ searchResults: mappedSearchResults });
        } catch (error: any) {
          console.error("Error searching posts", error);
          set({ error: "Error searching posts" });
        } finally {
          set({ loading: false });
        }
      },
    })),
    {
      name: "posts", // Unique name for the storage
      onRehydrateStorage() {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating posts store", error);
          }
        };
      },
    }
  )
);
