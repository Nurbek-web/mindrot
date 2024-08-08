"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowRightIcon, PlusSquareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserIdContext } from "@/context/UserIdContext";
import { AspectRatio } from "./ui/aspect-ratio";

const characters = [
  {
    id: 1,
    name: "Andrew Tate",
    image:
      "https://dims.apnews.com/dims4/default/98c7c25/2147483647/strip/true/crop/3343x2229+0+0/resize/599x399!/quality/90/?url=https%3A%2F%2Fassets.apnews.com%2F23%2F2a%2Fc195983e0f48a7e07f43883f1803%2Fc4ddb5cfc45448f2b4827af26a565e49",
  },
  {
    id: 2,
    name: "Ben Shapiro",
    image:
      "https://media.npr.org/assets/img/2021/07/07/ben-shapiro_wide-197b6d5d1b5220acb9c49471a221faab35aa0d12.jpg?s=1400&c=100&f=jpeg",
  },
  {
    id: 3,
    name: "Donald Trump",
    image:
      "https://cdn2.picryl.com/photo/2017/10/06/donald-trump-official-portrait-2020-election-35c27c-1024.jpg",
  },
  {
    id: 4,
    name: "Kanye West",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg/1200px-Kanye_West_at_the_2009_Tribeca_Film_Festival_%28crop_2%29.jpg",
  },
  {
    id: 5,
    name: "Tucker Carlson",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Tucker_Carlson_%2853067283901%29_%28cropped%29.jpg/1200px-Tucker_Carlson_%2853067283901%29_%28cropped%29.jpg",
  },
  {
    id: 6,
    name: "Elon Musk",
    image:
      "https://futureoflife.org/wp-content/uploads/2020/08/elon_musk_royal_society.jpg",
  },
  {
    id: 7,
    name: "Jordan Peterson",
    image:
      "https://torontolife.mblycdn.com/tl/resized/2021/03/w1280/PETERSON_opener.jpg",
  },
  {
    id: 8,
    name: "50 cent",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/50_Cent_in_2018.png/640px-50_Cent_in_2018.png",
  },
];

