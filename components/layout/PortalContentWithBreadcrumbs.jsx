"use client";

import Breadcrumbs from "./Breadcrumbs";

export default function PortalContentWithBreadcrumbs({ children }) {
  return (
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}
