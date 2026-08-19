import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hospital/")({
  beforeLoad: () => {
    throw redirect({ to: "/hospital/login" });
  },
});
