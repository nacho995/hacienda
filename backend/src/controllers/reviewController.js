const Review = require('../models/Review');
const asyncHandler = require('../middleware/async'); // Asumo que tienes un wrapper async
const ErrorResponse = require('../utils/errorResponse'); // Asumo que tienes una clase para errores

// @desc    Obtener todas las reseñas aprobadas
// @route   GET /api/v1/reviews/approved
// @access  Public
exports.getApprovedReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }); // Más recientes primero

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Crear una nueva reseña
// @route   POST /api/v1/reviews
// @access  Public
exports.createReview = asyncHandler(async (req, res, next) => {
  // Extraer datos del body
  const { name, rating, comment } = req.body;

  // Crear reseña (estado por defecto es 'pending')
  const review = await Review.create({
    name,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    data: review,
    message: 'Reseña enviada con éxito. Será revisada por un administrador.'
  });
});

// --- Rutas de Administración --- 

// @desc    Obtener todas las reseñas (para admin)
// @route   GET /api/v1/reviews/admin/all
// @access  Private (Admin)
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  // Podríamos añadir paginación aquí si hay muchas reseñas
  const reviews = await Review.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Actualizar el estado de una reseña (aprobar/rechazar)
// @route   PATCH /api/v1/reviews/admin/:id/status
// @access  Private (Admin)
exports.updateReviewStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body; // Esperamos 'approved' o 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Estado no válido', 400));
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true } // Devuelve el documento actualizado y corre validadores
  );

  if (!review) {
    return next(new ErrorResponse(`Reseña no encontrada con id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review,
    message: `Reseña ${status === 'approved' ? 'aprobada' : 'rechazada'} con éxito.`
  });
});

// @desc    Actualizar el contenido de una reseña
// @route   PUT /api/v1/reviews/admin/:id
// @access  Private (Admin)
exports.updateReview = asyncHandler(async (req, res, next) => {
  // Permitir actualizar nombre, rating, comentario (el estado se maneja aparte)
  const { name, rating, comment } = req.body;
  const fieldsToUpdate = { name, rating, comment };

   // Eliminar campos undefined para no sobreescribir con nada
   Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

  const review = await Review.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new ErrorResponse(`Reseña no encontrada con id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: review,
    message: 'Reseña actualizada con éxito.'
  });
});

// @desc    Eliminar una reseña
// @route   DELETE /api/v1/reviews/admin/:id
// @access  Private (Admin)
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Reseña no encontrada con id ${req.params.id}`, 404));
  }

  // En lugar de eliminar, podríamos marcarla como eliminada
  // review.status = 'deleted';
  // await review.save();
  // O eliminarla directamente:
  await review.deleteOne(); // Usar deleteOne() en Mongoose v6+

  res.status(200).json({
    success: true,
    data: {},
    message: 'Reseña eliminada con éxito.'
  });
}); 