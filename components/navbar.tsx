"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Menu, UserCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"

interface NavbarProps {
  user?: any
  avatarUrl?: string | null
  dashboardRoute?: string
}

export function Navbar({ user, avatarUrl, dashboardRoute = "/dashboard" }: NavbarProps) {
  const pathname = usePathname()

  const links = [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl md:text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            UDYOG JAGAT
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-primary relative group py-2",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons / Profile */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href={dashboardRoute} className="flex items-center gap-3 pl-4 border-l border-border/50 hover:opacity-80 transition-opacity">
              <div className="text-sm font-bold hidden lg:block text-foreground">Dashboard</div>
              <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-secondary flex items-center justify-center shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="rounded-full px-6 font-bold hover:bg-accent transition-all">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" className="rounded-full px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          {user && (
            <Link href={dashboardRoute}>
              <div className="w-9 h-9 rounded-full border-2 border-primary overflow-hidden bg-secondary flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </Link>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-left text-2xl font-black tracking-tighter text-primary">
                  UDYOG JAGAT
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-12">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xl font-semibold transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              {!user && (
                <div className="flex flex-col gap-4 mt-auto mb-8">
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" size="lg" className="w-full rounded-full font-bold">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full">
                    <Button size="lg" className="w-full rounded-full font-bold shadow-lg shadow-primary/20">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  )
}
