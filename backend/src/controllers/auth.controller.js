const crypto = require('crypto');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendEmail } = require('../utils/email');
const emailConfirmacionAdmin = require('../emails/confirmacionAdmin');
const bcrypt = require('bcryptjs');
const confirmacionTemplate = require('../emails/confirmacionReserva');
const confirmacionAdminTemplate = require('../emails/confirmacionAdmin');
const passwordResetRequestTemplate = require('../emails/passwordResetRequest');
const passwordResetConfirmationTemplate = require('../emails/passwordResetConfirmation');
const adminApprovalRequestTemplate = require('../emails/adminApprovalRequest');
const userAccountApprovedTemplate = require('../emails/userAccountApproved');

// @desc    Registrar un usuario (SOLICITUD DE ACCESO ADMIN)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { nombre, apellidos, email, password, telefono } = req.body;

    // Verificar que el email no existe ya en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Si ya existe Y está confirmado/activo, error normal
      if (existingUser.confirmado || existingUser.role !== 'pendiente_admin') { 
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado o activo'
        });
      } 
      // Si existe pero está pendiente, podríamos reenviar notificación (lógica opcional)
      // Por ahora, lo tratamos como error para evitar duplicados pendientes
      return res.status(400).json({
        success: false,
        message: 'Ya existe una solicitud pendiente para este email.'
      });
    }

    // Crear el usuario con role 'pendiente_admin', sin confirmar
    const user = await User.create({
      nombre,
      apellidos,
      email,
      password,
      telefono,
      role: 'pendiente_admin', // ROL CAMBIADO
      confirmado: false 
    });

    // Generar token de confirmación
    const confirmToken = user.generateConfirmationToken();
    await user.save({ validateBeforeSave: false });

    // Crear URL de APROBACIÓN para el admin
    const approveUrl = `${process.env.ADMIN_PANEL_URL || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/admin'}/aprobar-admin/${confirmToken}`; 

    // Enviar email de notificación al admin
    try {
      const adminEmailString = process.env.ADMIN_EMAIL;
      if (adminEmailString) {
        const adminEmails = adminEmailString.split(',').map(email => email.trim()).filter(email => email); 
        
        if (adminEmails.length > 0) {
            // Usar la plantilla existente para aprobación de admin
            const htmlAdminApproval = adminApprovalRequestTemplate({
              nuevoAdminNombre: `${nombre} ${apellidos}`,
              nuevoAdminEmail: email,
              nuevoAdminTelefono: telefono || 'No especificado',
              token: confirmToken
            });
            
            console.log(`>>> [Auth/Register->AdminApproval] Intentando enviar solicitud de aprobación a admin: ${adminEmails}`);
            await sendEmail({
              to: adminEmails, 
              subject: 'Nueva solicitud de cuenta de Administrador - Hacienda San Carlos Borromeo', // Asunto claro
              html: htmlAdminApproval
            });
            console.log(`Correo de solicitud de cuenta admin enviado a: ${adminEmails.join(', ')}`);
        } else {
            console.warn("ADMIN_EMAIL (registro admin) está configurado pero vacío o inválido.");
        }
      } else {
          console.warn("ADMIN_EMAIL (registro admin) no está configurado.");
      }
      
      // ELIMINADO: No enviar email de bienvenida/aprobación al usuario aquí
      /*
      console.log(`>>> [Auth/Register] Intentando enviar bienvenida a: ${user.email}`);
      await sendEmail({
        to: user.email,
        subject: '¡Tu cuenta ha sido aprobada! - Hacienda San Carlos Borromeo',
        html: userAccountApprovedTemplate({
          nombreUsuario: user.nombre,
          loginUrl: `${process.env.CLIENT_URL}/login`
        })
      });
      */

      // Mensaje al usuario solicitante
      res.status(201).json({
        success: true,
        message: 'Solicitud de acceso enviada correctamente. Un administrador revisará tu petición.'
      });

    } catch (error) {
        console.error('Error durante envío de email de solicitud de registro al admin:', error);
        // Informar al usuario que la solicitud se creó pero hubo un problema con la notificación
        res.status(201).json({
          success: true, 
          message: 'Solicitud enviada, pero hubo un error al notificar al administrador. Por favor, contacte soporte si no recibe aprobación.'
        });
    }
  } catch (error) {
    // Manejar error general de creación de usuario
    console.error('Error al procesar la solicitud de registro:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno al procesar la solicitud.'
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
      // --- Actualizar envío de email al admin principal --- (Manejar múltiples destinatarios)
      const adminEmailString = process.env.ADMIN_EMAIL;
      if (adminEmailString) {
        const adminEmails = adminEmailString.split(',').map(email => email.trim()).filter(email => email);

        if (adminEmails.length > 0) {
            const htmlAdminApproval = adminApprovalRequestTemplate({
              nuevoAdminNombre: `${nombre} ${apellidos}`,
              nuevoAdminEmail: email,
              nuevoAdminTelefono: telefono,
              token: confirmToken
            });
            
            console.log(`>>> [Auth/RegisterAdmin] Intentando enviar solicitud de aprobación a admin: ${adminEmails}`);
            await sendEmail({
              to: adminEmails, // Pasa la matriz de correos
              subject: 'Nueva solicitud de cuenta de administrador - Hacienda San Carlos Borromeo',
              html: htmlAdminApproval
            });
            console.log(`Correo de solicitud de cuenta admin enviado a: ${adminEmails.join(', ')}`);
        } else {
            console.warn("ADMIN_EMAIL (registro admin) está configurado pero vacío o inválido.");
        }
      } else {
          console.warn("ADMIN_EMAIL (registro admin) no está configurado.");
      }
      // --- Fin Actualizar envío de email ---

      res.status(201).json({
        success: true,
        message: 'Solicitud de cuenta de administrador enviada para aprobación.'
      });
    } catch (err) {
      console.error('Error al enviar email de solicitud de cuenta admin:', err);
      
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

// @desc    Confirmar cuenta de usuario (Aprobación por Admin)
// @route   GET /api/auth/confirm/:token
// @access  Public (enlace accedido por Admin)
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
    
    // --- Actualizar envío de email al usuario --- (Usar nueva plantilla)
    try {
      const loginUrl = `${process.env.CLIENT_URL}/login`; // Ajustar si la ruta de login es diferente
      const htmlUserApproved = userAccountApprovedTemplate({
        nombreUsuario: user.nombre,
        loginUrl: loginUrl
      });
      
      console.log(`>>> [Auth/ConfirmAccount] Intentando enviar correo de aprobación al usuario: ${user.email}`);
      await sendEmail({
        to: user.email,
        subject: '¡Tu cuenta ha sido aprobada! - Hacienda San Carlos Borromeo',
        html: htmlUserApproved
      });
    } catch (emailError) {
      console.error('Error al enviar correo de aprobación al usuario:', emailError);
      // No fallar la operación principal si el correo no se envía
    }
    // --- Fin Actualizar envío de email ---
    
    res.status(200).json({
      success: true,
      message: `Cuenta de ${user.email} confirmada exitosamente. Se envió notificación al usuario.`
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
      // No revelar si el usuario existe o no
      return res.status(200).json({
        success: true,
        message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.'
      });
    }

    // Generar token para resetear contraseña
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Crear URL de reseteo
    const resetUrl = `${process.env.CLIENT_URL}/restablecer-contrasena/${resetToken}`;

    console.log(`>>> [Auth/ForgotPass] Intentando enviar email a: ${user.email}`);
    try {
      // --- Actualizar envío de email --- (Usar nueva plantilla)
      const htmlResetRequest = passwordResetRequestTemplate({
          nombreUsuario: user.nombre,
          resetUrl: resetUrl
      });
      
      await sendEmail({
        to: user.email,
        subject: 'Restablecimiento de contraseña - Hacienda San Carlos Borromeo',
        html: htmlResetRequest
      });
      // --- Fin Actualizar envío de email ---

      res.status(200).json({
        success: true,
        message: 'Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.'
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
    user.confirmado = true; // Asegurarse que la cuenta esté confirmada al resetear
    await user.save();

    // --- Actualizar envío de email de confirmación --- (Usar nueva plantilla)
    try {
      const loginUrl = `${process.env.CLIENT_URL}/login`; // Ajustar si es necesario
      const htmlResetConfirmation = passwordResetConfirmationTemplate({
          nombreUsuario: user.nombre,
          loginUrl: loginUrl
      });
      
      console.log(`>>> [Auth/ResetPass] Intentando enviar correo de confirmación de reseteo a: ${user.email}`);
      await sendEmail({
        to: user.email,
        subject: 'Contraseña restablecida - Hacienda San Carlos Borromeo',
        html: htmlResetConfirmation
      });
    } catch (emailError) {
      console.error('Error al enviar correo de confirmación de reseteo:', emailError);
      // Continuamos aunque falle el envío del correo
    }
    // --- Fin Actualizar envío de email ---

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña'
    });
  }
};

// @desc    Aprobar cuenta y asignar rol (Nueva función)
// @route   GET /api/auth/approve/:token?role=...
// @access  Public (enlace accedido por Admin)
exports.approveAccountWithRole = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { role: requestedRole } = req.query;

    // Validar que el rol solicitado sea uno de los permitidos
    // SIMPLIFICADO: Solo permitir 'admin' y 'viewer'
    const allowedRoles = ['admin', 'viewer']; 
    if (!requestedRole || !allowedRoles.includes(requestedRole)) {
      console.log(`Intento de aprobación con rol inválido: ${requestedRole}`);
      const errorUrl = `${process.env.ADMIN_PANEL_URL || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/admin'}/approval-result?success=false&message=${encodeURIComponent('Rol solicitado inválido')}`;
      return res.redirect(errorUrl);
    }

    // Obtener el token hasheado
    const tokenConfirmacion = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con ese token y que no haya expirado
    const user = await User.findOne({
      tokenConfirmacion,
      tokenExpiracion: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`Intento de aprobación con token inválido/expirado: ${token}`);
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    console.log(`Aprobando usuario ${user.email} con rol ${requestedRole}`);

    // Actualizar usuario
    user.confirmado = true;
    user.role = requestedRole; // Asignar el rol solicitado
    user.tokenConfirmacion = undefined;
    user.tokenExpiracion = undefined;
    await user.save();

    // Enviar correo de confirmación al usuario aprobado
    try {
      const loginUrl = `${process.env.CLIENT_URL}/login`; // O la ruta de login correcta
      const htmlUserApproved = userAccountApprovedTemplate({
        nombreUsuario: user.nombre,
        loginUrl: loginUrl,
        rolAsignado: requestedRole // Podríamos añadir el rol al email si quisiéramos
      });

      await sendEmail({
        to: user.email,
        subject: '¡Tu cuenta ha sido aprobada! - Hacienda San Carlos Borromeo',
        html: htmlUserApproved
      });
      console.log(`Correo de aprobación enviado a ${user.email} con rol ${requestedRole}`);
    } catch (emailError) {
      console.error(`Error al enviar correo de aprobación al usuario ${user.email}:`, emailError);
      // No fallar la operación principal si el correo no se envía, pero sí loggearlo
    }

    // REDIRIGIR a una página de éxito en el frontend
    const successUrl = `${process.env.ADMIN_PANEL_URL || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/admin'}/approval-result?success=true&email=${encodeURIComponent(user.email)}&role=${requestedRole}`;
    res.redirect(successUrl);

  } catch (error) {
    console.error('Error al aprobar la cuenta con rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la aprobación'
    });
  }
};

