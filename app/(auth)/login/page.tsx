import React, { Suspense } from "react";
import { Login } from "@/components/auth/login";

const login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
};

export default login;
