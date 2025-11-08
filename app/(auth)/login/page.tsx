"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

// ==== COMPOSANTS SIMPLES ====
const Button = ({ children, className = "", ...props }: any) => (
  <button
    {...props}
    className={`bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition ${className}`}
  >
    {children}
  </button>
)

const Input = ({ className = "", ...props }: any) => (
  <input
    {...props}
    className={`border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
  />
)

const Card = ({ children, className = "" }: any) => (
  <div className={`border bg-white rounded-lg p-6 shadow ${className}`}>{children}</div>
)

const CardHeader = ({ children }: any) => <div className="mb-4">{children}</div>
const CardTitle = ({ children }: any) => <h2 className="text-xl font-bold text-gray-900">{children}</h2>
const CardDescription = ({ children }: any) => <p className="text-gray-600">{children}</p>
const CardContent = ({ children }: any) => <div>{children}</div>
// ===================================

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single()

      if (profile?.user_type === "restaurant") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre compte Restafy</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas de compte ?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
