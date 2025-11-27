import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { delivererService } from '../services/deliverer.service';
import type { Deliverer } from '../types';
import { Plus, Search, Edit, Trash2, User, Truck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Deliverers() {
  const { user } = useAuth();
  const [deliverers, setDeliverers] = useState<Deliverer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeliverer, setEditingDeliverer] = useState<Deliverer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    password: '',
    phone: '',
    vehicle_type: '',
    vehicle_plate: '',
    cnh: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    is_active: true,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDeliverers();
  }, []);

  const loadDeliverers = async () => {
    try {
      setLoading(true);
      const response = await delivererService.getAll({ per_page: 1000 });
      setDeliverers(response.data);
    } catch (error) {
      console.error('Erro ao carregar entregadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (deliverer?: Deliverer) => {
    if (deliverer) {
      setEditingDeliverer(deliverer);
      setFormData({
        name: deliverer.name,
        cpf: deliverer.cpf,
        email: deliverer.email,
        password: '', // Don't show password on edit
        phone: deliverer.phone,
        vehicle_type: deliverer.vehicle_type || '',
        vehicle_plate: deliverer.vehicle_plate || '',
        cnh: deliverer.cnh || '',
        birth_date: deliverer.birth_date || '',
        address: deliverer.address || '',
        city: deliverer.city || '',
        state: deliverer.state || '',
        zip_code: deliverer.zip_code || '',
        is_active: deliverer.is_active,
      });
    } else {
      setEditingDeliverer(null);
      setFormData({
        name: '',
        cpf: '',
        email: '',
        password: '',
        phone: '',
        vehicle_type: '',
        vehicle_plate: '',
        cnh: '',
        birth_date: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        is_active: true,
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeliverer(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const dataToSubmit: any = { ...formData };

      // Remove password field if editing and password is empty
      if (editingDeliverer && !formData.password) {
        delete dataToSubmit.password;
      }

      if (editingDeliverer) {
        await delivererService.update(editingDeliverer.id, dataToSubmit);
      } else {
        await delivererService.create(dataToSubmit);
      }
      await loadDeliverers();
      handleCloseModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat().join(', ') ||
          'Erro ao salvar entregador'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este entregador?')) {
      return;
    }

    try {
      await delivererService.delete(id);
      await loadDeliverers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir entregador');
    }
  };

  const filteredDeliverers = deliverers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cpf.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Entregadores</h1>
                <p className="text-sm text-gray-600">{user?.company.name}</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Entregador
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{deliverers.length}</p>
              </div>
              <User className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {deliverers.filter((d) => d.is_active).length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-600">
                  {deliverers.filter((d) => !d.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deliverers List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando entregadores...</p>
          </div>
        ) : filteredDeliverers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm
                ? 'Nenhum entregador encontrado'
                : 'Nenhum entregador cadastrado. Clique em "Novo Entregador" para começar.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliverers.map((deliverer) => (
                  <tr key={deliverer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deliverer.name}</div>
                      <div className="text-sm text-gray-500">{deliverer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverer.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deliverer.vehicle_type && (
                        <div>
                          <div className="font-medium">{deliverer.vehicle_type}</div>
                          {deliverer.vehicle_plate && (
                            <div className="text-gray-500">{deliverer.vehicle_plate}</div>
                          )}
                        </div>
                      )}
                      {!deliverer.vehicle_type && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          deliverer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {deliverer.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(deliverer)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(deliverer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDeliverer ? 'Editar Entregador' : 'Novo Entregador'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CPF (apenas números) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={11}
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        disabled={!!editingDeliverer}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Senha Inicial {!editingDeliverer && '*'}
                      </label>
                      <input
                        type="password"
                        required={!editingDeliverer}
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder={editingDeliverer ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                      />
                      {!editingDeliverer && (
                        <p className="mt-1 text-sm text-gray-500">
                          O entregador deverá trocar esta senha no primeiro acesso
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CNH (apenas números)
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        value={formData.cnh}
                        onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Veículo */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900">Veículo</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Veículo
                      </label>
                      <select
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Selecione...</option>
                        <option value="moto">Moto</option>
                        <option value="carro">Carro</option>
                        <option value="bicicleta">Bicicleta</option>
                        <option value="van">Van</option>
                        <option value="caminhao">Caminhão</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Placa</label>
                      <input
                        type="text"
                        maxLength={7}
                        value={formData.vehicle_plate}
                        onChange={(e) =>
                          setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="ABC1234"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900">Endereço</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Endereço</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cidade</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value.toUpperCase() })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">CEP</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="00000000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.is_active ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.value === 'true' })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? 'Salvando...'
                      : editingDeliverer
                      ? 'Salvar Alterações'
                      : 'Cadastrar Entregador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
