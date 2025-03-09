"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  nestedDialogs: Record<string, boolean>;
  openNestedDialog: (identifier: string) => void;
  closeNestedDialog: (identifier: string) => void;
  setNestedDialogState: (identifier: string, open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
);

const Dialog = (props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => {
  const [nestedDialogs, setNestedDialogs] = React.useState<Record<string, boolean>>({});

  const openNestedDialog = React.useCallback((identifier: string) => {
    setNestedDialogs(prev => ({ ...prev, [identifier]: true }));
  }, []);

  const closeNestedDialog = React.useCallback((identifier: string) => {
    setNestedDialogs(prev => ({ ...prev, [identifier]: false }));
  }, []);

  const setNestedDialogState = React.useCallback((identifier: string, open: boolean) => {
    setNestedDialogs(prev => ({ ...prev, [identifier]: open }));
  }, []);

  return (
    <DialogContext.Provider value={{
      nestedDialogs,
      openNestedDialog,
      closeNestedDialog,
      setNestedDialogState
    }}>
      <DialogPrimitive.Root {...props} />
    </DialogContext.Provider>
  );
};
Dialog.displayName = DialogPrimitive.Root.displayName;



const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("DialogContent must be used within a Dialog");

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          Object.values(context.nestedDialogs).some(Boolean) && "translate-y-[-55%] scale-[0.97]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const NestedDialog = ({
  identifier,
  open,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> & { identifier: string }) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error("NestedDialog must be used within a Dialog");

  const isOpen = identifier ? context.nestedDialogs[identifier] ?? false : false;

  const handleOpenChange = React.useCallback((open: boolean) => {
    context.setNestedDialogState(identifier, open);
    onOpenChange?.(open);
  }, [context, identifier, onOpenChange]);

  React.useEffect(() => {
    if (open !== undefined && open !== isOpen) {
      handleOpenChange(open);
    }
  }, [open, handleOpenChange, isOpen]);

  return (
    <DialogPrimitive.Root
      {...props}
      open={isOpen}
      onOpenChange={handleOpenChange}
    />
  );
};
NestedDialog.displayName = "NestedDialog";


const NestedDialogTrigger = DialogPrimitive.Trigger;
const NestedDialogClose = DialogPrimitive.Close;

interface NestedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  position?: "default" | "bottom" | "top" | "left" | "right";
}

const NestedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  NestedDialogContentProps
>(
  (
    { className, children, position = "default", ...props },
    ref,
  ) => {
    const context = React.useContext(DialogContext);
    if (!context)
      throw new Error("NestedDialogContent must be used within a Dialog");

    const contentRef = React.useRef<HTMLDivElement>(null);

    return (
      <DialogPortal>
        <DialogPrimitive.Content
          ref={ref}
          style={{
            transform: "translate(-50%, -50%)",
            transition: "transform 0.3s ease-out",
          }}
          className={cn(
            "fixed left-[50%] top-[50%] z-[60] grid w-full max-w-lg translate-x-[-50%] translate-y-[-45%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            position === "default" &&
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            position === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom-[10%] data-[state=open]:slide-in-from-bottom-[10%]",
            position === "top" &&
            "data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full",
            position === "left" &&
            "data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full",
            position === "right" &&
            "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
            className,
          )}
          {...props}
        >
          <div ref={contentRef}>{children}</div>
          <NestedDialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </NestedDialogClose>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
NestedDialogContent.displayName = "NestedDialogContent";

const NestedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
NestedDialogHeader.displayName = "NestedDialogHeader";

const NestedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:space-x-2", className)}
    {...props}
  />
);
NestedDialogFooter.displayName = "NestedDialogFooter";

const NestedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
NestedDialogTitle.displayName = "NestedDialogTitle";

const NestedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
NestedDialogDescription.displayName = "NestedDialogDescription";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export type { NestedDialogContentProps };
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  NestedDialog,
  NestedDialogTrigger,
  NestedDialogContent,
  NestedDialogHeader,
  NestedDialogFooter,
  NestedDialogTitle,
  NestedDialogDescription,
  NestedDialogClose,
  DialogPortal,
  DialogOverlay,
};
