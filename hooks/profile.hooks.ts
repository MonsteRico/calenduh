import { useQuery, useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useIsConnected } from "@/hooks/useIsConnected"; // Adjust path
import { addMutationToQueue, getMutationsFromDB } from "@/lib/mutation.helpers";
import { useSession } from "./authContext";
import * as Crypto from "expo-crypto";
import { User, UpdateUser } from "@/types/user.types";
import { updateUserOnServer } from "@/lib/user.helper";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from "react-native";

// --- Queries ---
export const useUpdateUser = (
	options?: UseMutationOptions<UpdateUser, Error, UpdateUser, { previousUser: User}>
) => {
	const queryClient = useQueryClient();
	const isConnected = useIsConnected();
    const { user: currentUserInfo, sessionId } = useSession(); // Get current user context and session ID
	// const { user, sessionId } = useSession();
	// if (!user || !sessionId) {
	// 	throw new Error("User not found or session not found");
	// }

	return useMutation({
		mutationFn: async (updatedUser: UpdateUser) => {
            console.log("useUpdateUser mutationFn called with fields:", updatedUser);
            if (!currentUserInfo) {
                throw new Error("User context not available for update.");
            }

            if (!sessionId && currentUserInfo.user_id !== "localUser") {
                // Only require session ID for actual server updates, not local placeholders
                throw new Error("Session not available for server update.");
            }

			if (isConnected && currentUserInfo.user_id !== "localUser") {
                console.log(`Attempting server update for user ${currentUserInfo.user_id}`);
				const res = await updateUserOnServer(updatedUser);
				console.log("response=" + res);
				return res;
			} else {
				return updatedUser;
			}

		},
        onMutate: async (updatedUser: UpdateUser) => {
             await queryClient.cancelQueries({ queryKey: ['loginData'] });
             const previousUserString = await SecureStore.getItemAsync('user');
             const previousUser = previousUserString ? JSON.parse(previousUserString) : undefined;
             if (previousUser) {
                 const optimisticUser = { ...previousUser, ...updatedUser };
                 await SecureStore.setItemAsync('user', JSON.stringify(optimisticUser));
                 queryClient.invalidateQueries({ queryKey: ['loginData'] });
             }
             options?.onMutate?.(updatedUser);
             return { previousUser };
        },
		onSuccess: async (updatedUser: UpdateUser) => {
			console.log("updated user", updatedUser);
			const user = await JSON.parse(SecureStore.getItem("user") ?? "");
			SecureStore.setItem("user", JSON.stringify({...user, ...updatedUser}));
			console.log("set secure store user to ", {...user, ...updatedUser});
			await queryClient.invalidateQueries({ queryKey: ["loginData"]})
		},
		onSettled: async (data, error, variables, context: { previousUser: User } | undefined) => {
            console.log("useUpdateUser onSettled");
			options?.onSettled?.(data, error, variables, context);
		}
	});
};


// --- Hook for managing profile picture ---
export const useProfilePicture = () => {
    const { user, sessionId } = useSession();
    const queryClient = useQueryClient();

    const uploadPicture = useMutation({
        mutationFn: async (uri: string) => {
            if (!user || !sessionId) {
                throw new Error("User not authenticated");
            }
    
            // create form data
            const formData = new FormData();
            const fileInfo = await FileSystem.getInfoAsync(uri);
            
            if (!fileInfo.exists) {
                throw new Error('Selected file does not exist');
            }
    
            formData.append('file', {
                uri,
                name: `profile_${user.user_id}.png`,
                type: 'image/png',
            } as any);
    
            // create headers with cookie
            const headers = new Headers();
            headers.append('Accept', 'application/json');
            headers.append('Authorization', `Bearer ${sessionId}`); 
            headers.append('Cookie', `sessionId=${sessionId}`);
            console.log('Profile pic request headers:', Object.fromEntries(headers.entries())); 
    
            const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/files/upload`, {
                method: 'POST',
                body: formData,
                headers,
                credentials: 'include'
            });

            console.log('Profile upload response status=', response.status);
            const responseData = await response.json();
            console.log('Profile upload response body=', responseData);
    
            if (!response.ok) {
                // const error = await response.json().catch(() => ({}));
                // throw new Error(error.message || 'Upload failed');
                throw new Error(`Upload failed: ${response.status} --- ${JSON.stringify(responseData)}`);
            }
    
            // return await response.json();
            // return responseData;
            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'png';
            return {
                ...responseData,
                // store complete filename with extension
                filename: responseData.key.includes('.') 
                    ? responseData.key 
                    : `${responseData.key}.${fileExtension}`
            };
        },
        onSuccess: async (response) => {
            // update local user data in SecureStore
            const userString = await SecureStore.getItemAsync('user');
            if (userString) {
                const currentUser = JSON.parse(userString);
                const updatedUser = {
                    ...currentUser,
                    profile_picture: response.key // key from upload response
                };
                await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                
                // refresh the user data
                queryClient.invalidateQueries({ queryKey: ['loginData'] });
            }
        },
        onError: (error) => {
            console.error('Profile picture upload failed:', error);
        }
    });

    const deletePicture = useMutation({
        mutationFn: async () => {
            if (!user?.profile_picture) {
                return;
            }

            const headers = new Headers();
            headers.append('Accept', 'application/json');
            headers.append('Authorization', `Bearer ${sessionId}`); 
            headers.append('Cookie', `sessionId=${sessionId}`);
            console.log('Profile pic request headers:', Object.fromEntries(headers.entries())); 

            const response = await fetch(`${process.env.EXPO_PUBLIC_SERVER_URL}/files/profile`, {
                method: 'DELETE',
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Deletion failed');
            }
        },
        onSuccess: () => {
            // update user's profile picture in local state
            queryClient.setQueryData(['user', user?.user_id], (old: any) => ({
                ...old,
                profile_picture: null
            }));
        },
        onError: (error: Error) => {
            console.error("Profile picture deletion failed:", error.message);
        }
    });

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            throw new Error("Permission to access photos is required");
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.[0]?.uri) {
            throw new Error("No image selected");
        }

        return result.assets[0].uri;
    };

    console.log("CURRENT USER OBJECT:", user);
    return {
        uploadPicture,
        deletePicture,
        pickImage,
        profilePictureUrl: user?.profile_picture 
        ? `${process.env.EXPO_PUBLIC_S3_URL}/${user.profile_picture}`
        : null
    };
};