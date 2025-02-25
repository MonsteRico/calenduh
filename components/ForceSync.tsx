import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useSync } from '@/hooks/sync';
import { useSyncing } from '@/hooks/sync';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';

export default function ForceSync() {
    const { syncing } = useSyncing();
    const { mutate: sync } = useSync();

    return (
			<Button
				onPress={() => {
					sync();
				}}
			>
				<FontAwesome name="refresh" size={24} color="black" className={cn(syncing && "animate-spin")} />
			</Button>
		);
}