import { useSession } from "next-auth/react";


export const useUser = () => {
    const session = useSession();
    const user = session.data?.user;
    if (!user) {
        throw new Error("No user");
    }
    return user;
};
