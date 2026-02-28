export default function ScrollingBanner() {
    const text = "🌎 HOW IT WORKS: ADD YOUR PHOTOS • WE EXTRACT LOCATIONS SECURELY ON YOUR DEVICE (NO PHOTOS UPLOADED) • WE FIND EXACT MOMENTS YOUR PATHS CROSSED • SEE YOUR INTERSECTIONS ON A BEAUTIFUL MAP 💖 • ALL FUNDS RAISED GO DIRECTLY TO MAPBOX API FEES AND SECURE SUPABASE HOSTING TO KEEP THIS PROJECT PRIVATE AND AD-FREE ";

    // Duplicate the text several times to ensure the screen is filled for the infinite scroll
    const repeatedText = Array(4).fill(text).join(" • ");

    return (
        <div className="w-full overflow-hidden bg-zinc-900 border-y border-zinc-800 py-3 mt-8 relative flex items-center">
            <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
                <span className="text-zinc-400 font-medium text-xs md:text-sm tracking-widest uppercase px-4">
                    {repeatedText}
                </span>
                <span className="text-zinc-400 font-medium text-xs md:text-sm tracking-widest uppercase px-4">
                    {repeatedText}
                </span>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    );
}
