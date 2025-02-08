"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerOverlay,
  DrawerHeader,
  DrawerTitle,
  DrawerPortal,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

export function ResponsiveDialogDrawer(props: React.ComponentProps<typeof Dialog> & React.ComponentProps<typeof Drawer>) {
  const isMobile = useIsMobile()

  return isMobile ? <Drawer {...props} /> : <Dialog {...props} />
}

export function ResponsiveDialogDrawerTrigger(props: React.ComponentProps<typeof DialogTrigger> & React.ComponentProps<typeof DrawerTrigger>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerTrigger {...props} /> : <DialogTrigger {...props} />
}

export function ResponsiveDialogDrawerContent(props: React.ComponentProps<typeof DialogContent> & React.ComponentProps<typeof DrawerContent>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerContent {...props} /> : <DialogContent {...props} />
}

export function ResponsiveDialogDrawerTitle(props: React.ComponentProps<typeof DialogTitle> & React.ComponentProps<typeof DrawerTitle>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerTitle {...props} /> : <DialogTitle {...props} />
}

export function ResponsiveDialogDrawerDescription(props: React.ComponentProps<typeof DialogDescription> & React.ComponentProps<typeof DrawerDescription>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerDescription {...props} /> : <DialogDescription {...props} />
}

export function ResponsiveDialogDrawerClose(props: React.ComponentProps<typeof DialogClose> & React.ComponentProps<typeof DrawerClose>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerClose {...props} /> : <DialogClose {...props} />
}

export function ResponsiveDialogDrawerOverlay(props: React.ComponentProps<typeof DialogOverlay> & React.ComponentProps<typeof DrawerOverlay>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerOverlay {...props} /> : <DialogOverlay {...props} />
}

export function ResponsiveDialogDrawerPortal(props: React.ComponentProps<typeof DialogPortal> & React.ComponentProps<typeof DrawerPortal>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerPortal {...props} /> : <DialogPortal {...props} />
}

export function ResponsiveDialogDrawerHeader(props: React.ComponentProps<typeof DialogHeader> & React.ComponentProps<typeof DrawerHeader>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerHeader {...props} /> : <DialogHeader {...props} />
}

export function ResponsiveDialogDrawerFooter(props: React.ComponentProps<typeof DialogFooter> & React.ComponentProps<typeof DrawerFooter>) {
  const isMobile = useIsMobile()

  return isMobile ? <DrawerFooter {...props} /> : <DialogFooter {...props} />
}
