import { redirect } from "next/navigation";
import ActualPage from "./actualPage";
import getUser from "~/lib/getUser";


export default async function Home() {
    const user = await getUser();
    if (!user) {
        // redirect to /api/auth/signin
        redirect("/signin");
    }

    return <ActualPage user={user} />;
}
