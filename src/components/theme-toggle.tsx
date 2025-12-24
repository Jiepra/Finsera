"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 text-amber-500 dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 text-blue-400 dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-40 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            >
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Terang</span>
                    </div>
                    {theme === "light" && <Check className="h-4 w-4 text-green-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4 text-blue-400" />
                        <span>Gelap</span>
                    </div>
                    {theme === "dark" && <Check className="h-4 w-4 text-green-500" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span>Sistem</span>
                    </div>
                    {theme === "system" && <Check className="h-4 w-4 text-green-500" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
