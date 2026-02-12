"use client";
import * as React from "react";
import { changePassword } from "@/app/actions/change-password-action";
import { useToastNotifications } from "@/hooks/use-toast-notifications";

type State = {
  success?: boolean;
  error?: string;
};

const initialState: State = {};

export default function ChangePasswordForm() {
  const { showError, showSuccess } = useToastNotifications();
  const [state, formAction, isPending] = React.useActionState(
    changePassword,
    initialState,
  );

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const prevStateRef = React.useRef<State>(initialState);

  React.useEffect(() => {
    if (state === prevStateRef.current) return;

    if (state.success) {
      showSuccess("Password berhasil diganti");
      // ✅ RESET cuma kalo SUCCESS
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (state.error) {
      showError(state.error);
      // ✅ GAK RESET - data tetep ada
    }

    prevStateRef.current = state;
  }, [state, showError, showSuccess]);

  return (
    <form action={formAction} className="space-y-4 mt-6 border p-4 border-3">
      <h2 className="font-bold text-lg">Ganti Password</h2>

      <input
        type="password"
        name="currentPassword"
        placeholder="Password Lama"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full border px-3 py-2 border-2  focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
        required
        disabled={isPending}
      />

      <input
        type="password"
        name="newPassword"
        placeholder="Password Baru"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border px-3 py-2 border-2  focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
        required
        minLength={8}
        disabled={isPending}
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Ulangi Password Baru"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border px-3 py-2 border-2  focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
        required
        disabled={isPending}
      />

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 font-bold uppercase border-3 border-black hover:shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
        disabled={isPending}
      >
        {isPending ? "MENYIMPAN..." : "SIMPAN"}
      </button>
    </form>
  );
}
