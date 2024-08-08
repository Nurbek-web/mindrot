import Link from "next/link";
import Dialogue from "./dialogue";

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 px-4 md:px-6">
          <div className="flex flex-col justify-center space-y-6 lg:max-w-[50%] sm:justify-start">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-indigo-400 dark:to-purple-400">
              Generate your brainrot in 4 minutes
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300">
              Learn about any topic from your favorite personalities 😼.
            </p>
            <div className="pt-4">
              <Link href="#" prefetch={false}>
                <Dialogue type="hero" />
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="relative w-64 h-[512px] md:w-80 md:h-[640px] rounded-xl overflow-hidden shadow-2xl bg-gray-200 dark:bg-gray-700">
              {/* Placeholder for video */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
              {/* You can replace this Image component with your actual video embed when it's working */}

              <iframe
                src="https://youtube.com/embed/qBUHJvY49qk?si=EBP5ERj_EtOHkJBi"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media;
gyroscope; picture-in-picture;
web-share"
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
