'use client';

import { useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaKey, FaUserShield, FaEllipsisV, FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: 'Admin Principal',
      email: 'admin@haciendasancarlos.com',
      rol: 'Administrador',
      fechaCreacion: '2023-10-15',
      activo: true
    },
    {
      id: 2,
      nombre: 'Juan García',
      email: 'juan@haciendasancarlos.com',
      rol: 'Editor',
      fechaCreacion: '2024-01-20',
      activo: true
    },
    {
      id: 3,
      nombre: 'María López',
      email: 'maria@haciendasancarlos.com',
      rol: 'Gestor',
      fechaCreacion: '2024-02-10',
      activo: true
    },
    {
      id: 4,
      nombre: 'Carlos Rodríguez',
      email: 'carlos@haciendasancarlos.com',
      rol: 'Visualizador',
      fechaCreacion: '2024-03-05',
      activo: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Visualizador',
    activo: true
  });
  
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const filteredUsuarios = usuarios.filter(usuario => {
    return (
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleNewUser = () => {
    setEditUser(null);
    setNewUser({
      nombre: '',
      email: '',
      password: '',
      rol: 'Visualizador',
      activo: true
    });
    setShowUserForm(true);
  };
  
  const handleEditUser = (user) => {
    setEditUser(user);
    setNewUser({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      activo: user.activo
    });
    setShowUserForm(true);
    setShowDropdown(null);
  };
  
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setShowDropdown(null);
  };
  
  const confirmDeleteUser = () => {
    setUsuarios(usuarios.filter(u => u.id !== userToDelete.id));
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };
  
  const handleChangePassword = (user) => {
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
  
  const saveUser = () => {
    if (editUser) {
      // Actualizar usuario existente
      setUsuarios(
        usuarios.map(user => 
          user.id === editUser.id 
            ? { ...user, ...newUser } 
            : user
        )
      );
    } else {
      // Crear nuevo usuario
      const newId = Math.max(...usuarios.map(u => u.id)) + 1;
      setUsuarios([
        ...usuarios,
        {
          id: newId,
          ...newUser,
          fechaCreacion: new Date().toISOString().split('T')[0]
        }
      ]);
    }
    
    setShowUserForm(false);
  };
  
  const savePassword = () => {
    // En una aplicación real, aquí enviarías a tu API
    // Por ahora solo cerramos el formulario
    setShowChangePasswordForm(false);
    setUserToChangePassword(null);
  };
  
  const toggleUserStatus = (userId) => {
    setUsuarios(
      usuarios.map(user => 
        user.id === userId 
          ? { ...user, activo: !user.activo } 
          : user
      )
    );
    setShowDropdown(null);
  };
  
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
        <button
          onClick={handleNewUser}
          className="px-4 py-2 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <FaPlus />
          <span>Nuevo Usuario</span>
        </button>
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                        {usuario.nombre.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {usuario.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaUserShield className="text-[var(--color-primary)] mr-2" />
                      <span className="text-sm text-gray-900">{usuario.rol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === usuario.id ? null : usuario.id)}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                    >
                      <FaEllipsisV />
                    </button>
                    
                    {showDropdown === usuario.id && (
                      <div className="absolute right-6 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          <button
                            onClick={() => handleEditUser(usuario)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            role="menuitem"
                          >
                            <FaEdit className="mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleChangePassword(usuario)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            role="menuitem"
                          >
                            <FaKey className="mr-2" />
                            Cambiar Contraseña
                          </button>
                          <button
                            onClick={() => toggleUserStatus(usuario.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            role="menuitem"
                          >
                            {usuario.activo ? (
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
                            role="menuitem"
                          >
                            <FaTrash className="mr-2" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal para crear/editar usuario */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
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
                    name="rol"
                    value={newUser.rol}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Editor">Editor</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Visualizador">Visualizador</option>
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
      )}
      
      {/* Modal para confirmar eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
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
      )}
      
      {/* Modal para cambiar contraseña */}
      {showChangePasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
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
      )}
    </div>
  );
} 