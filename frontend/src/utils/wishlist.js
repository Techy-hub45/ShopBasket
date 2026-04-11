/** Works whether wishlist stores Mongo ids or populated product documents. */
export function wishlistIncludes(wishlist, productId) {
  if (!wishlist?.length || productId == null) return false;
  const pid = String(productId);
  return wishlist.some((w) => {
    const id = typeof w === 'object' && w !== null ? w._id : w;
    return id != null && String(id) === pid;
  });
}
