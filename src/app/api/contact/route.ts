import { NextResponse } from "next/server";

type Entry = { count: number; reset: number };
const buckets = new Map<string, Entry>();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pruneBuckets(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, entry] of buckets) {
    if (entry.reset <= now) buckets.delete(key);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const name = readString(body.name);
  const email = readString(body.email);
  const brief = readString(body.brief);
  const budget = readString(body.budget);
  const honeypot = readString(body.website);

  // Quietly accept obvious bot submissions without forwarding them.
  if (honeypot) {
    return NextResponse.json({ message: "Message received. I'll get back to you at the email you provided." });
  }

  if (
    name.length < 2 || name.length > 80 ||
    email.length > 160 || !EMAIL.test(email) ||
    brief.length < 20 || brief.length > 3000 ||
    budget.length > 120
  ) {
    return NextResponse.json({ error: "Check the required fields and try again." }, { status: 400 });
  }

  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  pruneBuckets(now);
  const existing = buckets.get(forwarded);
  if (existing && existing.reset > now && existing.count >= 5) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }
  buckets.set(forwarded, existing && existing.reset > now
    ? { ...existing, count: existing.count + 1 }
    : { count: 1, reset: now + 15 * 60_000 });

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ error: "Contact delivery is not configured yet. Please use the published contact details instead." }, { status: 503 });
  }

  let target: URL;
  try { target = new URL(webhook); }
  catch { return NextResponse.json({ error: "Contact delivery is misconfigured." }, { status: 503 }); }
  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "Contact delivery is misconfigured." }, { status: 503 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.CONTACT_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.CONTACT_WEBHOOK_SECRET}` } : {})
      },
      body: JSON.stringify({ name, email, brief, budget, source: "theace9-portfolio" }),
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) {
      return NextResponse.json({ error: "The message could not be delivered. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ message: "Message received. I'll get back to you at the email you provided." });
  } catch {
    return NextResponse.json({ error: "The message could not be delivered. Please try again." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
