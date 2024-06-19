import { User } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/db/db";
import { users } from "~/db/schema/auth";
import getUser from "~/lib/getUser";
import { Webhook } from "svix";
import { createUser } from "~/lib/createUser";
export const dynamic = "force-dynamic"; // defaults to auto
// POST /api/webhooks
// handle webhook events
export async function POST(request: NextRequest) {
  const svix_id = request.headers.get("svix-id") ?? "";
  const svix_timestamp = request.headers.get("svix-timestamp") ?? "";
  const svix_signature = request.headers.get("svix-signature") ?? "";

  const textBody = await request.text();

  const sivx = new Webhook(process.env.WEBHOOK_SECRET as string);

  let msg;
  
  try {
    msg = sivx.verify(textBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return new Response("Bad Request", { status: 400 });
  }

    const body = await request.json() as {data: User, object: "event", type: string};
    if (body.type == "user.created") {
        createUser(body.data);
    }
    else if (body.type == "user.updated") {
        console.log("user updated", body);
    }
    else if (body.type == "user.deleted") {
        console.log("user deleted", body);
    }
}

