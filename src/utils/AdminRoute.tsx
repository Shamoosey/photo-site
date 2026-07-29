import { Show, SignIn, useUser } from "@clerk/react";
import { LoadingSpinner } from "../components/UI";
import { Navigate } from "react-router";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center mt-40">
        <LoadingSpinner />
      </div>
    );
  }

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <>
      <Show when={"signed-in"}>{isAdmin ? children : <Navigate to="/" replace />}</Show>
      <Show when={"signed-out"}>
        <div className="flex justify-center mt-20">
          <SignIn forceRedirectUrl={"/admin"} />
        </div>
      </Show>
    </>
  );
}
