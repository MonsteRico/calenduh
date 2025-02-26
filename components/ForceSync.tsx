import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useSync } from "@/hooks/sync";
import { useSyncing } from "@/hooks/sync";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export default function ForceSync() {
	const { syncing } = useSyncing();
	const { mutate: sync } = useSync();
	// cn(syncing && "animate-spin")
	return (
		<Button
			onPress={() => {
				sync();
			}}
		>
			<FontAwesome name="refresh" size={18} color="black" className={""} />
		</Button>
	);
}
