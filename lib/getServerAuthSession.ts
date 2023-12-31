import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export default function getServerAuthSession() {
    return getServerSession(authOptions)
}