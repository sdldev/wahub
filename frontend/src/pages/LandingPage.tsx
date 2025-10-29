import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Shield, Users, CheckCircle, Send } from 'lucide-react';
import { userService } from '@/services/userService';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    note: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      try {
        // Submit access request to users table
        const result = await userService.requestAccess({
          email: formData.email,
          phone: formData.phone,
          note: formData.note || 'Access request from landing page',
        });

        if (result.success) {
          setIsSubmitted(true);
          // Reset form
          setFormData({
            email: '',
            phone: '',
            note: '',
          });
        } else {
          setError(result.message || 'Gagal mengirim permintaan akses');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Terjadi kesalahan saat mengirim permintaan akses');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending access request:', error);
      setError('Terjadi kesalahan jaringan. Silahkan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Permintaan Terkirim!</CardTitle>
            <CardDescription>
              Permintaan akses Anda telah berhasil dikirim ke admin. Kami akan menghubungi Anda
              segera melalui WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
              Kirim Permintaan Lain
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">WA Gateway</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="hidden sm:flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Private & Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Invitation Only</span>
                </div>
              </div>
              <Button
                onClick={() => (window.location.href = '/login')}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Already have access? Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            WhatsApp Gateway Privat
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            WhatsApp Gateway
            <span className="block text-blue-600">Khusus Kalangan Sendiri</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sistem WhatsApp Gateway pribadi yang aman dan terpercaya. Akses terbatas hanya untuk
            kalangan tertentu dengan persetujuan admin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Status: Private Access Only</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>Mode: Invitation Required</span>
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Keamanan Tinggi</h3>
              <p className="text-sm text-gray-600">
                Sistem private dengan enkripsi end-to-end dan akses terbatas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">API Gateway</h3>
              <p className="text-sm text-gray-600">
                Integration WhatsApp dengan sistem internal melalui API
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Akses Terbatas</h3>
              <p className="text-sm text-gray-600">
                Hanya untuk kalangan tertentu dengan persetujuan admin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Request Access Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Permintaan Akses</CardTitle>
              <CardDescription className="text-base">
                Untuk mendapatkan akses, silahkan isi form di bawah ini. Tim kami akan menghubungi
                Anda via WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      className="bg-white/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      No. WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="628123456789"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      required
                      className="bg-white/80"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                    Alasan Membutuhkan Akses *
                  </Label>
                  <textarea
                    id="note"
                    placeholder="Jelaskan mengapa Anda membutuhkan akses ke WhatsApp Gateway ini..."
                    value={formData.note}
                    onChange={handleChange('note')}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Mengirim Permintaan...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Permintaan Akses
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>
                    Dengan mengirim form ini, Anda menyetujui bahwa data akan diproses untuk
                    keperluan verifikasi akses.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/60 backdrop-blur-sm border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="text-center md:text-left">
              <h4 className="font-semibold text-gray-900 mb-2">WhatsApp Gateway</h4>
              <p className="text-sm text-gray-600">
                Sistem private untuk integrasi WhatsApp dengan aplikasi internal.
              </p>
            </div>

            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Status System</h4>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
            </div>

            <div className="text-center md:text-right">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                Contact Admin:
                <br />
                <span className="font-mono">+62 857-8302-4799</span>
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 pt-6 border-t border-gray-200">
            <p>&copy; 2025 WhatsApp Gateway Private. All rights reserved.</p>
            <p className="mt-1">Akses terbatas dan dikelola secara privat oleh admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
