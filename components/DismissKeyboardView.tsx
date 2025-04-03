import React from "react";
import { TouchableWithoutFeedback, Keyboard, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const DismissKeyboardHOC = (Comp) => {
	return ({ children, ...props }) => (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<Comp {...props}>{children}</Comp>
		</TouchableWithoutFeedback>
	);
};
export const DismissKeyboardView = DismissKeyboardHOC(View);
export const DismissKeyboardScrollView = DismissKeyboardHOC(ScrollView)