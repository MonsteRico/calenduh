import { redirect } from "next/navigation";
import getServerAuthSession from "~/lib/getServerAuthSession";
import ActualPage from "./actualPage";

export default async function Home() {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
        // redirect to /api/auth/signin
        redirect("/api/auth/signin");
    }

    return <ActualPage user={session.user} />;
}
