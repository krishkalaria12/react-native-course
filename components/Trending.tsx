import React, { useState } from "react";
import { ResizeMode, Video, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  ViewToken,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";

import { icons } from "../constants";
import { Models } from "react-native-appwrite";

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

interface TrendingItemProps {
  activeItem: string;
  item: PostItem;
}

interface TrendingProps {
  posts: PostItem[];
}

type CombinedStyle = TextStyle & ViewStyle & ImageStyle;

const zoomIn: Animatable.CustomAnimation<CombinedStyle> = {
  from: {
    transform: [{ scale: 0.9 }],
  },
  to: {
    transform: [{ scale: 1 }],
  },
};

const zoomOut: Animatable.CustomAnimation<CombinedStyle> = {
  from: {
    transform: [{ scale: 1 }],
  },
  to: {
    transform: [{ scale: 0.9 }],
  },
};

export const TrendingItem: React.FC<TrendingItemProps> = ({ activeItem, item }) => {
  const [play, setPlay] = useState<boolean>(false);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !status.isBuffering) {
      const playbackStatus = status as AVPlaybackStatusSuccess;
      if (playbackStatus.didJustFinish) {
        setPlay(false);
      }
    }
  };

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          source={{ uri: item.video }}
          className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

export const Trending: React.FC<TrendingProps> = ({ posts }) => {
  const [activeItem, setActiveItem] = useState<string>(posts[0]?.$id);

  const viewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key as string);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => <TrendingItem activeItem={activeItem} item={item} />}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 0 }}  // Providing both x and y values
    />
  );
};
