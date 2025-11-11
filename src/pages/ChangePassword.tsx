import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { delivererAuthService } from '../services/deliverer-auth.service';
import { Lock, AlertCircle } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if not required to change password
    const mustChange = delivererAuthService.getMustChangePassword();
    if (!mustChange) {
      navigate('/deliverer/deliveries');
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.new_password !== formData.new_password_confirmation) {
      setError('As senhas não coincidem');
      return;
    }

    // Validate password length
    if (formData.new_password.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await delivererAuthService.changePassword(formData);
      delivererAuthService.clearMustChangePassword();
      navigate('/deliverer/deliveries');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.current_password?.[0] ||
        'Erro ao trocar senha'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Troca de Senha Obrigatória</h1>
            <p className="text-gray-600">
              Por segurança, você precisa alterar sua senha no primeiro acesso
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="current_password"
                  type="password"
                  required
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.current_password}
                  onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="new_password"
                  type="password"
                  required
                  minLength={6}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="new_password_confirmation"
                  type="password"
                  required
                  minLength={6}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={formData.new_password_confirmation}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password_confirmation: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
