exports.success = (reply, message = 'Success', data = null, statusCode = 200) => {
  return reply.code(statusCode).send({
    success: true,
    message,
    data
  });
};

exports.error = (reply, message = 'Error', statusCode = 400) => {
  return reply.code(statusCode).send({
    success: false,
    message
  });
};