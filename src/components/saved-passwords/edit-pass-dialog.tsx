"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff, Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import {
  updatePasswordAction,
  deletePasswordAction,
} from "@/app/actions/passwords";
import { SavedPasswordStrength } from "./saved-password-strength";

type EditPassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: SavedRecord;
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

export function EditPassDialog({
  open,
  onOpenChange,
  record,
}: EditPassDialogProps) {
  const [showPass, setShowPass] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateRecord = useSaveDataStore((state) => state.updateRecord);
  const removeRecord = useSaveDataStore((state) => state.removeRecord);

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      site: record.site,
      email: record.email || "",
      username: record.username ?? "",
      password: record.password,
    },
  });

  // Pre-fill fields whenever the dialog opens or record changes
  useEffect(() => {
    if (open) {
      form.reset({
        site: record.site,
        email: record.email || "",
        username: record.username ?? "",
        password: record.password,
      });
    }
  }, [open, record, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPass(false);
      setShowDeleteAlert(false);
    }
    setServerError(null);
    onOpenChange(nextOpen);
  };

  const onSubmit = async (values: PassFormValues) => {
    setIsSaving(true);
    setServerError(null);

    const res = await updatePasswordAction(record.id, {
      site: values.site,
      email: values.email,
      username: values.username,
      password: values.password,
    });

    setIsSaving(false);

    if (res.success && res.record) {
      updateRecord(record.id, res.record);
      setShowPass(false);
      onOpenChange(false);
    } else {
      setServerError(res.error || "Failed to update password.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setServerError(null);

    const res = await deletePasswordAction(record.id);

    setIsDeleting(false);

    if (res.success) {
      removeRecord(record.id);
      setShowPass(false);
      setShowDeleteAlert(false);
      onOpenChange(false);
    } else {
      setServerError(res.error || "Failed to delete password.");
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className={"font-serif text-3xl tracking-tight"}>
              Edit password
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

                    <SavedPasswordStrength
                      password={field.value || ""}
                      className="pt-1.5"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isSaving || isDeleting}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSaving || isDeleting}>
                  {isSaving ? <Spinner className="size-4" /> : "Save changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
              <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight text-foreground">
                Delete password?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                Are you sure you want to delete this password for {record.site}?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Info className="size-4 text-muted-foreground" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                This action cannot be undone. This record will be permanently
                removed from your encrypted vault.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
            <AlertDialogCancel className="w-full" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="size-4" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
