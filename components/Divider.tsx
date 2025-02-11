import React from "react";
import { View } from "react-native";

interface DividerProps {
	width?: number;
	orientation?: "horizontal" | "vertical";
	color?: string;
	dividerStyle?: any;
	className?: string;
}

const Divider: React.FC<DividerProps> = ({
	width = 1,
	orientation = "horizontal",
	color = "#DFE4EA",
	dividerStyle,
	className,
}) => {
	const dividerStyles = [
		{ width: orientation === "horizontal" ? "100%" : width },
		{ height: orientation === "vertical" ? "100%" : width },
		{ backgroundColor: color },
		dividerStyle,
	];

	return <View style={dividerStyles} className={className} />;
};

export default Divider;
