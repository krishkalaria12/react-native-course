import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Models } from "react-native-appwrite";

import { usePostStore } from "@/store/usePostStore";
import { EmptyState } from "@/components/EmptyState";
import { SearchInput } from "@/components/SearchInput";
import { VideoCard } from "@/components/VideoCard";
import { CustomButton } from "@/components/CustomButton";

interface PostItem extends Models.Document {
  video: string;
  thumbnail: string;
  title: string;
  creator: {
    username: string;
    avatar: string;
  };
}

const Search = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const { searchPosts, error, searchResults, loading } = usePostStore(); 

  useEffect(() => {
    querySearch(query);
  }, [query]);

  const querySearch = async (query: string) => {
    await searchPosts(query);
  };

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
        <CustomButton title="Retry" handlePress={() => { searchPosts(query); }} containerStyles="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={searchResults as PostItem[]}
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
        ListHeaderComponent={() => (
          <>
            <View className="flex my-6 px-4">
              <Text className="font-pmedium text-gray-100 text-sm">
                Search Results
              </Text>
              <Text className="text-2xl font-psemibold text-white mt-1">
                {query}
              </Text>

              <View className="mt-6 mb-8">
                <SearchInput initialQuery={query} />
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
