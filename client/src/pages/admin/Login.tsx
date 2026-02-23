import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, forgotPassword, isAuthenticated, loading: authLoading } = useAdminAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && !authLoading) {
    setLocation("/admin");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      setLocation("/admin");
    } else {
      setError(result.error || "ログインに失敗しました");
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setForgotPasswordSent(true);
    } else {
      setError(result.error || "エラーが発生しました");
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-anthracite flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-anthracite border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img src="/images/logo.svg" alt="W.O.JP" className="h-12" />
          </div>
          <CardTitle className="text-2xl font-display text-white">
            {showForgotPassword ? "パスワード再設定" : "管理画面ログイン"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {showForgotPassword 
              ? "登録済みのメールアドレスを入力してください" 
              : "メールアドレスとパスワードを入力してください"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {forgotPasswordSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-brass/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-brass" />
              </div>
              <p className="text-gray-300">
                パスワード再設定のメールを送信しました。<br />
                メールをご確認ください。
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSent(false);
                }}
                className="border-white/20 text-gray-400 hover:text-white"
              >
                ログイン画面に戻る
              </Button>
            </div>
          ) : showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-brass text-anthracite hover:bg-brass-light"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    送信中...
                  </>
                ) : (
                  "再設定メールを送信"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-400 hover:text-white"
              >
                ログイン画面に戻る
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-400">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-400">パスワード</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-brass text-anthracite hover:bg-brass-light"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-gray-400 hover:text-white text-sm"
              >
                パスワードをお忘れですか？
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
