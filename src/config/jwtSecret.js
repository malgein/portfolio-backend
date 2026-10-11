// Proporciona el secreto JWT tras validar longitud y señales obvias de baja calidad.
export const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET

  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 64) {
    throw new Error('JWT_SECRET must be at least 64 bytes long; use a cryptographically random value')
  }

  if (new Set(secret).size < 16 || /^(.)(\1)+$/.test(secret)) {
    throw new Error('JWT_SECRET is too predictable; use a cryptographically random value')
  }

  return secret
}
