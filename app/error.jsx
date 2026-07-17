"use client";

import ServerErrorPage from "./error-pages/500";
import GeneralErrorPage from "./error-pages/general";

function getErrorCategory(error) {
  if (!error) return "500";
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("timeout")) {
    return "network";
  }
  return "500";
}

export default function Error({ error, reset }) {
  const category = getErrorCategory(error);

  if (category === "network") {
    return (
      <GeneralErrorPage
        error={error}
        reset={reset}
        title="Connection Issue"
        description="We couldn't load the data you requested. This might be a temporary network issue. Please try again."
      />
    );
  }

  return <ServerErrorPage error={error} reset={reset} />;
}
