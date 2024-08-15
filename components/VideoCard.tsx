import React, { useState } from "react";
import { ResizeMode, Video, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { View, Text, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

type VideoProps = {
    title: string;
    creator: string;
    avatar: string;
    thumbnail: string;
    video: string;
};

export const VideoCard: React.FC<VideoProps> = ({ title, creator, avatar, thumbnail, video }) => {
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
        <View className="flex flex-col items-center px-4 mb-14">
            <View className="flex flex-row gap-3 items-start">
                <View className="flex justify-center items-center flex-row flex-1">
                <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
                    <Image
                    source={{ uri: avatar }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                    />
                </View>

                <View className="flex justify-center flex-1 ml-3 gap-y-1">
                    <Text className="font-psemibold text-sm text-white" numberOfLines={1}>
                    {title}
                    </Text>
                    <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
                    {creator}
                    </Text>
                </View>
                </View>

                <View className="pt-2">
                <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
                </View>
            </View>

            {play ? (
                <Video
                source={{ uri: video }}
                className="w-full h-60 rounded-xl mt-3"
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
            ) : (
                <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPlay(true)}
                className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
                >
                <Image
                    source={{ uri: thumbnail }}
                    className="w-full h-full rounded-xl mt-3"
                    resizeMode="cover"
                />

                <Image
                    source={icons.play}
                    className="w-12 h-12 absolute"
                    resizeMode="contain"
                />
                </TouchableOpacity>
            )}
        </View>
    );
};
