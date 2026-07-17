"use client";

import ServerErrorPage from "@/app/error-pages/500";
import GeneralErrorPage from "@/app/error-pages/general";

function getErrorCategory(error) {
  if (!error) return "500";
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("timeout")) {
    return "network";
  }
  return "500";
}

export default function UserPortalError({ error, reset }) {
  const category = getErrorCategory(error);

  if (category === "network") {
    return (
      <GeneralErrorPage
        error={error}
        reset={reset}
        title="Couldn't Load Your Data"
        description="We had trouble fetching your personalized data. This could be a temporary network issue. Please try again."
      />
    );
  }

  return <ServerErrorPage error={error} reset={reset} />;
}
