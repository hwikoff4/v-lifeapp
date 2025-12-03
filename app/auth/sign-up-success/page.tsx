import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">.v Life</h1>
          <p className="mt-2 text-gray-400">Welcome to your fitness journey</p>
        </div>
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-white">Account Created!</CardTitle>
            <CardDescription className="text-gray-400">Check your email to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-[#C4A962]/30 bg-[#C4A962]/10 p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#C4A962] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-white mb-1">Verification Email Sent</p>
                  <p>
                    We&apos;ve sent a confirmation link to your email. Please click the link to verify your account
                    before signing in.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-center text-sm text-gray-400">
              <p>After verifying your email, you can:</p>
              <ul className="space-y-1 text-left list-disc list-inside text-gray-400">
                <li>Complete your profile with fitness goals</li>
                <li>Get personalized workout and meal plans</li>
                <li>Track your progress and build streaks</li>
                <li>Join the V-Life community</li>
              </ul>
            </div>

            <Button asChild className="w-full bg-[#C4A962] hover:bg-[#D4B972] text-black">
              <Link href="/auth/login">Go to Login</Link>
            </Button>

            <p className="text-center text-xs text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
