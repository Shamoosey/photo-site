import type { ReactNode } from "react";
import { Link } from "react-router";
import { useAdmin } from "../hooks/useAdmin";

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-semibold mb-4">Access denied</h1>
          <p className="mb-4">This page is only available to administrators.</p>
          <Link to="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
