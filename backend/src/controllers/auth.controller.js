const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const emailConfirmacionAdmin = require('../emails/confirmacionAdmin');

// @desc    Registrar un usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { nombre, apellidos, email, password, telefono } = req.body;

    // Verificar que el email no existe ya en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Crear el usuario con role 'usuario' por defecto, sin confirmar
    const user = await User.create({
      nombre,
      apellidos,
      email,
      password,
      telefono,
      role: 'usuario',
      confirmado: false // Requiere confirmación
    });

    // Generar token de confirmación
    const confirmToken = user.generateConfirmationToken();
    await user.save({ validateBeforeSave: false });

    // Crear URL de confirmación
    const confirmUrl = `${process.env.CLIENT_URL}/confirmar-cuenta/${confirmToken}`;

    // Enviar email al administrador para aprobación
    await sendEmail({
      email: process.env.ADMIN_EMAIL,
      subject: 'Nueva solicitud de registro - Hacienda San Carlos Borromeo',
      html: `
        <h1>Nueva solicitud de registro</h1>
        <p>Un nuevo usuario desea registrarse en el sistema:</p>
        <p><strong>Nombre:</strong> ${nombre} ${apellidos}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p>Para aprobar este registro, haga clic en el siguiente enlace:</p>
        <a href="${confirmUrl}" style="padding: 10px 15px; background-color: #800020; color: white; text-decoration: none; border-radius: 4px;">Aprobar registro</a>
        <p>Si no reconoces esta solicitud, por favor ignórala.</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud de registro enviada. Recibirás un correo cuando tu cuenta sea aprobada.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario'
    });
  }
};

// @desc    Registrar un administrador
// @route   POST /api/auth/register-admin
// @access  Private/Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { nombre, apellidos, email, password, telefono } = req.body;

    // Verificar que el email no existe ya en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado'
      });
    }

    // Crear el usuario admin sin confirmar
    const user = await User.create({
      nombre,
      apellidos,
      email,
      password,
      telefono,
      role: 'admin',
      confirmado: false
    });

    // Generar token de confirmación
    const confirmToken = user.generateConfirmationToken();
    await user.save({ validateBeforeSave: false });

    // Crear URL de confirmación
    const confirmUrl = `${process.env.CLIENT_URL}/admin/confirmar/${confirmToken}`;

    try {
      // Enviar email al administrador principal
      await sendEmail({
        email: process.env.ADMIN_EMAIL,
        subject: 'Nueva solicitud de cuenta de administrador',
        html: emailConfirmacionAdmin(user.nombre, confirmUrl)
      });

      res.status(201).json({
        success: true,
        message: 'Se ha enviado un correo de confirmación al administrador principal'
      });
    } catch (err) {
      console.error('Error al enviar email:', err);
      
      // Si falla el envío, eliminar el token de confirmación
      user.tokenConfirmacion = undefined;
      user.tokenExpiracion = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el correo de confirmación'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el administrador'
    });
  }
};

// @desc    Confirmar cuenta de usuario
// @route   GET /api/auth/confirm/:token
// @access  Public
exports.confirmAccount = async (req, res) => {
  try {
    // Obtener el token hasheado
    const tokenConfirmacion = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    // Buscar usuario con ese token y que no haya expirado
    const user = await User.findOne({
      tokenConfirmacion,
      tokenExpiracion: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
    // Activar usuario
    user.confirmado = true;
    user.tokenConfirmacion = undefined;
    user.tokenExpiracion = undefined;
    await user.save();
    
    // Enviar email al usuario notificando que su cuenta ha sido aprobada
    await sendEmail({
      email: user.email,
      subject: 'Tu cuenta ha sido aprobada - Hacienda San Carlos Borromeo',
      html: `
        <h1>¡Enhorabuena, ${user.nombre}!</h1>
        <p>Tu cuenta en Hacienda San Carlos Borromeo ha sido aprobada.</p>
        <p>Ya puedes iniciar sesión y acceder a nuestros servicios:</p>
        <a href="${process.env.CLIENT_URL}/login" style="padding: 10px 15px; background-color: #800020; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">Iniciar sesión</a>
      `
    });
    
    res.status(200).json({
      success: true,
      message: 'Cuenta confirmada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la cuenta'
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione un email y contraseña'
      });
    }
    
    // Buscar usuario y seleccionar password para poder compararla
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la cuenta está confirmada
    if (!user.confirmado) {
      return res.status(401).json({
        success: false,
        message: 'Por favor, espera a que tu cuenta sea aprobada por un administrador'
      });
    }
    
    // Actualizar fecha de último inicio de sesión
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario'
    });
  }
};

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Función para enviar token de respuesta con cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // días * horas * minutos * segundos * milisegundos
    httpOnly: true
  };
  
  // Usar cookie segura en producción
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role
      }
    });
}; 