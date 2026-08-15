import { BILLING_AVAILABILITY } from "@/lib/billing/capabilities";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/status
 * Billing Foundation status & Health check API
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    foundationVersion: "1.0.0",
    billingAvailability: BILLING_AVAILABILITY,
    pgProviderConnected: false,
    environment: process.env.NODE_ENV,
    supportedProviders: ["toss", "kakaopay", "naverpay", "manual", "mock"],
    notice: "PG-independent subscription backend foundation ready.",
  });
}
