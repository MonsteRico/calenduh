import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

function SignIn() {
    return <Button onClick={() => signIn()}>Sign in</Button>;
}

function SignOut() {
    return <Button onClick={() => signOut()}>Sign out</Button>;
}

function UserButton() {
    const { data: session } = useSession();
    if (session) {
        return <SignOut />;
    }
    return <SignIn />;
}

export default UserButton;