export default function Dialogue({ type }: { type: string }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // Control the dialog's open state
  const [error, setError] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const userId = useUserIdContext();
  const router = useRouter();

  const handleSelect = (setter: any, value: any) => {
    setter(value);
  };

  const handleCharacterSelect = (characterId: any) => {
    setSelectedCharacter(characterId);
  };

  const checkFormValidity = () => {
    const isValid =
      topic !== "" &&
      selectedCharacter !== null &&
      selectedVideo !== null &&
      selectedMusic !== null &&
      selectedDuration !== null;
    setIsFormValid(isValid);
  };

  useEffect(() => {
    checkFormValidity();
  }, [
    topic,
    selectedVideo,
    selectedMusic,
    selectedDuration,
    selectedCharacter,
  ]);

  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("Please fill in all fields before submitting.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = {
      topic,
      selectedCharacter,
      selectedVideo,
      selectedMusic,
      selectedDuration,
      userId: userId,
    };

    console.log(formData);

    try {
      const response = await fetch("/api/createVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Document added successfully:", result);
        setDialogOpen(false); // Close the dialog on success
        router.push("/dashboard");
      } else {
        console.error("Error adding document:", result.error);
        setError(result.error || "An error occurred while creating the video.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">
          Topic of video<span className="text-red-500">*</span>
        </Label>
        <Input
          id="topic"
          placeholder="Enter the topic"
          value={topic}
          required
          onChange={(e) => setTopic(e.target.value)}
          className={topic === "" ? "border-red-500" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Select Character<span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {characters.map((character) => (
            <button
              key={character.id}
              className={`w-full aspect-square rounded-full overflow-hidden focus:outline-none transition-all duration-200 ${
                selectedCharacter === character.id
                  ? "ring-4 ring-purple-500"
                  : "ring-2 ring-gray-300 hover:ring-gray-400"
              }`}
              onClick={() => handleCharacterSelect(character.id)}
            >
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Background video<span className="text-red-500">*</span>
        </Label>
        <div className="flex space-x-2">
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedVideo === "GTA" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedVideo, "GTA")}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmfmOcbeNXIF1uGw9Q8f764J9pURSv-aBCcA&s"
              alt="GTA"
              className="h-10 w-17"
            />
          </Button>
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedVideo === "MINECRAFT" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedVideo, "MINECRAFT")}
          >
            <img
              src="https://res.cloudinary.com/zenbusiness/image/upload/v1670445040/logaster/logaster-2020-06-image14-3.png"
              alt="MINECRAFT"
              className="h-20 w-25"
            />
          </Button>
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedVideo === "SUBWAY" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedVideo, "SUBWAY")}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/en/b/b9/Subway_Surfers_app_logo.png"
              alt="SUBWAY"
              className="h-15 w-15"
            />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          Background music<span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center space-x-2">
          <Music2Icon className="h-4 w-4" />
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedMusic === "WII_SHOP_CHANNEL_TRAP"
                ? "ring-2 ring-primary"
                : ""
            }`}
            onClick={() =>
              handleSelect(setSelectedMusic, "WII_SHOP_CHANNEL_TRAP")
            }
          >
            <img
              src="https://i.ytimg.com/vi/9Pvws_HAqF0/maxresdefault.jpg"
              alt="WII_SHOP_CHANNEL_TRAP"
              className="h-10 w-35"
            />
          </Button>
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedMusic === "MONKEYS_SPINNING_MONKEYS"
                ? "ring-2 ring-primary"
                : ""
            }`}
            onClick={() =>
              handleSelect(setSelectedMusic, "MONKEYS_SPINNING_MONKEYS")
            }
          >
            <img
              src="https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/65/75/74/657574a8-8d33-e230-b049-0677aa2c9c35/artwork.jpg/1200x1200bb.jpg"
              alt="MONKEYS_SPINNING_MONKEYS"
              className="h-10 w-10"
            />
          </Button>
          <Button
            variant="gooeyRight"
            className={`flex-1 bg-white ${
              selectedMusic === "FLUFFING_A_DUCK" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedMusic, "FLUFFING_A_DUCK")}
          >
            <img
              src="https://i.scdn.co/image/ab67616d0000b273f09931a582eabb849675b10b"
              alt="FLUFFING_A_DUCK"
              className="h-10 w-10"
            />
          </Button>
          <Button
            variant="gooeyRight"
            className={`ml-auto text-black bg-white ${
              selectedMusic === "NONE" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedMusic, "NONE")}
          >
            off
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          Duration<span className="text-red-500">*</span>
        </Label>
        <div className="flex space-x-2">
          <Button
            variant="ringHover"
            className={`flex-1 bg-white text-black ${
              selectedDuration === "1" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedDuration, "1")}
          >
            1 min
          </Button>
          <Button
            variant="ringHover"
            className={`flex-1 bg-white text-black ${
              selectedDuration === "0.5" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(setSelectedDuration, "0.5")}
          >
            30 seconds
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        asChild
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {type === "navbar" ? (
          <Button
            variant="ringHover"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 "
            onClick={() => setDialogOpen(true)}
          >
            <div className="flex items-center">
              <PlusSquareIcon className="h-5 w-5" />
              <span className="hidden md:inline">Generate</span>
            </div>
          </Button>
        ) : (
          <>
            <Button
              variant="expandIcon"
              Icon={ArrowRightIcon}
              iconPlacement="right"
              onClick={() => setDialogOpen(true)}
            >
              Generate
            </Button>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <CardTitle>Generate your brainrot</CardTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {formContent}
          {error && <div className="text-red-500">{error}</div>}
        </div>

        <DialogFooter>
          <Button
            variant="expandIcon"
            Icon={ArrowRightIcon}
            iconPlacement="right"
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Music2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="18" r="4" />
      <path d="M12 18V2l7 4" />
    </svg>
  );
}
