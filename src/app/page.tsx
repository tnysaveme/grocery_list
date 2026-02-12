import { cookies } from "next/headers";
import Header from "@/components/Header";
import ConnectSpotify from "@/components/ConnectSpotify";
import RecentList from "@/components/RecentList";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token");

  return (
    <main className="min-h-screen bg-white text-black p-4 md:p-6 pt-20 md:pt-24 font-sans selection:bg-black selection:text-white">
      <Header />

      <div className="max-w-3xl mx-auto">
        {!accessToken ? (
          <ConnectSpotify />
        ) : (
          <RecentList />
        )}
      </div>
    </main>
  );
}
