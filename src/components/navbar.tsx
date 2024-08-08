"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon, PlusSquareIcon } from "lucide-react"; // Using PlusSquareIcon for the generate button

import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

import { ModeToggle } from "./theme-button";
import Dialogue from "./dialogue";

// Custom SVG icon component
function CircleUserIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}

export default function MainNav() {
  const router = useRouter();

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-20">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="shrink-0 md:hidden" size="icon" variant="outline">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
              href="#"
            >
              <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
              <span className="sr-only">Mindrot</span>
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/"
            >
              Home
            </Link>

            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/dashboard"
            >
              My videos
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/globalvideos"
            >
              Global videos
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="flex w-full justify-between items-center">
        <div className="flex flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
            href="#"
          >
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
          </Link>
          <Link
            className="hidden md:block text-muted-foreground transition-colors hover:text-foreground"
            href="/"
          >
            Home
          </Link>

          <Link
            className="hidden md:block text-muted-foreground transition-colors hover:text-foreground"
            href="/dashboard"
          >
            My videos
          </Link>
          <Link
            className="hidden md:block text-muted-foreground transition-colors hover:text-foreground"
            href="/globalvideos"
          >
            Global videos
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
          <Dialogue type="navbar" />
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}
