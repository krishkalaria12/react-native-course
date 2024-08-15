import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton } from "../../components/CustomButton";
import { FormField } from "../../components/FormField";
import { useAuthStore } from "@/store/useAuthStore";

interface FormFields {
    email: string;
    password: string;
}

const SignIn = () => {
    const [form, setForm] = useState<FormFields>({
        email: "",
        password: "",
    })
    const [isSubmitting, SetSubmitting] = useState<boolean>(false);

    const submit = async () => {
      if (!form.email || !form.password) {
          Alert.alert("Error", "Please fill in all the fields");
          return;
      }

      const loginAccount = useAuthStore((state) => state.login);

      SetSubmitting(true);

      try {
          const result = await loginAccount(form.email, form.password);

          if (result.success) {
              router.push("/home");
          } else if (result.error) {
              Alert.alert("Error", result.error.message);
          }
      } catch (error: any) {
          Alert.alert("Error", error?.message);
      } finally {
          SetSubmitting(false);
      }
    };

  return (
    <SafeAreaView className="bg-primary w-full h-full mx-auto">
      <ScrollView >
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Aora
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            placeholder="johndoe@gmail.com"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            placeholder="12345678"
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;