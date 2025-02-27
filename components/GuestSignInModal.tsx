import { Text, View, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Button } from '@/components/Button';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import signIn from '@/app/sign-in';
import { Svg, Path, Circle } from 'react-native-svg';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { BlurView } from 'expo-blur';

interface GuestSignInModalProps {
    visible: boolean;
    onClose: () => void;
}

function GuestSignInModal({ visible, onClose }: GuestSignInModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={onClose}
                className="flex-1 justify-center items-center bg-black/60"
            >
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={(e) => e.stopPropagation()} 
                    className="w-11/12 max-w-md bg-background rounded-2xl shadow-xl overflow-hidden"
                >
                    <View className="pt-8 pb-6 px-5">
                        <View className="items-center mb-6">
                            <Text className="text-center text-gray-500 mb-4">Choose a sign-in method to create an account</Text>
                        </View>
                        
                        <View className="gap-3">
                            {Platform.OS === "ios" && (
                                <View className="items-center w-full mb-2">
                                    <AppleAuthentication.AppleAuthenticationButton
                                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                        style={{ width: '100%', height: 50, borderRadius: 12 }}
                                        onPress={() => { }}
                                    />
                                </View>
                            )}
                            
                            <Button
                                variant="ghost"
                                size="lg"
                                className="border border-gray-300 bg-white rounded-xl h-14"
                                labelClasses="text-primary font-medium"
                                onPress={() => { () => { } }}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Svg width={20} height={20} style={{ marginRight: 10 }} viewBox="0 0 24 24">
                                        <Path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <Path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <Path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <Path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </Svg>
                                    <Text className="text-gray-800 font-medium">Sign in with Google</Text>
                                </View>
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="lg"
                                className="bg-white rounded-xl border border-gray-300 h-14"
                                labelClasses="text-primary font-medium"
                                onPress={() => { () => { } }}
                            >
                                <View className="flex-row items-center justify-center">
                                    <FontAwesome6 name="discord" size={20} color="#7289DA" style={{ marginRight: 10 }} />
                                    <Text className="text-gray-800 font-medium">Sign in with Discord</Text>
                                </View>
                            </Button>
                        </View>
                        
                        <TouchableOpacity 
                            className="mt-6 items-center" 
                            onPress={onClose}
                        >
                            <Text className="text-gray-500 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

export { GuestSignInModal };