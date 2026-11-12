"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";

type EditPassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: SavedRecord;
};

const passSchema = z.object({
  site: z.string().min(1, "Site is required").max(30, "WTF IS THAT SITE?!?"),
  username: z.string(),
  password: z.string().min(1, "Password is required"),
});

type PassFormValues = z.infer<typeof passSchema>;

export function EditPassDialog({
  open,
  onOpenChange,
  record,
}: EditPassDialogProps) {
  const [showPass, setShowPass] = useState(false);
  const updateRecord = useSaveDataStore((state) => state.updateRecord);

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      site: record.site,
      username: record.username ?? "",
      password: record.password,
    },
  });

  // Pre-fill fields whenever the dialog opens or record changes
  useEffect(() => {
    if (open) {
      form.reset({
        site: record.site,
        username: record.username ?? "",
        password: record.password,
      });
    }
  }, [open, record, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPass(false);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: PassFormValues) => {
    updateRecord(record.id, {
      site: values.site,
      username: values.username,
      password: values.password,
    });

    setShowPass(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit password</DialogTitle>
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

            {/* Username */}
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    placeholder=""
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
                      placeholder=""
                      aria-invalid={fieldState.invalid}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full w-10"
                      onClick={() => setShowPass((prev) => !prev)}
                      aria-label={showPass ? "Hide password" : "Show password"}
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
                </Field>
              )}
            />
          </FieldGroup>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button type="submit" className="flex-1">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
