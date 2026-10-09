export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD || '';
  const ownerPin = process.env.OWNER_PIN || '';
  if (!ownerEmail || !ownerPassword || !ownerPin) {
    return res.status(503).json({
      error: 'owner_auth_not_configured',
      message: 'Falta configurar el acceso del propietario en las variables privadas de Vercel.'
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { email, password, pin, scope } = body;
  const isPinLogin = typeof pin === 'string' && pin.length > 0;
  const credentialsMatch = isPinLogin
    ? pin === ownerPin
    : typeof email === 'string' &&
      email.trim().toLowerCase() === ownerEmail &&
      typeof password === 'string' &&
      password === ownerPassword;

  if (!credentialsMatch) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Credenciales incorrectas.' });
  }

  const isSuperadmin = scope === 'superadmin';
  return res.status(200).json({
    id: isSuperadmin ? 'owner-superadmin' : 'owner-giovanni',
    negocioId: isSuperadmin ? null : 'giovanni',
    email: ownerEmail,
    nombre: 'Propietario',
    rol: isSuperadmin ? 'superadmin' : 'admin',
    isActive: true
  });
}
