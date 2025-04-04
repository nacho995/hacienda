'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaKey, FaUserShield, FaEllipsisV, FaChevronDown, FaCheck, FaTimes, FaExclamationCircle, FaLock, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import userService from '@/services/userService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Portal } from '@/components/Portal';

export default function AdminUsuarios() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Redirigir si no está autenticado o no es admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (!authLoading && !isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const [usuarios, setUsuarios] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'Visualizador',
    activo: true
  });
  
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: ''
  });
  
  // Cargar usuarios de la API
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated || !isAdmin) return;
      
      try {
        setLoadingUsers(true);
        const response = await userService.getAllUsers();
        
        // Comprobar si la respuesta es un array directo o un objeto con format {success, data}
        if (Array.isArray(response)) {
          // Si la API devuelve directamente un array de usuarios
          setUsuarios(response);
        } else if (response.success && Array.isArray(response.data)) {
          // Si la API devuelve {success: true, data: [...]}
          setUsuarios(response.data);
        } else {
          toast.error('Error al cargar los usuarios');
          console.error('Respuesta inesperada al cargar usuarios:', response);
        }
      } catch (error) {
        toast.error('Error al cargar los usuarios');
        console.error('Error cargando usuarios:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [isAuthenticated, isAdmin]);
  
  const filteredUsuarios = usuarios.filter(usuario => {
    return (
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleNewUser = () => {
    if (!isAdmin) {
      alert('Solo los administradores pueden crear nuevos usuarios');
      return;
    }
    
    setEditUser(null);
    setNewUser({
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      role: 'usuario',
      activo: true
    });
    setShowUserForm(true);
  };
  
  const handleEditUser = (user) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden editar usuarios');
      return;
    }
    
    setEditUser(user);
    setNewUser({
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      email: user.email || '',
      password: '',
      role: user.role || 'usuario',
      activo: user.confirmado === true
    });
    setShowUserForm(true);
    setShowDropdown(null);
  };
  
  const handleDeleteUser = (user) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar usuarios');
      return;
    }
    
    // No permitir eliminar al admin principal
    if (user.role === 'admin' && user.email === 'admin@hacienda-sancarlos.com') {
      alert('No se puede eliminar al administrador principal del sistema');
      return;
    }
    
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setShowDropdown(null);
  };
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) {
      toast.error('No se ha seleccionado ningún usuario para eliminar');
      return;
    }

    try {
      const result = await userService.deleteUser(userToDelete._id);

      if (result.success) {
        setUsuarios(usuarios.filter(u => u._id !== userToDelete._id));
        toast.success('Usuario eliminado correctamente');
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } else {
        toast.error(result.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };
  
  const handleChangePassword = (user) => {
    if (!isAdmin && user.email !== user.email) {
      alert('Solo puedes cambiar tu propia contraseña o ser administrador');
      return;
    }
    
    setUserToChangePassword(user);
    setNewPassword({
      password: '',
      confirmPassword: ''
    });
    setShowChangePasswordForm(true);
    setShowDropdown(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPassword({
      ...newPassword,
      [name]: value
    });
  };
  
  const saveUser = async () => {
    if (!isAdmin) {
      toast.error('No tienes permisos para realizar esta acción');
      return;
    }

    try {
      if (editUser) {
        const userData = {
          nombre: newUser.nombre,
          apellidos: newUser.apellidos,
          email: newUser.email,
          role: newUser.role,
          confirmado: newUser.activo
        };

        const result = await userService.updateUser(editUser._id, userData);

        if (result.success) {
          setUsuarios(usuarios.map(user => 
            user._id === editUser._id ? { ...user, ...userData } : user
          ));
          toast.success('Usuario actualizado correctamente');
          setShowUserForm(false);
        } else {
          toast.error(result.message || 'Error al actualizar usuario');
        }
      } else {
        const userData = {
          nombre: newUser.nombre,
          apellidos: newUser.apellidos,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          confirmado: newUser.activo
        };

        const result = await userService.createUser(userData);

        if (result.success) {
          setUsuarios([...usuarios, result.data]);
          toast.success('Usuario creado correctamente');
          setShowUserForm(false);
        } else {
          toast.error(result.message || 'Error al crear usuario');
        }
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };
  
  const savePassword = async () => {
    if (!newPassword.password || !newPassword.confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (newPassword.password !== newPassword.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const result = await userService.updatePassword(userToChangePassword._id, {
        password: newPassword.password
      });

      if (result.success) {
        toast.success('Contraseña actualizada correctamente');
        setShowChangePasswordForm(false);
        setUserToChangePassword(null);
        setNewPassword({ password: '', confirmPassword: '' });
      } else {
        toast.error(result.message || 'Error al actualizar contraseña');
      }
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
    }
  };
  
  const toggleUserStatus = async (userId) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden cambiar el estado de los usuarios');
      return;
    }

    const targetUser = usuarios.find(u => u._id === userId);

    if (targetUser.role === 'admin' && targetUser.email === 'admin@hacienda-sancarlos.com' && targetUser.confirmado) {
      toast.error('No se puede desactivar al administrador principal del sistema');
      return;
    }

    try {
      const newStatus = !targetUser.confirmado;
      const result = await userService.updateUser(userId, {
        confirmado: newStatus
      });

      if (result.success) {
        setUsuarios(usuarios.map(user => 
          user._id === userId ? { ...user, confirmado: newStatus } : user
        ));
        toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      } else {
        toast.error(result.message || 'Error al cambiar el estado del usuario');
      }
    } catch (error) {
      console.error('Error cambiando estado de usuario:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar el estado del usuario');
    }

    setShowDropdown(null);
  };
  
  const handleShowDropdown = (userId, event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      right: window.innerWidth - rect.right
    });
    setShowDropdown(userId);
  };
  
  // Si está cargando, mostrar indicador
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[var(--font-display)] text-gray-800">
            Usuarios
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona los usuarios del sistema y sus permisos
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={handleNewUser}
            className="px-4 py-2 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <FaPlus />
            <span>Nuevo Usuario</span>
          </button>
        ) : null}
      </div>
      
      {/* Advertencia de seguridad */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamationCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              La gestión de usuarios está restringida a administradores. Todas las acciones realizadas aquí quedan registradas por motivos de seguridad.
            </p>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow-lg">
        {loadingUsers ? (
          <div className="flex items-center justify-center py-10">
            <FaSpinner className="animate-spin text-3xl text-[var(--color-primary)] mr-3" />
            <span className="text-gray-600">Cargando usuarios...</span>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full min-w-full table-fixed">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                    Usuario
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Rol
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Fecha de Creación
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Estado
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsuarios.length > 0 ? filteredUsuarios.map((usuario) => (
                  <tr key={usuario._id} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs">
                          {usuario.nombre?.charAt(0) || usuario.email?.charAt(0) || '?'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {usuario.nombre} {usuario.apellidos}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {usuario.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <FaUserShield className="text-[var(--color-primary)] mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{usuario.role}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {new Date(usuario.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.confirmado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {usuario.confirmado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-medium relative">
                      <div className="relative">
                        <button
                          onClick={(e) => handleShowDropdown(usuario._id, e)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {showDropdown === usuario._id && (
                          <Portal>
                            <div 
                              className="fixed inset-0 bg-black bg-opacity-5" 
                              style={{ zIndex: 999998 }} 
                              onClick={() => setShowDropdown(null)} 
                            />
                            <div
                              className="absolute bg-white rounded-lg shadow-lg py-2"
                              style={{
                                zIndex: 999999,
                                position: 'fixed',
                                top: `${dropdownPosition.top}px`,
                                right: `${dropdownPosition.right}px`,
                                minWidth: '200px',
                                marginTop: '5px'
                              }}
                            >
                              <button
                                onClick={() => handleEditUser(usuario)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <FaEdit className="mr-2" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleChangePassword(usuario)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <FaKey className="mr-2" />
                                Cambiar Contraseña
                              </button>
                              <button
                                onClick={() => toggleUserStatus(usuario._id)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                {usuario.confirmado ? (
                                  <>
                                    <FaTimes className="mr-2 text-red-500" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <FaCheck className="mr-2 text-green-500" />
                                    Activar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usuario)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                              >
                                <FaTrash className="mr-2" />
                                Eliminar
                              </button>
                            </div>
                          </Portal>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para crear/editar usuario */}
      {showUserForm && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 999999 }}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={newUser.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={newUser.apellidos}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                
                {!editUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      required={!editUser}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    >
                      <option value="admin">Administrador</option>
                      <option value="usuario">Usuario</option>
                      <option value="editor">Editor</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="usuarioActivo"
                    name="activo"
                    checked={newUser.activo}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                  />
                  <label htmlFor="usuarioActivo" className="ml-2 text-sm text-gray-700">
                    Usuario activo
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveUser}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  {editUser ? 'Actualizar' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
      
      {/* Modal para confirmar eliminación */}
      {showDeleteConfirm && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 999999 }}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Eliminar Usuario
              </h3>
              
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar al usuario <span className="font-semibold">{userToDelete?.nombre}</span>? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
      
      {/* Modal para cambiar contraseña */}
      {showChangePasswordForm && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 999999 }}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Cambiar Contraseña
              </h3>
              
              <p className="text-gray-600 mb-4">
                Cambiar contraseña para el usuario: <span className="font-semibold">{userToChangePassword?.nombre}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newPassword.password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newPassword.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    required
                  />
                </div>
                
                {newPassword.password && newPassword.confirmPassword && newPassword.password !== newPassword.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowChangePasswordForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePassword}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                  disabled={!newPassword.password || !newPassword.confirmPassword || newPassword.password !== newPassword.confirmPassword}
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
} 