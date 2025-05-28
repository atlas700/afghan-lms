import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      forceRedirectUrl={`${process.env.NEXT_PUBLIC_APP_URL + "/auth-callback"}`}
    />
  );
}
