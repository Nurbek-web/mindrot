"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import signInWithGoogle from "@/lib/firebase/auth/signInWithGoogle";

function LoginForm(): JSX.Element {
  const [alert, setAlert] = useState(false);

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setAlert(false);

    const { result, error } = await signInWithGoogle();

    if (error) {
      console.log(error);
      setAlert(true);
      return;
    }

    console.log(result);

    router.push("/");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Click the button below to login with Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {alert ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An error occurred while trying to sign in with Google. Please
                  try again.
                </AlertDescription>
              </Alert>
            ) : (
              <></>
            )}

            <Button onClick={handleGoogleSignIn} className="w-full">
              Login with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
