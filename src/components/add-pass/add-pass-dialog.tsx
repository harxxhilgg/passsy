"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import { usePasswordHistoryStore } from "@/app/stores/use-password-history-store";
import { savePasswordAction } from "@/app/actions/passwords";

type AddPassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
};

const passSchema = z.object({
  site: z.string().min(1, "Site is required").max(60, "Site is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
});

type PassFormValues = z.infer<typeof passSchema>;

export function AddPassDialog({
  open,
  onOpenChange,
  value,
}: AddPassDialogProps) {
  const [showPass, setShowPass] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { user, signInWithGoogle } = useAuth();
  const addRecord = useSaveDataStore((state) => state.addRecord);

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      site: "",
      email: "",
      username: "",
      password: value,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        site: "",
        email: "",
        username: "",
        password: value,
      });
    }
  }, [open, value, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPass(false);
    }
    setServerError(null);
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: PassFormValues) => {
    if (!user) {
      setShowAuthAlert(true);
      return;
    }

    setIsSaving(true);
    setServerError(null);

    const res = await savePasswordAction({
      site: values.site,
      email: values.email,
      username: values.username,
      password: values.password,
    });

    setIsSaving(false);

    if (res.success && res.record) {
      addRecord(res.record);
      usePasswordHistoryStore.getState().addActivity({
        site: res.record.site,
        action: "saved",
        timestamp: res.record.createdAt,
      });
      form.reset();
      setShowPass(false);
      onOpenChange(false);
    } else {
      setServerError(res.error || "Failed to save password.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"font-serif text-3xl tracking-tight"}>
              Add new password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              {/* Site */}
              <Controller
                name="site"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Site</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="example.com"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="email@example.com"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Username */}
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Username{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="example_user"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        type={showPass ? "text" : "password"}
                        className="pr-10"
                        placeholder="example_password"
                        aria-invalid={fieldState.invalid}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full w-10"
                        onClick={() => setShowPass((prev) => !prev)}
                        aria-label={
                          showPass ? "Hide password" : "Show password"
                        }
                      >
                        {showPass ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}

                    <FieldDescription>
                      Make sure that you&apos;re saving your current password
                      for this site
                    </FieldDescription>
                  </Field>
                )}
              />
            </FieldGroup>

            {serverError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? <Spinner className="size-4" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Auth Gate Alert Dialog */}
      <AlertDialog open={showAuthAlert} onOpenChange={setShowAuthAlert}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
              <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight">
                Sign in to save passwords
              </AlertDialogTitle>

              <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                You need to be signed in with your account to securely store
                passwords in your cloud vault.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Info className="size-4 text-muted-foreground" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                Your credentials will be encrypted with AES-256-GCM and synced
                securely to your account.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="w-full"
              onClick={() => {
                setShowAuthAlert(false);
                void signInWithGoogle();
              }}
            >
              Sign in
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
