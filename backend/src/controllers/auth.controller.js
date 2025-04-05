const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const emailConfirmacionAdmin = require('../emails/confirmacionAdmin');
const bcrypt = require('bcryptjs');

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
    
    console.log(`Intento de login para: ${email}`);
    
    // Validar email y password
    if (!email || !password) {
      console.log('Login fallido: Email o contraseña no proporcionados');
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione un email y contraseña'
      });
    }
    
    // Buscar usuario y seleccionar password para poder compararla
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`Login fallido: Usuario con email ${email} no encontrado`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    console.log(`Usuario encontrado: ${user.email}, ID: ${user._id}, Rol: ${user.role}, Confirmado: ${user.confirmado}`);
    
    // Verificación directa de la contraseña para depuración
    const passwordCheck = await bcrypt.compare(password, user.password);
    console.log(`Verificación de contraseña: ${passwordCheck ? 'Correcta' : 'Incorrecta'}`);
    
    // Verificar si la contraseña coincide usando el método del modelo
    const isMatch = await user.matchPassword(password);
    console.log(`Verificación de contraseña mediante matchPassword: ${isMatch ? 'Correcta' : 'Incorrecta'}`);
    
    if (!isMatch) {
      console.log(`Login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si la cuenta está confirmada
    if (!user.confirmado) {
      console.log(`Login fallido: Cuenta ${email} no confirmada`);
      return res.status(401).json({
        success: false,
        message: 'Por favor, espera a que tu cuenta sea aprobada por un administrador'
      });
    }
    
    // Actualizar fecha de último inicio de sesión
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    console.log(`Login exitoso para: ${email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error en login:', error);
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
    // El usuario ya viene del middleware protectRoute
    const user = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
        telefono: user.telefono,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario'
    });
  }
};

// @desc    Cerrar sesión de usuario
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Limpiar token en cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
      httpOnly: true
    });
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión'
    });
  }
};

// Función helper para enviar la respuesta con token
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token JWT
  const token = user.getSignedJwtToken();
  
  // Eliminar contraseña de la respuesta
  user.password = undefined;
  
  // Enviar token como cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  // Responder con token en cookie y cuerpo
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
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

// @desc    Solicitar reseteo de contraseña
// @route   POST /api/auth/password/forgot
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione un email'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró ningún usuario con ese email'
      });
    }

    // Generar token para resetear contraseña
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Crear URL de reseteo
    const resetUrl = `${process.env.CLIENT_URL}/restablecer-contrasena/${resetToken}`;

    // Contenido del email
    const mensaje = `
      <h1>Solicitud de restablecimiento de contraseña</h1>
      <p>Has recibido este correo porque tú (o alguien más) ha solicitado restablecer la contraseña de tu cuenta.</p>
      <p>Por favor haz clic en el siguiente enlace para completar el proceso:</p>
      <a href="${resetUrl}" style="padding: 10px 15px; background-color: #800020; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">Restablecer contraseña</a>
      <p>Si no solicitaste este restablecimiento, por favor ignora este correo y tu contraseña permanecerá sin cambios.</p>
      <p>Este enlace expirará en 10 minutos por seguridad.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Restablecimiento de contraseña - Hacienda San Carlos Borromeo',
        html: mensaje
      });

      res.status(200).json({
        success: true,
        message: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña'
      });
    } catch (error) {
      console.error('Error al enviar el correo de reseteo:', error);
      
      // Si falla el envío del correo, eliminar los tokens
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.'
      });
    }
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de restablecimiento de contraseña'
    });
  }
};

// @desc    Resetear contraseña
// @route   PUT /api/auth/password/reset/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Buscar usuario con ese token y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Validar la nueva contraseña
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione una nueva contraseña'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Establecer nueva contraseña
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Enviar email de confirmación
    try {
      await sendEmail({
        email: user.email,
        subject: 'Contraseña restablecida - Hacienda San Carlos Borromeo',
        html: `
          <h1>Contraseña Restablecida Exitosamente</h1>
          <p>Hola ${user.nombre},</p>
          <p>Tu contraseña ha sido restablecida correctamente.</p>
          <p>Si no realizaste esta acción, por favor contacta a soporte inmediatamente.</p>
          <a href="${process.env.CLIENT_URL}/login" style="padding: 10px 15px; background-color: #800020; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">Iniciar sesión</a>
        `
      });
    } catch (emailError) {
      console.error('Error al enviar correo de confirmación:', emailError);
      // Continuamos con la respuesta aunque falle el envío del correo
    }

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña'
    });
  }
}; 