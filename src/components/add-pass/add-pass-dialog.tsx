import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";

type AddPassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
};

const passSchema = z.object({
  site: z.string().min(1, "Site is required").max(30, "WTF IS THAT SITE?!?"),
  username: z.string(),
  password: z.string().min(1, "Password is required"),
});

type PassFormValues = z.infer<typeof passSchema>;

export function AddPassDialog({
  open,
  onOpenChange,
  value,
}: AddPassDialogProps) {
  const [showPass, setShowPass] = useState<boolean>(false);
  const addRecord = useSaveDataStore((state) => state.addRecord);

  const form = useForm<PassFormValues>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      site: "",
      username: "",
      password: value,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        site: "",
        username: "",
        password: value,
      });
    }
  }, [open, value, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPass(false);
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = (values: PassFormValues) => {
    addRecord({
      site: values.site,
      username: values.username,
      password: values.password,
    });

    form.reset();
    setShowPass(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new password</DialogTitle>
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

                  <FieldDescription>
                    Make sure that you&apos;re saving your current password for
                    this site
                  </FieldDescription>
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
