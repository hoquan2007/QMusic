import type { Metadata } from "next";
import { connection } from "next/server";
import { SettingsView } from "@/features/settings/settings-view";
import { providerSummary } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Tùy chỉnh giao diện, trình phát và dữ liệu thư viện trên QMusic.",
};

export default async function SettingsPage() {
  await connection();
  return <SettingsView providers={providerSummary()} />;
}
