import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      forceRedirectUrl={`${process.env.NEXT_PUBLIC_APP_URL + "/auth-callback"}`}
    />
  );
}
