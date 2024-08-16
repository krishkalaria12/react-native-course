import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, ActivityIndicator, Text } from "react-native";

import { icons } from "../../constants";

import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";

import { InfoBox } from "@/components/InfoBox";
import { EmptyState } from "@/components/EmptyState";
import { VideoCard } from "@/components/VideoCard";
import { Models } from "react-native-appwrite";
import { useEffect } from "react";
import { CustomButton } from "@/components/CustomButton";

// Define the structure of a post item
interface PostItem extends Models.Document {
  video: string;
  thumbnail: string;
  title: string;
  creator: {
    username: string;
    avatar: string;
  };
}

// Define the structure of the user object in the global context
interface User {
  $id: string;
  username: string;
  avatar: string;
}

const Profile = () => {
  const { loggedIn, user } = useAuthStore();
  
  // Ensure `user` is typed correctly
  const { error, loading, userPosts, fetchUserPosts } = usePostStore();

  const signOut = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (user) {
      fetchUserPosts(user.$id);
    }
  },[])

  if (loading) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading videos...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-red-500 text-lg">Failed to load videos.</Text>
        <CustomButton title="Retry" handlePress={() => { fetchUserPosts(user?.$id as string); }} containerStyles="mt-4" />
      </SafeAreaView>
    );
  }

  const logout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={userPosts as PostItem[]}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this profile"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={userPosts?.length || 0}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-xl"
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
