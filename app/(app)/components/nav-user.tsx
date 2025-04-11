"use client"

import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CircleUserRound,
  CreditCard,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

// todo empty user fallbackß
export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const { mutateAsync: signOutAsync, isPending: isSigningOut, error: signOutError } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: signOut,
    onSuccess: () => {
      router.push('/sign-in')
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to sign out")
    }
  })

  const { data: userAttributes, isPending: isLoadingUserAttributes, error: userAttributesError } = useQuery({
    queryKey: ['user-attributes'],
    queryFn: fetchUserAttributes,
  })

  useEffect(() => {
    if (userAttributesError) {
      console.error(userAttributesError)
      toast.error("Failed to fetch user attributes")
    }
  }, [userAttributesError])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {isLoadingUserAttributes ? (
            <SidebarMenuSkeleton showIcon />
          ) : (
            <DropdownMenuTrigger asChild>
              {userAttributes ? (<SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userAttributes.picture} alt={userAttributes.name || userAttributes.email} />
                  <AvatarFallback className="rounded-lg">{userAttributes.name ? userAttributes.name.split(' ').map(name => name.trim().charAt(0)).join('').substring(0, 2).toUpperCase() : <CircleUserRound className="text-muted-foreground opacity-50" />}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userAttributes.name}</span>
                  <span className="truncate text-xs">{userAttributes.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>)
                : (<SidebarMenuButton size="lg">
                  No user
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>)
              }
            </DropdownMenuTrigger>)
          }
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {userAttributes && (<DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userAttributes.picture} alt={userAttributes.name || userAttributes.email} />
                  <AvatarFallback className="rounded-lg">{userAttributes.name ? userAttributes.name.split(' ').map(name => name.trim().charAt(0)).join('').substring(0, 2).toUpperCase() : <CircleUserRound className="text-muted-foreground opacity-50" />}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userAttributes.name}</span>
                  <span className="truncate text-xs">{userAttributes.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>)}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {isSigningOut ? (<DropdownMenuItem disabled>
              <Loader2 className="animate-spin" />
              Logging out
            </DropdownMenuItem>) : (<DropdownMenuItem onClick={() => signOutAsync(undefined)}>
              <LogOut />
              Log out
            </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
