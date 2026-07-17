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

export default function MarketingError({ error, reset }) {
  const category = getErrorCategory(error);

  if (category === "network") {
    return (
      <GeneralErrorPage
        error={error}
        reset={reset}
        title="Can't Load the Page"
        description="We're having trouble connecting. Please check your internet connection and try again."
      />
    );
  }

  return <ServerErrorPage error={error} reset={reset} />;
}
