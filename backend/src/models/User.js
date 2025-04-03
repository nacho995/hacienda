const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor, proporcione su nombre'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  apellidos: {
    type: String,
    required: [true, 'Por favor, proporcione sus apellidos'],
    trim: true,
    maxlength: [100, 'Los apellidos no pueden tener más de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor, proporcione un email'],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Por favor, proporcione un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor, proporcione una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  telefono: {
    type: String,
    required: [true, 'Por favor, proporcione un número de teléfono'],
    maxlength: [15, 'El número de teléfono no puede tener más de 15 caracteres']
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede tener más de 200 caracteres']
  },
  role: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  confirmado: {
    type: Boolean,
    default: false
  },
  tokenConfirmacion: String,
  tokenExpiracion: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Encriptar la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Firmar JWT y devolverlo
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Comprobar si la contraseña coincide
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generar token de confirmación
UserSchema.methods.generateConfirmationToken = function() {
  // Generar token
  const confirmToken = require('crypto').randomBytes(20).toString('hex');

  // Guardar token encriptado
  this.tokenConfirmacion = require('crypto')
    .createHash('sha256')
    .update(confirmToken)
    .digest('hex');

  // Establecer expiración (24 horas)
  this.tokenExpiracion = Date.now() + 24 * 60 * 60 * 1000;

  return confirmToken;
};

// Generar token para resetear la contraseña
UserSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = require('crypto').randomBytes(20).toString('hex');

  // Guardar token encriptado
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Establecer expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema); 