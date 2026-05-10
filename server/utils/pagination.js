/**
 * Build a Mongoose-compatible pagination object from query params.
 * @param {{ page?: string, limit?: string }} query
 * @returns {{ skip: number, limit: number, page: number }}
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { skip, limit, page };
};

/**
 * Build the standard paginated response envelope.
 */
export const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
