import { signIn, useSession } from 'next-auth/react';
import React from 'react'
import { Button } from './ui/button';
import { signOut } from "next-auth/react";

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