// @desc    Denegar solicitud de cuenta (Nueva función)
// @route   GET /api/auth/deny/:token 
// @access  Public (enlace accedido por Admin, pero la lógica de protegerla estaría en middleware)
exports.denyAccount = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Obtener el token hasheado
    const tokenConfirmacion = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario PENDIENTE con ese token (puede haber expirado o no)
    const user = await User.findOne({
      tokenConfirmacion,
      role: 'pendiente_admin' // Asegurarnos que es una solicitud pendiente
      // No filtramos por expiración, queremos poder denegar incluso si expiró
    });

    if (!user) {
      console.log(`Intento de denegación con token inválido o usuario ya procesado: ${token}`);
      // Podemos devolver un mensaje genérico o indicar que ya no es necesario
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o ya procesada.'
      });
    }

    console.log(`Denegando solicitud de cuenta para ${user.email}`);

    // Eliminar al usuario o marcarlo como denegado
    // Eliminar es más limpio para no guardar datos innecesarios
    await user.deleteOne(); 

    // Opcional: Enviar notificación al admin que hizo clic confirmando la denegación?
    // Opcional: Enviar email al usuario indicando que su solicitud fue rechazada?

    // Redirigir al admin a una página de confirmación de denegación o mostrar mensaje
    // res.redirect(`${process.env.CLIENT_URL}/admin/denial-success?user=${user.email}`);
    
    // REDIRIGIR a una página de éxito/resultado en el frontend
    const denialUrl = `${process.env.ADMIN_PANEL_URL || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/admin'}/approval-result?success=true&denied=true&email=${encodeURIComponent(user.email)}`;
    res.redirect(denialUrl);

  } catch (error) {
    console.error('Error al denegar la solicitud de cuenta:', error);
    // REDIRIGIR a una página de error en el frontend
    const errorUrl = `${process.env.ADMIN_PANEL_URL || (process.env.FRONTEND_URL || 'http://localhost:3000') + '/admin'}/approval-result?success=false&message=${encodeURIComponent('Error interno al procesar la denegación')}`;
    // Asegúrate de que la respuesta aún no se haya enviado
    if (!res.headersSent) {
       res.redirect(errorUrl);
    } else {
       // Si ya se envió, simplemente registra el error adicional
       console.error("Encabezados ya enviados, no se puede redirigir en error de denegación.");
    } 
  }
}; 